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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <span className="text-sm text-slate-500">{items.length} items</span>
      </div>

      <div className="max-h-[620px] overflow-auto px-6 py-4">
        {resource === "wines" ? (
          <div
            className={[
              "relative overflow-auto rounded-xl border border-slate-200",
              loading ? "opacity-70" : "",
            ].join(" ")}
          >
            {items.length ? (
              <table className="min-w-full border-collapse text-sm text-slate-500">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Year</th>
                    <th className="px-3 py-3 font-medium">Alcohol</th>
                    <th className="px-3 py-3 font-medium">Volume</th>
                    <th className="px-3 py-3 font-medium">Country</th>
                    <th className="px-3 py-3 font-medium">Region</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Taste profile</th>
                    <th className="px-3 py-3 font-medium">Votes</th>
                    <th className="px-3 py-3 font-medium">Taste avg</th>
                    <th className="px-3 py-3 font-medium">Comments</th>
                    <th className="px-3 py-3 font-medium">Rating avg</th>
                    <th className="px-3 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => {
                    const wine = item as Wine
                    return (
                      <tr key={wine.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <a
                            className="font-medium text-teal-700 hover:underline"
                            href={wineUrl(wine)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {wine.name}
                          </a>
                        </td>
                        <td className="px-3 py-3">{wine.year ?? "—"}</td>
                        <td className="px-3 py-3">{wine.alc_perc ?? "—"}</td>
                        <td className="px-3 py-3">{wine.capacity_ml ?? "—"}</td>
                        <td className="px-3 py-3">{wine.country ?? "—"}</td>
                        <td className="px-3 py-3">{wine.region ?? "—"}</td>
                        <td className="px-3 py-3">{wine.wine_type ?? "—"}</td>
                        <td className="px-3 py-3">{wine.taste_profile ?? "—"}</td>
                        <td className="px-3 py-3">{wine.taste_votes_count ?? "—"}</td>
                        <td className="px-3 py-3">{wine.taste_average ?? "—"}</td>
                        <td className="px-3 py-3">{wine.comments_count ?? "—"}</td>
                        <td className="px-3 py-3">{wine.rating_average ?? "—"}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(wine)}
                              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(wine)}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-sm text-slate-500">No items yet.</div>
            )}
          </div>
        ) : loading ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Loading…
          </div>
        ) : !items.length ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No items yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </div>
                  {subtitle(item) && (
                    <div className="mt-1 text-sm text-slate-500">
                      {subtitle(item)}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                  >
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