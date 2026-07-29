import { useEffect, useState } from "react"
import {
  adminLookupsApi,
  type AdminResource,
  type Country,
  type Region,
  type WineType,
} from "@/features/admin/adminLookupsApi"
import { AdminLookupSwitcher } from "@/features/admin/components/AdminLookupSwitcher"
import { AdminLookupList } from "@/features/admin/components/AdminLookupList"
import { AdminLookupForm } from "@/features/admin/components/AdminLookupForm"
import { useAuthStore } from "@/store/authStore"
import "@/features/admin/admin-lookups.css"

type LookupItem = Country | Region | WineType

export function AdminLookupsPage() {
  const user = useAuthStore((state) => state.user)

  const [active, setActive] = useState<AdminResource>("countries")
  const [items, setItems] = useState<LookupItem[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingItem, setEditingItem] = useState<LookupItem | null>(null)
  const [editingName, setEditingName] = useState("")
  const [regionCountryId, setRegionCountryId] = useState<number | "">("")

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
        const [regions, countriesData] = await Promise.all([
          adminLookupsApi.listRegions(),
          loadCountries(),
        ])
        setItems(regions)
        setCountries(countriesData)
      } else {
        setItems(await adminLookupsApi.listWineTypes())
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
  }, [active])

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

  async function handleDelete(item: LookupItem) {
    const confirmed = window.confirm(`Delete "${item.name}"?`)
    if (!confirmed) return

    setError(null)

    try {
      if (active === "countries") {
        await adminLookupsApi.deleteCountry(item.id)
      } else if (active === "regions") {
        await adminLookupsApi.deleteRegion(item.id)
      } else {
        await adminLookupsApi.deleteWineType(item.id)
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

  return (
    <section className="admin-lookups-page">
      <header className="admin-lookups-page__header">
        <div>
          <h1>Admin lookups</h1>
          <p>Manage one lookup list at a time.</p>
        </div>
      </header>

      <AdminLookupSwitcher value={active} onChange={setActive} />

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-grid">
        <AdminLookupList
          resource={active}
          items={items}
          countries={countries}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
      </div>
    </section>
  )
}