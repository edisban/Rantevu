import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

const respond = (status: number, body: string, type = 'text/html') =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status, headers: { 'Content-Type': type } })))

afterEach(() => vi.unstubAllGlobals())

describe('api errors', () => {
  it('passes on the message from our JSON error responses', async () => {
    respond(400, JSON.stringify({ message: 'This time slot is already taken' }), 'application/json')
    await expect(api('/api/appointments/mine')).rejects.toThrow('This time slot is already taken')
  })

  it('never shows a proxy error page, only a readable message', async () => {
    respond(502, '<html><head><title>502 Bad Gateway</title></head><body>nginx</body></html>')
    await expect(api('/api/providers')).rejects.toThrow(/^serverUnavailable$/)
  })

  it('uses a generic message when an error has no body', async () => {
    respond(404, '')
    await expect(api('/api/providers')).rejects.toThrow(/^requestFailed$/)
  })
})
