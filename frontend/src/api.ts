import type { AuthResponse } from './types'

type Options = { method?: string; body?: string; headers?: Record<string, string> }

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers }
  })
  if (res.status === 401 && token) {
    // Session expired: drop it and send the user back to sign in
    logoutLocal()
    window.location.href = '/auth'
  }
  if (!res.ok) {
    const text = await res.text()
    let message = text
    try { message = JSON.parse(text).message || text } catch { /* plain text body */ }
    throw new Error(message || res.statusText)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e))

export function saveSession(res: AuthResponse) {
  localStorage.setItem('token', res.token)
  localStorage.setItem('role', res.role)
  localStorage.setItem('userId', String(res.userId))
  localStorage.setItem('fullName', res.fullName || '')
}

export function logoutLocal() {
  for (const k of ['token', 'role', 'userId', 'fullName']) localStorage.removeItem(k)
}

const post = (path: string, body: unknown) => api<AuthResponse>(path, { method: 'POST', body: JSON.stringify(body) })

export const auth = {
  registerClient: (d: unknown) => post('/api/auth/register/client', d),
  registerProvider: (d: unknown) => post('/api/auth/register/provider', d),
  login: (d: unknown) => post('/api/auth/login', d),
}
