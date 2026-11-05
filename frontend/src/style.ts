import type { CSSProperties } from 'react'

// Stagger for the `.reveal` entrance animation (index.css reads --d)
export const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties
