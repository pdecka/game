function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function downloadBlob(filename: string, type: string, body: BlobPart) {
  const blob = new Blob([body], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadExcel(filename: string, title: string, headers: string[], rows: Array<Array<string | number>>) {
  const head = headers.map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join('')
  const body = rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          const numeric = typeof cell === 'number' && Number.isFinite(cell)
          const type = numeric ? 'Number' : 'String'
          return `<Cell><Data ss:Type="${type}">${xmlEscape(String(cell ?? ''))}</Data></Cell>`
        })
        .join('')
      return `<Row>${cells}</Row>`
    })
    .join('')
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Report"><Table>
<Row><Cell><Data ss:Type="String">${xmlEscape(title)}</Data></Cell></Row>
<Row>${head}</Row>
${body}
</Table></Worksheet></Workbook>`
  downloadBlob(filename, 'application/vnd.ms-excel', xml)
}

export function downloadPdf(filename: string, title: string, headers: string[], rows: string[][]) {
  const pageWidth = 842
  const pageHeight = 595
  const margin = 28
  const fontSize = 8
  const lineHeight = 14
  const rowsPerPage = 32
  const chunks: string[][][] = []
  const source = rows.length ? rows : []
  for (let index = 0; index < Math.max(source.length, 1); index += rowsPerPage) {
    chunks.push(source.slice(index, index + rowsPerPage))
  }
  const colWidth = (pageWidth - margin * 2) / Math.max(headers.length, 1)
  const fit = (value: string) => {
    const max = Math.max(4, Math.floor(colWidth / 4.4))
    const text = String(value ?? '')
    return text.length > max ? `${text.slice(0, Math.max(1, max - 3))}...` : text
  }
  const streams = chunks.map((chunk, pageIndex) => {
    const lines = [
      'BT',
      '/F1 14 Tf',
      `${margin} ${pageHeight - 36} Td`,
      `(${pdfEscape(title)}) Tj`,
      '/F1 8 Tf',
      `0 -22 Td`,
      `(${pdfEscape(`Page ${pageIndex + 1} of ${chunks.length}`)}) Tj`,
      'ET',
    ]
    const drawRow = (cells: string[], y: number, bold = false) => {
      cells.forEach((cell, index) => {
        lines.push('BT')
        lines.push(`/F1 ${bold ? 9 : fontSize} Tf`)
        lines.push(`${margin + index * colWidth} ${y} Td`)
        lines.push(`(${pdfEscape(fit(cell))}) Tj`)
        lines.push('ET')
      })
    }
    let y = pageHeight - 72
    drawRow(headers, y, true)
    y -= lineHeight
    for (const row of chunk) {
      drawRow(row, y)
      y -= lineHeight
    }
    return lines.join('\n')
  })

  const objects: string[] = []
  const pageIds: number[] = []
  streams.forEach((stream, index) => {
    const contentId = 3 + index * 2
    const pageId = contentId + 1
    pageIds.push(pageId)
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 1 0 R >> >> >>`
  })
  objects[1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objects[2] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`
  const catalogId = 3 + streams.length * 2
  objects[catalogId] = '<< /Type /Catalog /Pages 2 0 R >>'

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let id = 1; id <= catalogId; id += 1) {
    offsets[id] = pdf.length
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const xref = pdf.length
  pdf += `xref\n0 ${catalogId + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let id = 1; id <= catalogId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer << /Size ${catalogId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
  downloadBlob(filename, 'application/pdf', pdf)
}
