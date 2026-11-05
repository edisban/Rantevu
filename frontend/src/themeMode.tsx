import { createContext, useContext, useState, type ReactNode } from 'react'

type Mode = 'light' | 'dark'
type Ctx = { mode: Mode; toggle: () => void }
const Ctx = createContext<Ctx>(null!)

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('theme') as Mode) || 'light')
  const toggle = () => { const n = mode === 'light' ? 'dark' : 'light'; setMode(n); localStorage.setItem('theme', n) }
  return <Ctx.Provider value={{ mode, toggle }}>{children}</Ctx.Provider>
}
export const useThemeMode = () => useContext(Ctx)
