import { useEffect, useState } from "react"
import {
  adminLookupsApi,
  type AdminResource,
  type Country,
  type Region,
  type WineType,
  type Wine, type TasteProfile,
} from "@/features/admin/adminLookupsApi.ts"
import { AdminLookupSwitcher } from "@/features/admin/components/AdminLookupSwitcher.tsx"
import { AdminLookupList } from "@/features/admin/components/AdminLookupList.tsx"
import { AdminLookupForm } from "@/features/admin/components/AdminLookupForm.tsx"
import { useAuthStore } from "@/store/authStore.ts"
import {AdminWineForm} from "@/features/admin/components/AdminWineForm.tsx";

type LookupItem = Country | Region | WineType | Wine

export function AdminLookupsPage() {
  const user = useAuthStore((state) => state.user)

  const [active, setActive] = useState<AdminResource>("countries")
  const [items, setItems] = useState<LookupItem[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [wineTypes, setWineTypes] = useState<WineType[]>([])
  const [tasteProfiles, setTasteProfiles] = useState<TasteProfile[]>([]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingItem, setEditingItem] = useState<LookupItem | null>(null)
  const [editingName, setEditingName] = useState("")
  const [regionCountryId, setRegionCountryId] = useState<number | "">("")

  const [winePage, setWinePage] = useState(1)
  const pageSize = 50
  const [wineTotal, setWineTotal] = useState(0)

  const totalPages = Math.ceil(wineTotal / pageSize)


  async function loadCountries() {
    const data = await adminLookupsApi.listCountries()
    setCountries(data)
    return data
  }

  async function loadActive() {
    setLoading(true)
    setError(null)

    try {
      if (active === "countries") {
        setItems(await adminLookupsApi.listCountries())
      } else if (active === "regions") {
        const [regionsData, countriesData] = await Promise.all([
          adminLookupsApi.listRegions(),
          loadCountries(),
        ])
        setItems(regionsData)
        setRegions(regionsData)
        setCountries(countriesData)
      } else if (active === "wine-types") {
        const wineTypesData = await adminLookupsApi.listWineTypes()
        setItems(wineTypesData)
        setWineTypes(wineTypesData)
      } else if (active === "wines") {
        const [countriesData, regionsData, wineTypesData, tasteProfilesData, winesData] =
          await Promise.all([
            adminLookupsApi.listCountries(),
            adminLookupsApi.listRegions(),
            adminLookupsApi.listWineTypes(),
            adminLookupsApi.listTasteProfiles(),
            adminLookupsApi.listWines({
              limit: pageSize,
              offset: (winePage - 1) * pageSize,
            }),
          ])

        setCountries(countriesData)
        setRegions(regionsData)
        setWineTypes(wineTypesData)
        setTasteProfiles(tasteProfilesData)
        setItems(winesData.items)
        setWineTotal(winesData.total)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActive()
    resetForm()
  }, [active, winePage])

  function resetForm() {
    setEditingItem(null)
    setEditingName("")
    setRegionCountryId("")
  }

  function handleEdit(item: LookupItem) {
    setEditingItem(item)
    setEditingName(item.name)

    if (active === "regions" && "country_id" in item) {
      setRegionCountryId(item.country_id)
    } else {
      setRegionCountryId("")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      if (active === "countries") {
        if (editingItem) {
          await adminLookupsApi.updateCountry(editingItem.id, { name: editingName })
        } else {
          await adminLookupsApi.createCountry({ name: editingName })
        }
      }

      if (active === "regions") {
        if (!regionCountryId) {
          throw new Error("Country is required")
        }

        if (editingItem) {
          await adminLookupsApi.updateRegion(editingItem.id, {
            name: editingName,
            country_id: Number(regionCountryId),
          })
        } else {
          await adminLookupsApi.createRegion({
            name: editingName,
            country_id: Number(regionCountryId),
          })
        }
      }

      if (active === "wine-types") {
        if (editingItem) {
          await adminLookupsApi.updateWineType(editingItem.id, { name: editingName })
        } else {
          await adminLookupsApi.createWineType({ name: editingName })
        }
      }

      await loadActive()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  async function handleWineSave(payload: {
    name: string
    year: number | null
    alc_perc: number | null
    capacity_ml: number | null
    country_id: number | null
    region_id: number | null
    wine_type_id: number | null
    taste_profile_id: number | null
  }) {
    setError(null)
    try {
      if (editingItem && "id" in editingItem) {
        await adminLookupsApi.updateWine(editingItem.id, payload)
      } else {
        await adminLookupsApi.createWine(payload)
      }
      await loadActive()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  async function handleDelete(item: LookupItem) {
    const confirmed = window.confirm(`Delete "${item.name}"?`)
    if (!confirmed) return

    setError(null)

    try {
      if (active === "countries") {
        await adminLookupsApi.deleteCountry(item.id)
      } else if (active === "regions") {
        await adminLookupsApi.deleteRegion(item.id)
      } else if (active === "wine-types") {
        await adminLookupsApi.deleteWineType(item.id)
      } else if (active === "wines") {
        await adminLookupsApi.deleteWine(item.id)
      }

      await loadActive()

      if (editingItem?.id === item.id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  if (!user) {
    return <div className="admin-page-state">You need to be logged in.</div>
  }

  if (!user.is_superuser) {
    return <div className="admin-page-state">You do not have admin access.</div>
  }
// min-h-screen flex flex-col bg-gray-900 text-white
  return (
    <section className="min-h-screen  px-6 py-6 ">
      <header className="mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Admin lookups
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage one lookup list at a time.
          </p>
        </div>
      </header>

      <AdminLookupSwitcher value={active} onChange={setActive} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(360px,0.9fr)]">
        <div className="space-y-4">
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <AdminLookupList
              resource={active}
              items={items}
              countries={countries}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {active === "wines" && totalPages > 1 && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">              <button
                type="button"
                onClick={() => setWinePage((p) => Math.max(1, p - 1))}
                disabled={winePage === 1}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <span className="font-medium">
                Page {winePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setWinePage((p) => Math.min(totalPages, p + 1))}
                disabled={winePage === totalPages}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div>
          {active === "wines" ? (
            <AdminWineForm
              editingWine={
                editingItem && "year" in editingItem ? (editingItem as Wine) : null
              }
              countries={countries}
              regions={regions}
              wineTypes={wineTypes}
              tasteProfiles={tasteProfiles}
              onSave={handleWineSave}
              onCancel={resetForm}
            />
          ) : (
            <AdminLookupForm
              resource={active}
              countries={countries}
              editingName={editingName}
              setEditingName={setEditingName}
              regionCountryId={regionCountryId}
              setRegionCountryId={setRegionCountryId}
              isEditing={!!editingItem}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
    </section>
  )
}