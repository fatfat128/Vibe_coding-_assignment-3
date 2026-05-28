import { supabase, API_BASE_URL } from './supabase'

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return session ? { Authorization: `Bearer ${session.access_token}` } : {}
}

export interface ApiItem {
  id: string
  owner_id: string
  name: string
  condition: 'Good' | 'Fair' | 'Poor'
  suburb: string
  pickup_window?: string | null
  item_size?: string | null
  still_available: boolean
  remarks?: string | null
  photo_url?: string | null
  lat?: number | null
  lng?: number | null
  claimed_by?: string | null
  claimed_at?: string | null
  created_at: string
}

export async function listItems(suburb?: string): Promise<ApiItem[]> {
  const url = suburb
    ? `${API_BASE_URL}/items?suburb=${encodeURIComponent(suburb)}`
    : `${API_BASE_URL}/items`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`listItems failed: ${r.status}`)
  return r.json()
}

export async function createItem(payload: Partial<ApiItem>): Promise<ApiItem> {
  const r = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`createItem failed: ${r.status} ${await r.text()}`)
  return r.json()
}

export async function claimItem(id: string): Promise<ApiItem> {
  const r = await fetch(`${API_BASE_URL}/items/${id}/claim`, {
    method: 'POST',
    headers: { ...(await authHeader()) },
  })
  if (!r.ok) throw new Error(`claimItem failed: ${r.status}`)
  return r.json()
}

export async function reportStatus(id: string, status: string) {
  const r = await fetch(`${API_BASE_URL}/items/${id}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ status }),
  })
  if (!r.ok) throw new Error(`reportStatus failed: ${r.status}`)
  return r.json()
}

export async function upsertProfile(payload: { full_name?: string; suburb?: string; consent_given?: boolean }) {
  const r = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`upsertProfile failed: ${r.status}`)
  return r.json()
}

export async function adminSignup(payload: {
  email: string
  password: string
  full_name?: string
  consent_given?: boolean
}) {
  const r = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await r.json()
  if (!r.ok) {
    throw new Error(data.detail || `Signup failed: ${r.status}`)
  }
  return data
}

export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('item-photos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('item-photos').getPublicUrl(path)
  return data.publicUrl
}
