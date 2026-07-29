import type {
  AdminResource,
  Country,
  Region,
  WineType,
} from "@/features/admin/adminLookupsApi"

type LookupItem = Country | Region | WineType

type Props = {
  resource: AdminResource
  items: LookupItem[]
  countries: Country[]
  loading: boolean
  onEdit: (item: LookupItem) => void
  onDelete: (item: LookupItem) => void
}

export function AdminLookupList({
  resource,
  items,
  countries,
  loading,
  onEdit,
  onDelete,
}: Props) {
  function subtitle(item: LookupItem) {
    if (resource !== "regions") return null
    if (!("country_id" in item)) return null
    const country = countries.find((c) => c.id === item.country_id)
    return country?.name ?? `Country #${item.country_id}`
  }

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>
          {resource === "countries"
            ? "Countries"
            : resource === "regions"
            ? "Regions"
            : "Wine types"}
        </h2>
        <span>{items.length} items</span>
      </div>

      <div className="admin-card__body admin-list-wrap">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">No items yet.</div>
        ) : (
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id} className="admin-list__item">
                <div>
                  <strong>{item.name}</strong>
                  {subtitle(item) && <p>{subtitle(item)}</p>}
                </div>

                <div className="admin-list__actions">
                  <button type="button" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}