import { createTheme } from '@mui/material'

// Brand: a vivid burgundy (in the spirit of the iPhone 18 Pro "Burgundy") on warm beige.
// Plain-CSS uses of these colors (backdrop, gradients, intro) live as custom properties in index.css.
export const BRAND = {
  burgundy: '#8c1631',
  burgundyLight: '#f5c2cd',
  sand: '#8a5a30',
  sandLight: '#f3d9bd',
  bgLight: '#f4e4d8',
  bgDark: '#1c0b10',
}

// The serif used for the wordmark
export const SERIF = '"Fraunces", Georgia, serif'

export function buildTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark'
  // Quiet glass: mostly opaque panels with a light blur, so text stays crisp over the colored backdrop
  const glass = dark ? 'rgba(52, 20, 30, 0.62)' : 'rgba(255, 250, 246, 0.78)'
  const glassStrong = dark ? 'rgba(40, 15, 23, 0.96)' : 'rgba(255, 250, 246, 0.96)'
  const border = dark ? 'rgba(245, 194, 205, 0.14)' : 'rgba(255, 255, 255, 0.92)'
  const shadow = dark ? '0 12px 34px -18px rgba(0, 0, 0, 0.75)' : '0 10px 30px -18px rgba(92, 13, 32, 0.5)'
  const blur = 'blur(14px) saturate(140%)'

  return createTheme({
    palette: {
      mode,
      // In dark mode the accent is a light rose, so anything drawn on it needs dark text
      primary: { main: dark ? BRAND.burgundyLight : BRAND.burgundy, contrastText: dark ? '#3d0b16' : '#ffffff' },
      secondary: { main: dark ? BRAND.sandLight : BRAND.sand },
      info: { main: dark ? BRAND.sandLight : BRAND.sand },
      success: { main: dark ? '#86efac' : '#15803d' },
      warning: { main: dark ? '#fcd34d' : '#b45309' },
      error: { main: dark ? '#fca5a5' : '#c81e1e' },
      background: { default: dark ? BRAND.bgDark : BRAND.bgLight, paper: glass },
      text: dark ? { primary: '#f6ece8', secondary: '#cdb8b3' } : { primary: '#24151a', secondary: '#5e4a45' },
      divider: dark ? 'rgba(245, 194, 205, 0.14)' : 'rgba(92, 13, 32, 0.14)',
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
          root: { borderRadius: 14, backgroundImage: 'none', backgroundColor: glass, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}`, boxShadow: shadow },
        },
      },
      // Pages fill the window up to 1536px (MUI's xl), so huge screens don't stretch content too far;
      // side padding grows with the screen so content never touches the edges
      MuiContainer: {
        defaultProps: { maxWidth: 'xl' },
        styleOverrides: {
          root: ({ theme }) => ({
            [theme.breakpoints.up('md')]: { paddingLeft: 40, paddingRight: 40 },
            [theme.breakpoints.up('xl')]: { paddingLeft: 64, paddingRight: 64 },
          }),
        },
      },
      MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { borderRadius: 16 } } },
      MuiDialog: { styleOverrides: { paper: { backgroundColor: glassStrong, borderRadius: 18 } } },
      MuiMenu: { styleOverrides: { paper: { backgroundColor: glassStrong } } },
      MuiAutocomplete: { styleOverrides: { paper: { backgroundColor: glassStrong } } },
      MuiBackdrop: {
        styleOverrides: {
          root: { '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(28, 11, 16, 0.5)', backdropFilter: 'blur(6px)' } },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 18,
            transition: 'transform .15s ease, filter .2s ease, box-shadow .2s ease',
            '&:active': { transform: 'scale(0.98)' },
            '&.MuiButton-contained.MuiButton-colorPrimary': {
              background: 'var(--brand-gradient)',
              color: '#fff',
              boxShadow: '0 10px 24px -10px var(--brand-glow)',
              overflow: 'hidden',
              // A streak of light sweeps across on hover
              '&::after': {
                content: '""', position: 'absolute', top: 0, left: '-60%', width: '40%', height: '100%', pointerEvents: 'none',
                background: 'linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.42), transparent)',
                transform: 'skewX(-20deg)', transition: 'left 0.7s ease',
              },
              '&:hover': { filter: 'brightness(1.12)', boxShadow: '0 14px 30px -10px var(--brand-glow)' },
              '&:hover::after': { left: '130%' },
              '&.Mui-disabled': { opacity: 0.5, color: '#fff' },
              '&.Mui-disabled::after': { display: 'none' },
            },
          },
          outlined: { borderColor: border, backgroundColor: dark ? 'rgba(52, 20, 30, 0.45)' : 'rgba(255, 250, 246, 0.6)', backdropFilter: blur },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: dark ? 'rgba(28, 11, 16, 0.45)' : 'rgba(255, 255, 255, 0.78)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: dark ? 'rgba(245, 194, 205, 0.2)' : 'rgba(92, 13, 32, 0.16)' },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12, backdropFilter: blur } } },
    },
  })
}
