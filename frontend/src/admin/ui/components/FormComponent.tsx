'use client'

interface Field {
  label: string
  type?: string
  placeholder?: string
}

export default function FormComponent({ fields }: { fields: Field[] }) {
  return (
    <form className="space-y-3">
      {fields.map((field) => (
        <div key={field.label}>
          <label className="block text-sm text-[#64748b] mb-1">{field.label}</label>
          <input
            type={field.type || 'text'}
            placeholder={field.placeholder || ''}
            className="w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
          />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="rounded-lg px-3 py-2 bg-[#e2e8f0] hover:opacity-90 text-[#020617] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg px-3 py-2 bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium transition-all duration-200"
        >
          Save
        </button>
      </div>
    </form>
  )
}

