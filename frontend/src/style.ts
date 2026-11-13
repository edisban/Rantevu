import type { CSSProperties } from 'react'

// Stagger for the `.reveal` entrance animation (index.css reads --d)
export const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties

// Category chip: its own color fills it on hover and when selected, and the icon grows a little
export function categoryChipSx(color: string, active = false) {
  const filled = { backgroundColor: color, borderColor: color, color: '#fff', '& .MuiChip-icon': { color: '#fff' } }
  return {
    transition: 'background-color .25s ease, color .25s ease, border-color .25s ease, transform .2s ease',
    '& .MuiChip-icon': { color, transition: 'transform .25s cubic-bezier(.3, 1.5, .5, 1), color .2s ease' },
    ...(active ? filled : {}),
    // Doubled selector so it wins over MUI's own hover background
    '&&:hover': { ...filled, transform: 'translateY(-2px)', '& .MuiChip-icon': { color: '#fff', transform: 'scale(1.2)' } },
  }
}
