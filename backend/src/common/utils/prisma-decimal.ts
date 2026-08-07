/** Convert Prisma Decimal / string / number to a plain JS number for API responses. */
export function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(String(value));
}

/** Recursively convert known Decimal-like fields on an object for API stability. */
export function serializeMoney<T extends Record<string, any>>(row: T | null | undefined): T | null {
  if (!row) return null;
  const out: any = { ...row };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v != null && typeof v === 'object' && typeof v.toString === 'function' && v.constructor?.name === 'Decimal') {
      out[key] = parseFloat(v.toString());
    }
  }
  return out;
}
