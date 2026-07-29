import { useEffect, useMemo, useState } from "react"

type AdminResource = "countries" | "regions" | "wine-types"

type Country = {
  id: number
  name: string
}

type Region = {
  id: number
  name: string
  country_id: number
}

type WineType = {
  id: number
  name: string
}

type LookupItem = Country | Region | WineType

const API_BASE = import.meta.env.VITE_API_URL

export function AdminLookupsPage() {
  const [active, setActive] = useState<AdminResource>("countries")
  const [items, setItems] = useState<LookupItem[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingItem, setEditingItem] = useState<LookupItem | null>(null)
  const [name, setName] = useState("")
  const [regionCountryId, setRegionCountryId] = useState<number | "">("")

  const title = useMemo(() => {
    if (active === "countries") return "Countries"
    if (active === "regions") return "Regions"
    return "Wine types"
  }, [active])

  async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Request failed: ${res.status}`)
    }

    if (res.status === 204) return null as T
    return res.json()
  }

  async function loadActive() {
    setLoading(true)
    setError(null)

    try {
      if (active === "countries") {
        const data = await fetchJson<Country[]>("/admin/countries")
        setItems(data)
      } else if (active === "regions") {
        const [regions, countriesData] = await Promise.all([
          fetchJson<Region[]>("/admin/regions"),
          fetchJson<Country[]>("/admin/countries"),
        ])
        setItems(regions)
        setCountries(countriesData)
      } else {
        const data = await fetchJson<WineType[]>("/admin/wine-types")
        setItems(data)
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
    setName("")
    setRegionCountryId("")
  }

  function startEdit(item: LookupItem) {
    setEditingItem(item)
    setName(item.name)

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
          await fetchJson(`/admin/countries/${editingItem.id}`, {
            method: "PATCH",
            body: JSON.stringify({ name }),
          })
        } else {
          await fetchJson("/admin/countries", {
            method: "POST",
            body: JSON.stringify({ name }),
          })
        }
      }

      if (active === "wine-types") {
        if (editingItem) {
          await fetchJson(`/admin/wine-types/${editingItem.id}`, {
            method: "PATCH",
            body: JSON.stringify({ name }),
          })
        } else {
          await fetchJson("/admin/wine-types", {
            method: "POST",
            body: JSON.stringify({ name }),
          })
        }
      }

      if (active === "regions") {
        if (!regionCountryId) {
          throw new Error("Country is required for regions")
        }

        if (editingItem) {
          await fetchJson(`/admin/regions/${editingItem.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              name,
              country_id: Number(regionCountryId),
            }),
          })
        } else {
          await fetchJson("/admin/regions", {
            method: "POST",
            body: JSON.stringify({
              name,
              country_id: Number(regionCountryId),
            }),
          })
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
        await fetchJson(`/admin/countries/${item.id}`, { method: "DELETE" })
      } else if (active === "regions") {
        await fetchJson(`/admin/regions/${item.id}`, { method: "DELETE" })
      } else {
        await fetchJson(`/admin/wine-types/${item.id}`, { method: "DELETE" })
      }

      await loadActive()
      if (editingItem?.id === item.id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  function renderSubtitle(item: LookupItem) {
    if (active !== "regions") return null
    if (!("country_id" in item)) return null

    const country = countries.find((c) => c.id === item.country_id)
    return country?.name ?? `Country #${item.country_id}`
  }

  return (
    <section className="admin-lookups">
      <div className="admin-lookups__header">
        <div>
          <h1>Admin lookups</h1>
          <p>Manage one lookup list at a time and switch between resource types.</p>
        </div>
      </div>

      <div className="admin-switcher" role="tablist" aria-label="Lookup type">
        {(["countries", "regions", "wine-types"] as AdminResource[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            className={active === key ? "is-active" : ""}
            onClick={() => setActive(key)}
          >
            {key === "countries" ? "Countries" : key === "regions" ? "Regions" : "Wine types"}
          </button>
        ))}
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <h2>{title}</h2>
            <span>{items.length} items</span>
          </div>

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
                    {renderSubtitle(item) && <p>{renderSubtitle(item)}</p>}
                  </div>

                  <div className="admin-list__actions">
                    <button type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card__head">
            <h2>{editingItem ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</h2>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${title.toLowerCase()} name`}
                required
              />
            </label>

            {active === "regions" && (
              <label>
                Country
                <select
                  value={regionCountryId}
                  onChange={(e) =>
                    setRegionCountryId(e.target.value ? Number(e.target.value) : "")
                  }
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
              <button type="submit">
                {editingItem ? "Save changes" : "Create"}
              </button>
              {editingItem && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}