import { StrictMode, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { queryClient } from './queryClient'
import { LangProvider } from './i18n'
import { ThemeModeProvider, useThemeMode } from './themeMode'
import { BRAND, buildTheme } from './theme'
import './index.css'

function ThemedApp() {
  const { mode } = useThemeMode()
  const theme = useMemo(() => buildTheme(mode), [mode])
  // Plain CSS (backdrop, intro, gradients) switches its colors on this attribute
  useEffect(() => {
    document.documentElement.dataset.theme = mode
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? BRAND.bgDark : BRAND.bgLight)
  }, [mode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LangProvider>
        <App />
      </LangProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
