import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.tsx'
import { LangProvider } from './i18n'
import { ThemeModeProvider, useThemeMode } from './themeMode'

function ThemedApp() {
  const { mode } = useThemeMode()
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#5a1a2c', contrastText: '#fff' },
      secondary: { main: '#8b2e4a' },
      background: mode === 'dark' ? { default: '#0f0a0c', paper: '#1a1214' } : { default: '#faf7f8', paper: '#ffffff' }
    },
    typography: { fontFamily: '"Inter", system-ui, -apple-system, sans-serif', h5: { fontWeight: 600 }, h6: { fontWeight: 600 } },
    shape: { borderRadius: 12 }
  })
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
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  </StrictMode>,
)
