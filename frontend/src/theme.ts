import { createTheme } from '@mui/material'

// Brand: a vivid burgundy (in the spirit of the iPhone 18 Pro "Burgundy") on warm beige.
// Plain-CSS uses of these colors (backdrop, gradients, intro) live as custom properties in index.css.
export const BRAND = {
  burgundy: '#8c1631',
  // Dark mode's accent: a warm beige that reads on espresso
  burgundyLight: '#e8c9a7',
  sand: '#8a5a30',
  sandLight: '#f3d9bd',
  bgLight: '#f3e8dc',
  bgDark: '#1a1411',
}

// The serif used for the wordmark
export const SERIF = '"Fraunces", Georgia, serif'

// <Paper variant="glass"> is the see-through surface for things that float (the header capsules)
declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides { glass: true }
}

// How much of the backdrop a surface lets through:
// - glass:   liquid glass for floating controls; little blur and boosted color, so the backdrop shows
// - overlay: dialogs and menus; nearly opaque, still softly blurred
// - solid:   content people read (cards, lists, forms); opaque and without backdrop-filter, which
//            keeps text crisp and long lists cheap to scroll on slower phones
type Surface = 'glass' | 'overlay' | 'solid'

const FILL: Record<Surface, [light: string, dark: string]> = {
  glass: ['linear-gradient(180deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.22))', 'linear-gradient(180deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04))'],
  overlay: ['linear-gradient(180deg, rgba(253, 249, 242, 0.95), rgba(250, 243, 233, 0.92))', 'linear-gradient(180deg, rgba(48, 38, 32, 0.95), rgba(38, 30, 25, 0.95))'],
  solid: ['linear-gradient(180deg, rgba(253, 250, 244, 0.97), rgba(250, 244, 235, 0.95))', 'linear-gradient(180deg, rgba(43, 34, 28, 0.97), rgba(35, 27, 22, 0.97))'],
}

// Every surface keeps the liquid-glass rim, so solid cards still match the floating glass
export function liquidGlass(dark: boolean, surface: Surface = 'glass') {
  const lens = surface === 'solid' ? 'none' : dark ? 'blur(10px) saturate(170%)' : 'blur(8px) saturate(135%) brightness(1.04)'
  return {
    position: 'relative',
    isolation: 'isolate',
    backgroundColor: 'transparent',
    backgroundImage: FILL[surface][dark ? 1 : 0],
    backdropFilter: lens,
    WebkitBackdropFilter: lens,
    border: '1px solid transparent',
    boxShadow: dark
      ? 'inset 0 1px 1px rgba(255, 255, 255, 0.22), inset 0 -1px 1px rgba(255, 255, 255, 0.06), 0 16px 36px -16px rgba(0, 0, 0, 0.7)'
      : 'inset 0 1px 1px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.3), 0 14px 34px -16px rgba(70, 8, 26, 0.45)',
    // The rim: a gradient ring drawn by masking out everything but a 1.4px edge
    '&::before': {
      content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', padding: '1.4px', pointerEvents: 'none', zIndex: -1,
      background: dark
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.04) 32%, rgba(255, 255, 255, 0) 55%, rgba(255, 255, 255, 0.3))'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.1) 32%, rgba(255, 255, 255, 0) 55%, rgba(255, 255, 255, 0.75))',
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
    },
    // The glare across the top belongs to see-through glass; on an opaque card it reads as a stray box
    '&::after': surface === 'solid' ? { display: 'none' } : {
      content: '""', position: 'absolute', left: '6%', right: '6%', top: 1, height: '40%', borderRadius: 'inherit', pointerEvents: 'none', zIndex: -1,
      background: `linear-gradient(180deg, rgba(255, 255, 255, ${dark ? 0.07 : 0.3}), rgba(255, 255, 255, 0))`,
    },
  } as const
}

// `reduceTransparency` follows the system setting of the same name: everything becomes solid
export function buildTheme(mode: 'light' | 'dark', reduceTransparency = false) {
  const dark = mode === 'dark'
  const glass = liquidGlass(dark, reduceTransparency ? 'solid' : 'glass')
  const overlay = liquidGlass(dark, reduceTransparency ? 'solid' : 'overlay')
  const solid = liquidGlass(dark, 'solid')

  return createTheme({
    palette: {
      mode,
      // In dark mode the accent is a light rose, so anything drawn on it needs dark text
      primary: { main: dark ? BRAND.burgundyLight : BRAND.burgundy, contrastText: dark ? '#2a1a12' : '#ffffff' },
      secondary: { main: dark ? BRAND.sandLight : BRAND.sand },
      info: { main: dark ? BRAND.sandLight : BRAND.sand },
      success: { main: dark ? '#86efac' : '#15803d' },
      warning: { main: dark ? '#fcd34d' : '#b45309' },
      error: { main: dark ? '#fca5a5' : '#c81e1e' },
      background: { default: dark ? BRAND.bgDark : BRAND.bgLight, paper: dark ? '#2b221c' : '#fbf6ef' },
      // Slightly deeper secondary text: some surfaces let the colorful backdrop through
      text: dark ? { primary: '#f4ece4', secondary: '#cdbdae' } : { primary: '#24101a', secondary: '#4d2a33' },
      divider: dark ? 'rgba(232, 201, 167, 0.16)' : 'rgba(92, 13, 32, 0.14)',
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
        defaultProps: { elevation: 0 },
        // Solid by default (cards, lists, forms); <Paper variant="glass"> for floating controls
        styleOverrides: { root: { borderRadius: 24, ...solid, variants: [{ props: { variant: 'glass' }, style: glass }] } },
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
      MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { borderRadius: 24 } } },
      // Overlays sit on busy content, so they use the denser glass to stay readable
      MuiDialog: { styleOverrides: { paper: { ...overlay, borderRadius: 28 } } },
      MuiMenu: { styleOverrides: { paper: overlay } },
      MuiAutocomplete: { styleOverrides: { paper: overlay } },
      MuiBackdrop: {
        styleOverrides: {
          root: { '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(28, 11, 16, 0.45)', backdropFilter: 'blur(4px)' } },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            // Capsules, as liquid glass controls are
            borderRadius: 999,
            paddingInline: 20,
            transition: 'transform .15s ease, filter .2s ease, box-shadow .2s ease',
            '&:active': { transform: 'scale(0.98)' },
            '&.MuiButton-contained.MuiButton-colorPrimary': {
              background: 'var(--brand-gradient)',
              color: '#fff',
              // Tinted glass: a highlight along the top edge on top of the burgundy
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.15), 0 10px 24px -10px var(--brand-glow)',
              overflow: 'hidden',
              // A streak of light sweeps across on hover
              '&::after': {
                content: '""', position: 'absolute', top: 0, left: '-60%', width: '40%', height: '100%', pointerEvents: 'none',
                background: 'linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.42), transparent)',
                transform: 'skewX(-20deg)', transition: 'left 0.7s ease',
              },
              '&:hover': { filter: 'brightness(1.12)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.15), 0 14px 30px -10px var(--brand-glow)' },
              '&:hover::after': { left: '130%' },
              '&.Mui-disabled': { opacity: 0.5, color: '#fff' },
              '&.Mui-disabled::after': { display: 'none' },
            },
          },
          outlined: glass,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.85)',
            boxShadow: dark ? 'inset 0 1px 2px rgba(0, 0, 0, 0.35)' : 'inset 0 1px 2px rgba(70, 8, 26, 0.1)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: dark ? 'rgba(232, 201, 167, 0.2)' : 'rgba(255, 255, 255, 0.9)' },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 999 } } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
      // Alerts keep their own solid colors rather than the glass every other Paper gets
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 18, backgroundImage: 'none', backdropFilter: 'none', '&::before, &::after': { display: 'none' } },
        },
      },
    },
  })
}
