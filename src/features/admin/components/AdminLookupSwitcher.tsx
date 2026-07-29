import type { AdminResource } from "@/features/admin/adminLookupsApi"

type Props = {
  value: AdminResource
  onChange: (value: AdminResource) => void
}

const OPTIONS: { value: AdminResource; label: string }[] = [
  { value: "countries", label: "Countries" },
  { value: "regions", label: "Regions" },
  { value: "wine-types", label: "Wine types" },
]

export function AdminLookupSwitcher({ value, onChange }: Props) {
  return (
    <div className="admin-switcher" role="tablist" aria-label="Lookup resources">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}