import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, ButtonBase, Chip, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, TextField, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { errorMessage } from '../api'
import { NONE, useBookAppointment, useBusySlots } from '../queries'
import type { Provider } from '../types'
import { useLang } from '../i18n'
import { formatDateTime } from '../format'
import { PersonAvatar } from './ui'

const pad = (n: number) => String(n).padStart(2, '0')
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
// Remount (via `key`) per provider to reset the form.
// 09:00 – 19:30 every half hour
const SLOTS = Array.from({ length: 22 }, (_, i) => `${pad(9 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`)
const DAYS_AHEAD = 21
// How long the "all set" check stays before the dialog closes by itself
const SUCCESS_MS = 1800

// Midnight today and the days after it
function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + i)
    return d
  })
}

// The next three weeks as a row of day cards that slides with the arrows (or a swipe)
function DayStrip({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const { t, locale } = useLang()
  const strip = useRef<HTMLDivElement>(null)
  const [days] = useState(() => nextDays(DAYS_AHEAD))
  const slide = (direction: number) => {
    const el = strip.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton aria-label={t('prevDays')} onClick={() => slide(-1)}><ChevronLeftRoundedIcon /></IconButton>
      <div ref={strip} className="day-strip" style={{ flex: 1, minWidth: 0 }}>
        {days.map(d => {
          const iso = toDateInput(d)
          const active = iso === value
          return (
            <ButtonBase key={iso} onClick={() => onChange(iso)} aria-pressed={active}
              aria-label={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              sx={theme => ({
                flex: '0 0 72px', height: 84, borderRadius: 3.5, flexDirection: 'column', gap: 0.25, fontFamily: 'inherit',
                border: 1, borderColor: active ? 'transparent' : 'divider',
                color: active ? '#fff' : 'text.primary',
                background: active ? 'var(--brand-gradient)' : alpha(theme.palette.background.paper, 0.6),
                boxShadow: active ? '0 12px 24px -12px var(--brand-glow)' : 'none',
                transition: 'transform .2s ease, background .25s ease, box-shadow .25s ease',
                '&:hover': { transform: 'translateY(-3px)' },
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              })}>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>{d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}</Box>
              <Box component="span" sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{d.getDate()}</Box>
              <Box component="span" sx={{ fontSize: 11, opacity: 0.8 }}>{d.toLocaleDateString(locale, { month: 'short' }).replace('.', '')}</Box>
            </ButtonBase>
          )
        })}
      </div>
      <IconButton aria-label={t('nextDays')} onClick={() => slide(1)}><ChevronRightRoundedIcon /></IconButton>
    </Box>
  )
}

export default function BookingDialog({ provider, onClose, onBooked }: { provider: Provider | null; onClose: () => void; onBooked: () => void }) {
  const { t, locale } = useLang()
  const theme = useTheme()
  const today = toDateInput(new Date())
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const book = useBookAppointment()
  const sending = book.isPending

  // Slots other clients already hold for this provider on the chosen day
  const busy = useBusySlots(provider?.userId, date).data ?? NONE

  const isPast = (slot: string) => new Date(`${date}T${slot}`) <= new Date()
  const isTaken = (slot: string) => busy.includes(slot)

  // After the check has drawn itself, close on our own (the page then shows its toast)
  const finish = useRef(onBooked)
  useEffect(() => { finish.current = onBooked })
  useEffect(() => {
    if (!sent) return
    const timer = window.setTimeout(() => finish.current(), SUCCESS_MS)
    return () => window.clearTimeout(timer)
  }, [sent])

  const submit = () => {
    if (!provider) return
    setErr('')
    book.mutate({ providerId: provider.userId, appointmentDate: `${date}T${time}`, notes }, {
      onSuccess: () => setSent(true),
      onError: e => setErr(errorMessage(e)),
    })
  }

  const close = sent ? onBooked : onClose

  return (
    <Dialog open={!!provider} onClose={close} maxWidth="sm" fullWidth>
      {provider && sent && (
        <DialogContent sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
          <svg className="check" width="96" height="96" viewBox="0 0 52 52" aria-hidden>
            <circle className="check__circle" cx="26" cy="26" r="24" fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
            <path className="check__tick" d="M15 27l7 7 15-15" fill="none" stroke={theme.palette.primary.main} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Typography className="rise" variant="h5" role="status">{t('allSet')}</Typography>
          <Typography className="rise" color="text.secondary">
            {formatDateTime(new Date(`${date}T${time}`), locale)} · {t('waitApproval')}
          </Typography>
          <Button className="rise" variant="contained" onClick={onBooked} sx={{ mt: 1 }}>{t('ok')}</Button>
        </DialogContent>
      )}
      {provider && !sent && (
        <>
          <Box sx={{ position: 'relative', p: 3, pb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <PersonAvatar name={provider.fullName} specialty={provider.specialty} size={56} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap>{t('bookWith', { name: provider.fullName || '' })}</Typography>
              <Typography color="text.secondary" noWrap>{[provider.specialty, provider.address].filter(Boolean).join(' · ')}</Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ alignSelf: 'flex-start' }}><CloseRoundedIcon /></IconButton>
          </Box>
          <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {err && <Alert severity="error">{t(err)}</Alert>}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('pickDate')}</Typography>
              <DayStrip value={date} onChange={d => { setDate(d); setTime('') }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('pickTime')}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 1 }}>
                {SLOTS.map(s => (
                  <Chip key={s} label={s} clickable disabled={!date || isPast(s) || isTaken(s)} onClick={() => setTime(s)}
                    color={time === s ? 'primary' : 'default'} variant={time === s ? 'filled' : 'outlined'}
                    sx={{
                      transition: 'transform .2s ease',
                      '&:hover': { transform: 'translateY(-2px)' },
                      ...(time === s ? { background: 'var(--brand-gradient)', color: '#fff', animation: 'slotPop .35s cubic-bezier(.3, 1.6, .5, 1)' } : {}),
                      ...(isTaken(s) ? { textDecoration: 'line-through' } : {}),
                    }} />
                ))}
              </Box>
            </Box>
            <TextField label={t('notes')} placeholder={t('notesPh')} multiline minRows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} color="inherit">{t('cancel')}</Button>
            <Button variant="contained" disabled={!date || !time || sending || isTaken(time)} onClick={submit} endIcon={sending ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {t('confirm')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
