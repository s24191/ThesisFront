import type {
  AdminResource,
  Country,
} from "@/features/admin/adminLookupsApi"

type Props = {
  resource: AdminResource
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
    : resource === "wines"
    ? "wine"
    : "wine type"
  
  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>{isEditing ? `Edit ${singular}` : `New ${singular}`}</h2>
      </div>
      <div className="admin-card__body admin-form-wrap">
      <form className="admin-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder={`Enter ${singular} name`}
            required
          />
        </label>

        {resource === "regions" && (
          <label>
            Country
            <select
              value={regionCountryId}
              onChange={(e) => setRegionCountryId(e.target.value ? Number(e.target.value) : "")}
              required
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

        <div className="admin-form__actions">
          <button type="submit">{isEditing ? "Save changes" : "Create"}</button>
          {isEditing && (
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
      </div>
  )
}