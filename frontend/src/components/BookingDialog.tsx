import { useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, TextField, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { errorMessage } from '../api'
import { NONE, useBookAppointment, useBusySlots } from '../queries'
import type { Provider } from '../types'
import { useLang } from '../i18n'
import { PersonAvatar } from './ui'

const pad = (n: number) => String(n).padStart(2, '0')
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
// Remount (via `key`) per provider to reset the form.
// 09:00 – 19:30 every half hour
const SLOTS = Array.from({ length: 22 }, (_, i) => `${pad(9 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`)

export default function BookingDialog({ provider, onClose, onBooked }: { provider: Provider | null; onClose: () => void; onBooked: () => void }) {
  const { t } = useLang()
  const today = toDateInput(new Date())
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')
  const book = useBookAppointment()
  const sending = book.isPending

  // Slots other clients already hold for this provider on the chosen day
  const busy = useBusySlots(provider?.userId, date).data ?? NONE

  const isPast = (slot: string) => new Date(`${date}T${slot}`) <= new Date()
  const isTaken = (slot: string) => busy.includes(slot)

  const submit = () => {
    if (!provider) return
    setErr('')
    book.mutate({ providerId: provider.userId, appointmentDate: `${date}T${time}`, notes }, {
      onSuccess: onBooked,
      onError: e => setErr(errorMessage(e)),
    })
  }

  return (
    <Dialog open={!!provider} onClose={onClose} maxWidth="sm" fullWidth>
      {provider && (
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
            <TextField type="date" label={t('pickDate')} value={date} onChange={e => { setDate(e.target.value); setTime('') }}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('pickTime')}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 1 }}>
                {SLOTS.map(s => (
                  <Chip key={s} label={s} clickable disabled={!date || isPast(s) || isTaken(s)} onClick={() => setTime(s)}
                    color={time === s ? 'primary' : 'default'} variant={time === s ? 'filled' : 'outlined'}
                    sx={time === s ? { background: 'var(--brand-gradient)', color: '#fff' } : isTaken(s) ? { textDecoration: 'line-through' } : undefined} />
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
