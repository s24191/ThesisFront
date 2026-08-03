import type {
  AdminResource,
  Country,
} from "@/features/admin/adminLookupsApi"

type Props = {
  resource: Exclude<AdminResource, "wines">
  countries: Country[]
  editingName: string
  setEditingName: (value: string) => void
  regionCountryId: number | ""
  setRegionCountryId: (value: number | "") => void
  isEditing: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function AdminLookupForm({
  resource,
  countries,
  editingName,
  setEditingName,
  regionCountryId,
  setRegionCountryId,
  isEditing,
  onSubmit,
  onCancel,
}: Props) {
  const singular =
  resource === "countries"
    ? "country"
    : resource === "regions"
    ? "region"
    : "wine type"

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {isEditing ? `Edit ${singular}` : `New ${singular}`}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder={`Enter ${singular} name`}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>

        {resource === "regions" && (
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Country
            <select
              value={regionCountryId}
              onChange={(e) =>
                setRegionCountryId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
          >
            {isEditing ? "Save changes" : "Create"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}