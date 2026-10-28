const BASE = ''
export async function api(path: string, opts: any = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export const auth = {
  registerClient: (d: any) => api('/api/auth/register/client', { method: 'POST', body: JSON.stringify(d) }),
  registerProvider: (d: any) => api('/api/auth/register/provider', { method: 'POST', body: JSON.stringify(d) }),
  login: (d: any) => api('/api/auth/login', { method: 'POST', body: JSON.stringify(d) })
}
