import type { AuthResponse } from './types'
import { queryClient } from './queryClient'

type Options = { method?: string; body?: string; headers?: Record<string, string> }

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

const readCookie = (name: string) =>
  document.cookie.split('; ').find(c => c.startsWith(name + '='))?.slice(name.length + 1)

// The login token lives in an HttpOnly cookie the browser sends by itself (this code cannot read it).
// Because of that, every state-changing request must prove it comes from our page: Spring Security
// sets a readable rantevu_xsrf cookie and expects its value back in the X-XSRF-TOKEN header.
// (Cookies on localhost are shared by every port, so ours has an app-specific name.)
const CSRF_COOKIE = 'rantevu_xsrf'

async function csrfToken(refresh = false) {
  if (refresh || !readCookie(CSRF_COOKIE)) await fetch('/api/auth/csrf', { credentials: 'same-origin' })
  const value = readCookie(CSRF_COOKIE)
  return value ? decodeURIComponent(value) : undefined
}

async function send(path: string, opts: Options, method: string, refreshCsrf: boolean) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...opts.headers }
  if (!SAFE_METHODS.has(method)) {
    const token = await csrfToken(refreshCsrf)
    if (token) headers['X-XSRF-TOKEN'] = token
  }
  return fetch(path, { ...opts, method, headers, credentials: 'same-origin' })
}

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const method = (opts.method ?? 'GET').toUpperCase()
  let res = await send(path, opts, method, false)
  // A stale CSRF cookie (e.g. cleared by the browser): fetch a fresh one and retry once
  if (res.status === 403 && !SAFE_METHODS.has(method)) res = await send(path, opts, method, true)
  if (res.status === 401 && isSignedIn()) {
    // Session expired: drop it and send the user back to sign in
    clearSession()
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

// Only non-secret details are kept in the browser, to draw the right screens
export const isSignedIn = () => !!localStorage.getItem('role')

export function saveSession(res: AuthResponse) {
  queryClient.clear() // never show one account's cached data to the next
  localStorage.removeItem('token') // left over from before the cookie-based login
  localStorage.setItem('role', res.role)
  localStorage.setItem('userId', String(res.userId))
  localStorage.setItem('fullName', res.fullName || '')
}

export function clearSession() {
  queryClient.clear()
  for (const k of ['token', 'role', 'userId', 'fullName']) localStorage.removeItem(k)
}

// Asks the server to delete the HttpOnly cookie, then forgets the local details
export async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }) } catch { /* already signed out */ } finally { clearSession() }
}

const post = (path: string, body: unknown) => api<AuthResponse>(path, { method: 'POST', body: JSON.stringify(body) })

export const auth = {
  registerClient: (d: unknown) => post('/api/auth/register/client', d),
  registerProvider: (d: unknown) => post('/api/auth/register/provider', d),
  login: (d: unknown) => post('/api/auth/login', d),
}
