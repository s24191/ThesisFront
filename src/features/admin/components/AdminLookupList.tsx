import type {
  AdminResource,
  Country,
  Region,
  WineType,
  Wine
} from "@/features/admin/adminLookupsApi"

type LookupItem = Country | Region | WineType | Wine

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

  function wineUrl(item: LookupItem) {
    return `/wines/${item.id}`
  }

  const title =
    resource === "countries"
      ? "Countries"
      : resource === "regions"
      ? "Regions"
      : resource === "wine-types"
      ? "Wine types"
      : "Wines"

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>{title}</h2>
        <span>{items.length} items</span>
      </div>

      <div className="admin-card__body">
        {resource === "wines" ? (
          <div className={`admin-table-wrap ${loading ? "is-loading" : ""}`}>
            {items.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Alcohol</th>
                    <th>Volume</th>
                    <th>Country</th>
                    <th>Region</th>
                    <th>Type</th>
                    <th>Taste profile</th>
                    <th>Votes</th>
                    <th>Taste avg</th>
                    <th>Comments</th>
                    <th>Rating avg</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const wine = item as Wine
                    return (
                      <tr key={wine.id}>
                        <td>
                          <a className="admin-table__link" href={wineUrl(wine)} target="_blank" rel="noreferrer">
                            {wine.name}
                          </a>
                        </td>
                        <td>{wine.year ?? "—"}</td>
                        <td>{wine.alc_perc ?? "—"}</td>
                        <td>{wine.capacity_ml ?? "—"}</td>
                        <td>{wine.country ?? "—"}</td>
                        <td>{wine.region ?? "—"}</td>
                        <td>{wine.wine_type ?? "—"}</td>
                        <td>{wine.taste_profile ?? "—"}</td>
                        <td>{wine.taste_votes_count ?? "—"}</td>
                        <td>{wine.taste_average ?? "—"}</td>
                        <td>{wine.comments_count ?? "—"}</td>
                        <td>{wine.rating_average ?? "—"}</td>
                        <td className="admin-actions">
                          <button type="button" onClick={() => onEdit(wine)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => onDelete(wine)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="admin-list-state">No items yet.</div>
            )}
          </div>
        ) : loading ? (
          <div className="admin-list-state">Loading…</div>
        ) : !items.length ? (
          <div className="admin-list-state">No items yet.</div>
        ) : (
          <div className="admin-list">
            {items.map((item) => (
              <div key={item.id} className="admin-list-item">
                <div className="admin-list-main">
                  <div className="admin-list-name">{item.name}</div>
                  {subtitle(item) && (
                    <div className="admin-list-subtitle">{subtitle(item)}</div>
                  )}
                </div>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(item)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}