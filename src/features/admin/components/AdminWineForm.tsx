import { useEffect, useMemo, useState } from "react"
import type {Country, Region, TasteProfile, Wine, WineType} from "@/features/admin/types";

type WinePayload = {
  name: string
  year: number | null
  alc_perc: number | null
  capacity_ml: number | null
  country_id: number | null
  region_id: number | null
  wine_type_id: number | null
  taste_profile_id: number | null
}

type Props = {
  editingWine: Wine | null
  countries: Country[]
  regions: Region[]
  wineTypes: WineType[]
  tasteProfiles: TasteProfile[]
  onSave: (payload: WinePayload) => Promise<void> | void
  onCancel: () => void
}

function toNumberOrNull(value: string) {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function AdminWineForm({
  editingWine,
  countries,
  regions,
  wineTypes,
  tasteProfiles,
  onSave,
  onCancel,
}: Props) {
  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [alcPerc, setAlcPerc] = useState("")
  const [capacityMl, setCapacityMl] = useState("")
  const [countryId, setCountryId] = useState("")
  const [regionId, setRegionId] = useState("")
  const [wineTypeId, setWineTypeId] = useState("")
  const [tasteProfileId, setTasteProfileId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(editingWine?.name ?? "")
    setYear(editingWine?.year?.toString() ?? "")
    setAlcPerc(editingWine?.alc_perc?.toString() ?? "")
    setCapacityMl(editingWine?.capacity_ml?.toString() ?? "")
    setCountryId(editingWine?.country_id?.toString() ?? "")
    setRegionId(editingWine?.region_id?.toString() ?? "")
    setWineTypeId(editingWine?.wine_type_id?.toString() ?? "")
    setTasteProfileId(editingWine?.taste_profile_id?.toString() ?? "")
    setError(null)
  }, [editingWine])

  const filteredRegions = useMemo(() => {
    if (!countryId) return regions
    return regions.filter((region) => String(region.country_id) === countryId)
  }, [regions, countryId])

  useEffect(() => {
    if (regionId && !filteredRegions.some((region) => String(region.id) === regionId)) {
      setRegionId("")
    }
  }, [filteredRegions, regionId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Wine name is required")
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        year: toNumberOrNull(year),
        alc_perc: toNumberOrNull(alcPerc),
        capacity_ml: toNumberOrNull(capacityMl),
        country_id: toNumberOrNull(countryId),
        region_id: toNumberOrNull(regionId),
        wine_type_id: toNumberOrNull(wineTypeId),
        taste_profile_id: toNumberOrNull(tasteProfileId),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 " +
    "placeholder:text-slate-400 focus:border-teal-500 focus:outline-none" +
    " focus:ring-1 focus:ring-teal-500"

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {editingWine ? "Edit wine" : "New wine"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wine name"
          className={inputClasses}
        />

        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          type="number"
          placeholder="Year"
          className={inputClasses}
        />

        <input
          value={alcPerc}
          onChange={(e) => setAlcPerc(e.target.value)}
          type="number"
          step="0.1"
          placeholder="Alcohol %"
          className={inputClasses}
        />

        <input
          value={capacityMl}
          onChange={(e) => setCapacityMl(e.target.value)}
          type="number"
          placeholder="Capacity (ml)"
          className={inputClasses}
        />

        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className={inputClasses}
        >
          <option value="">Country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>

        <select
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          className={inputClasses}
        >
          <option value="">Region</option>
          {filteredRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>

        <select
          value={wineTypeId}
          onChange={(e) => setWineTypeId(e.target.value)}
          className={inputClasses}
        >
          <option value="">Wine type</option>
          {wineTypes.map((wineType) => (
            <option key={wineType.id} value={wineType.id}>
              {wineType.name}
            </option>
          ))}
        </select>

        <select
          value={tasteProfileId}
          onChange={(e) => setTasteProfileId(e.target.value)}
          className={inputClasses}
        >
          <option value="">Taste profile</option>
          {tasteProfiles.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {tp.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingWine
              ? "Save changes"
              : "Create"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}