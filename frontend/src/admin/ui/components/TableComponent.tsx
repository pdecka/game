'use client'

import { useMemo, useState } from 'react'

interface TableComponentProps {
  columns: string[]
  rows: string[][]
  onEditRow?: (row: string[], rowIndex: number) => void
}

export default function TableComponent({ columns, rows, onEditRow }: TableComponentProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((r) => r.join(' ').toLowerCase().includes(term))
  }, [rows, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (page - 1) * pageSize
  const pagedRows = filtered.slice(start, start + pageSize)

  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search table..."
          className="w-full sm:max-w-sm rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
        />
        <div className="text-sm text-[#64748b]">Rows: {filtered.length}</div>
      </div>

      {pagedRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#e2e8f0] p-8 text-center text-[#64748b] bg-[#ffffff]">
          No data found
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748b] border-b border-[#e2e8f0] bg-[#e2e8f0]">
                {columns.map((column) => (
                  <th key={column} className="py-3 pr-4 font-medium">
                    {column}
                  </th>
                ))}
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row, idx) => (
                <tr
                  key={`${row[0]}-${idx}`}
                  className="border-b border-[#e2e8f0] text-[#020617] hover:bg-[#e2e8f0]/40 transition-all duration-200"
                >
                  {row.map((cell, cidx) => (
                    <td key={`${cell}-${cidx}`} className="py-3 pr-4 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="rounded-md px-2 py-1 bg-[#e2e8f0] hover:opacity-90 text-[#020617] text-xs transition-all duration-200">
                        View
                      </button>
                      <button
                        className="rounded-md px-2 py-1 bg-[#22c55e] hover:opacity-90 text-[#ffffff] text-xs transition-all duration-200"
                        onClick={() => onEditRow?.(row, start + idx)}
                      >
                        Edit
                      </button>
                      <button className="rounded-md px-2 py-1 bg-[#020617] hover:opacity-90 text-[#ffffff] text-xs transition-all duration-200 border border-[#e2e8f0]">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-md px-3 py-1.5 bg-[#e2e8f0] text-[#020617] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200"
        >
          Prev
        </button>
        <span className="text-sm text-[#64748b]">
          {page} / {pageCount}
        </span>
        <button
          disabled={page === pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          className="rounded-md px-3 py-1.5 bg-[#e2e8f0] text-[#020617] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200"
        >
          Next
        </button>
      </div>
    </div>
  )
}

