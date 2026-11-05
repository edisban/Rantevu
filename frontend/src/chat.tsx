import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import { api } from './api'
import type { ChatMessage } from './types'

type Listener = (m: ChatMessage) => void
type ChatCtx = {
  connected: boolean
  unread: number
  refreshUnread: () => void
  // Register a handler for live messages; returns the unsubscribe function
  onMessage: (l: Listener) => () => void
  // The conversation currently on screen, so its messages don't count as unread
  setOpenPeer: (id: number | null) => void
}
const Ctx = createContext<ChatCtx>(null!)

// Keeps one STOMP connection open while the user is signed in and fans live messages out to the UI
export function ChatProvider({ children }: { children: ReactNode }) {
  useLocation() // re-read the token after sign in / sign out navigations
  const token = localStorage.getItem('token')
  const [connected, setConnected] = useState(false)
  const [unread, setUnread] = useState(0)
  const listeners = useRef(new Set<Listener>())
  const openPeer = useRef<number | null>(null)

  const refreshUnread = useCallback(() => {
    api<{ count: number }>('/api/messages/unread').then(r => setUnread(r.count)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!token) { setUnread(0); return }
    const me = Number(localStorage.getItem('userId'))
    const client = new Client({
      brokerURL: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect: () => {
        setConnected(true)
        refreshUnread() // catch up on anything that arrived while disconnected
        client.subscribe('/user/queue/messages', frame => {
          const m: ChatMessage = JSON.parse(frame.body)
          if (m.receiverId === me && m.senderId !== openPeer.current) setUnread(u => u + 1)
          listeners.current.forEach(l => l(m))
        })
      },
      // A rejected token won't get better by retrying
      onStompError: () => { void client.deactivate() },
      onWebSocketClose: () => setConnected(false),
    })
    client.activate()
    return () => { void client.deactivate(); setConnected(false) }
  }, [token, refreshUnread])

  const onMessage = useCallback((l: Listener) => {
    listeners.current.add(l)
    return () => { listeners.current.delete(l) }
  }, [])
  const setOpenPeer = useCallback((id: number | null) => { openPeer.current = id }, [])

  const value = useMemo(() => ({ connected, unread, refreshUnread, onMessage, setOpenPeer }), [connected, unread, refreshUnread, onMessage, setOpenPeer])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useChat = () => useContext(Ctx)
