import { createTheme } from '@mui/material'

// Brand: a deep cherry burgundy (in the spirit of the iPhone 18 Pro "Burgundy") on warm beige.
// Plain-CSS uses of these colors (aurora, gradients, intro) live as custom properties in index.css.
export const BRAND = {
  burgundy: '#6b1426',
  burgundyLight: '#f1b6c2',
  sand: '#8a6a48',
  sandLight: '#e8d3b7',
  bgLight: '#f4ede3',
  bgDark: '#120a0c',
}

export function buildTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark'
  const glass = dark ? 'rgba(36, 15, 21, 0.55)' : 'rgba(255, 252, 248, 0.62)'
  const glassStrong = dark ? 'rgba(36, 15, 21, 0.92)' : 'rgba(255, 252, 248, 0.92)'
  const border = dark ? 'rgba(232, 211, 183, 0.14)' : 'rgba(255, 255, 255, 0.9)'
  const shadow = dark ? '0 10px 40px -10px rgba(0, 0, 0, 0.6)' : '0 10px 40px -12px rgba(74, 20, 34, 0.2)'
  const blur = 'blur(20px) saturate(160%)'

  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? BRAND.burgundyLight : BRAND.burgundy, contrastText: '#ffffff' },
      secondary: { main: dark ? BRAND.sandLight : BRAND.sand },
      info: { main: dark ? BRAND.sandLight : BRAND.sand },
      success: { main: dark ? '#4ade80' : '#16a34a' },
      warning: { main: dark ? '#fbbf24' : '#b45309' },
      error: { main: dark ? '#f87171' : '#dc2626' },
      background: { default: dark ? BRAND.bgDark : BRAND.bgLight, paper: glass },
      text: dark ? { primary: '#f3e9e4', secondary: '#b9a6a2' } : { primary: '#24151a', secondary: '#6f5d58' },
      divider: dark ? 'rgba(232, 211, 183, 0.14)' : 'rgba(36, 21, 26, 0.09)',
    },
    shape: { borderRadius: 4 }, // sx radius units are 4px
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.035em' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontWeight: 800, letterSpacing: '-0.03em' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 18, backgroundImage: 'none', backgroundColor: glass, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}`, boxShadow: shadow },
        },
      },
      MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { borderRadius: 22 } } },
      MuiDialog: { styleOverrides: { paper: { backgroundColor: glassStrong, borderRadius: 24 } } },
      MuiMenu: { styleOverrides: { paper: { backgroundColor: glassStrong } } },
      MuiAutocomplete: { styleOverrides: { paper: { backgroundColor: glassStrong } } },
      MuiBackdrop: {
        styleOverrides: {
          root: { '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(18, 8, 11, 0.45)', backdropFilter: 'blur(6px)' } },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingInline: 18,
            transition: 'transform .15s ease, filter .2s ease, box-shadow .2s ease',
            '&:active': { transform: 'scale(0.98)' },
            '&.MuiButton-contained.MuiButton-colorPrimary': {
              background: 'var(--brand-gradient)',
              color: '#fff',
              boxShadow: '0 10px 24px -10px var(--brand-glow)',
              '&:hover': { filter: 'brightness(1.12)', boxShadow: '0 14px 30px -10px var(--brand-glow)' },
              '&.Mui-disabled': { opacity: 0.5, color: '#fff' },
            },
          },
          outlined: { borderColor: border, backgroundColor: dark ? 'rgba(36, 15, 21, 0.35)' : 'rgba(255, 255, 255, 0.5)', backdropFilter: blur },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: dark ? 'rgba(18, 8, 11, 0.35)' : 'rgba(255, 255, 255, 0.7)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: dark ? 'rgba(232, 211, 183, 0.2)' : 'rgba(36, 21, 26, 0.12)' },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 10 } } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 14, backdropFilter: blur } } },
    },
  })
}
