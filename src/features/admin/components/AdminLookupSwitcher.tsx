import type {AdminResource} from "@/features/admin/types";

type Props = {
  value: AdminResource
  onChange: (value: AdminResource) => void
}

const OPTIONS: { value: AdminResource; label: string }[] = [
  { value: "countries", label: "Countries" },
  { value: "regions", label: "Regions" },
  { value: "wine-types", label: "Wine types" },
  { value: "wines", label: "Wines" },
]

export function AdminLookupSwitcher({ value, onChange }: Props) {
  return (
    <div
      className="mb-5 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Lookup resources"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={[
              "inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium transition",
              active
                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                : "border-slate-600 bg-slate-900/40 text-slate-200 hover:bg-slate-800",
            ].join(" ")}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}