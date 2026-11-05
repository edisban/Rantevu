import type { ReactElement, ReactNode } from 'react'
import { Avatar, Box, Chip, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useLang } from '../i18n'
import { categoryOf, initials } from '../categories'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import DoNotDisturbOnRoundedIcon from '@mui/icons-material/DoNotDisturbOnRounded'
import { delay as stagger } from '../style'

const STATUS: Record<string, { color: 'warning' | 'success' | 'error' | 'default'; icon: ReactElement }> = {
  PENDING: { color: 'warning', icon: <HourglassTopRoundedIcon /> },
  ACCEPTED: { color: 'success', icon: <CheckCircleRoundedIcon /> },
  REJECTED: { color: 'error', icon: <CancelRoundedIcon /> },
  CANCELLED: { color: 'default', icon: <DoNotDisturbOnRoundedIcon /> },
}

export function StatusChip({ status }: { status: string }) {
  const { t } = useLang()
  const s = STATUS[status] ?? STATUS.PENDING!
  return (
    <Chip size="small" icon={s.icon} label={t(status)} color={s.color} variant="outlined"
      sx={theme => ({ backgroundColor: s.color === 'default' ? 'transparent' : alpha(theme.palette[s.color].main, 0.12) })} />
  )
}

// Gradient avatar tinted by the provider's category
export function PersonAvatar({ name, specialty, size = 48 }: { name?: string; specialty?: string | null; size?: number }) {
  const c = categoryOf(specialty)?.color ?? 'var(--brand-a)'
  return (
    <Avatar sx={{ width: size, height: size, fontWeight: 700, fontSize: size * 0.36, color: '#fff', background: `linear-gradient(135deg, ${c}, var(--brand-c))`, boxShadow: `0 8px 20px -8px ${c}` }}>
      {initials(name)}
    </Avatar>
  )
}

// Calendar-page style date block
export function DateBlock({ date }: { date: Date }) {
  const { locale } = useLang()
  return (
    <Box sx={{ width: 56, flexShrink: 0, textAlign: 'center', borderRadius: 3, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      <Box sx={{ py: 0.25, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', background: 'var(--brand-gradient)' }}>
        {date.toLocaleDateString(locale, { month: 'short' }).replace('.', '')}
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 22, lineHeight: 1.6 }}>{date.getDate()}</Typography>
    </Box>
  )
}

export function EmptyState({ icon, title, desc }: { icon: ReactNode; title: string; desc?: string }) {
  return (
    <Paper sx={{ p: 5, textAlign: 'center', borderStyle: 'dashed' }}>
      <Box sx={{ display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: 4, mb: 2, color: 'primary.main', bgcolor: theme => alpha(theme.palette.primary.main, 0.12) }}>{icon}</Box>
      <Typography variant="h6">{title}</Typography>
      {desc && <Typography color="text.secondary">{desc}</Typography>}
    </Paper>
  )
}

export function StatTile({ icon, label, value, color, delay = 0 }: { icon: ReactNode; label: string; value: number; color: string; delay?: number }) {
  return (
    <Paper className="reveal lift" style={stagger(delay)} sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 3.5, color: '#fff', background: `linear-gradient(135deg, ${color}, var(--brand-c))`, boxShadow: `0 10px 24px -10px ${color}` }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  )
}
