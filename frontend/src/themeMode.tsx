import { createContext, useContext, useState } from 'react'

const Ctx = createContext<any>(null)
export function ThemeModeProvider({ children }: any) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'light')
  const toggle = () => { const n = mode === 'light' ? 'dark' : 'light'; setMode(n); localStorage.setItem('theme', n) }
  return <Ctx.Provider value={{ mode, toggle }}>{children}</Ctx.Provider>
}
export const useThemeMode = () => useContext(Ctx)
