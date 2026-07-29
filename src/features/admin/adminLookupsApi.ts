import { useAuthStore } from "@/store/authStore"

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

export type Country = {
  id: number
  name: string
}

export type Region = {
  id: number
  name: string
  country_id: number
}

export type WineType = {
  id: number
  name: string
}

export type AdminResource = "countries" | "regions" | "wine-types"

type RequestOptions = RequestInit & {
  bodyJson?: unknown
}

async function adminRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token

  const headers: HeadersInit = {
    ...(options.bodyJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.bodyJson ? JSON.stringify(options.bodyJson) : options.body,
  })

  if (!response.ok) {
    let message = `Request failed: ${response.status}`
    try {
      const data = await response.json()
      message = data.detail ?? message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

export const adminLookupsApi = {
  listCountries: () => adminRequest<Country[]>("/admin/countries"),
  createCountry: (payload: { name: string }) =>
    adminRequest<Country>("/admin/countries", {
      method: "POST",
      bodyJson: payload,
    }),
  updateCountry: (id: number, payload: { name?: string }) =>
    adminRequest<Country>(`/admin/countries/${id}`, {
      method: "PATCH",
      bodyJson: payload,
    }),
  deleteCountry: (id: number) =>
    adminRequest<void>(`/admin/countries/${id}`, {
      method: "DELETE",
    }),

  listRegions: () => adminRequest<Region[]>("/admin/regions"),
  createRegion: (payload: { name: string; country_id: number }) =>
    adminRequest<Region>("/admin/regions", {
      method: "POST",
      bodyJson: payload,
    }),
  updateRegion: (id: number, payload: { name?: string; country_id?: number }) =>
    adminRequest<Region>(`/admin/regions/${id}`, {
      method: "PATCH",
      bodyJson: payload,
    }),
  deleteRegion: (id: number) =>
    adminRequest<void>(`/admin/regions/${id}`, {
      method: "DELETE",
    }),

  listWineTypes: () => adminRequest<WineType[]>("/admin/wine-types"),
  createWineType: (payload: { name: string }) =>
    adminRequest<WineType>("/admin/wine-types", {
      method: "POST",
      bodyJson: payload,
    }),
  updateWineType: (id: number, payload: { name?: string }) =>
    adminRequest<WineType>(`/admin/wine-types/${id}`, {
      method: "PATCH",
      bodyJson: payload,
    }),
  deleteWineType: (id: number) =>
    adminRequest<void>(`/admin/wine-types/${id}`, {
      method: "DELETE",
    }),
}