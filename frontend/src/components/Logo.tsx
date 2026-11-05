import { useId } from 'react'
import { Box, Typography } from '@mui/material'
import { delay } from '../style'

// Calendar-with-check mark. `animated` draws the strokes (used by the intro splash).
export function LogoMark({ size = 36, animated = false }: { size?: number; animated?: boolean }) {
  const id = useId()
  const draw = animated ? 'draw' : undefined
  if (animated) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop style={{ stopColor: 'var(--brand-a)' }} /><stop offset="0.5" style={{ stopColor: 'var(--brand-b)' }} /><stop offset="1" style={{ stopColor: 'var(--brand-c)' }} />
          </linearGradient>
        </defs>
        <rect className={draw} pathLength={1} x="7" y="12" width="50" height="45" rx="13" stroke={`url(#${id})`} strokeWidth="4.5" />
        <path className={draw} pathLength={1} style={delay(0.35)} d="M21 6v11M43 6v11" stroke={`url(#${id})`} strokeWidth="4.5" strokeLinecap="round" />
        <path className={draw} pathLength={1} style={delay(0.7)} d="M21 35.5l7.5 7.5L44 27.5" stroke={`url(#${id})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: 'var(--brand-a)' }} /><stop offset="0.5" style={{ stopColor: 'var(--brand-b)' }} /><stop offset="1" style={{ stopColor: 'var(--brand-c)' }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${id})`} />
      <rect x="14" y="18" width="36" height="32" rx="9" stroke="#fff" strokeWidth="4" />
      <path d="M24 13v8M40 13v8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M24.5 34l5 5 10-10" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Logo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <LogoMark size={34} />
      <Typography sx={{ fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em', color: 'text.primary' }}>Rantevu</Typography>
    </Box>
  )
}
