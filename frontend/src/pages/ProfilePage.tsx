import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, clearSession, errorMessage } from '../api'
import { keys, useProfile } from '../queries'
import type { Me, ProfileResponse, Provider } from '../types'
import { useLang } from '../i18n'
import { SPECIALTY_SUGGESTIONS, categoryOf } from '../categories'
import { PersonAvatar } from '../components/ui'
import { Alert, Autocomplete, Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import { delay } from '../style'

// Account settings for everyone; providers also edit their public profile here
export default function ProfilePage() {
  const { t, lang } = useLang()
  const isProvider = localStorage.getItem('role') === 'ROLE_PROVIDER'
  const profile = useProfile()
  const queryClient = useQueryClient()
  const [edits, setEdits] = useState<Partial<Me & Provider>>({})
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const [err, setErr] = useState('')
  // The form shows the saved profile with the user's unsaved edits on top, so a background refetch never wipes what they typed
  const form: Partial<Me & Provider> = { ...profile.data?.user, ...profile.data?.profile, ...edits }
  const set = (k: keyof (Me & Provider), v: string | number | null) => setEdits(f => ({ ...f, [k]: v }))
  const shownErr = err || (profile.error ? errorMessage(profile.error) : '')

  const save = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const saved = await api<ProfileResponse>('/api/profile', { method: 'PUT', body: JSON.stringify(form) })
      // The dashboard reads the same cache, so its "complete your profile" banner is right at once
      queryClient.setQueryData(keys.profile, saved)
      // Back to the dashboard, which shows the confirmation
      nav(isProvider ? '/provider/dashboard' : '/client/dashboard', { state: { toast: 'saved' } })
    } catch (ex) { setErr(errorMessage(ex)); setBusy(false) }
  }

  const cat = categoryOf(form.specialty)

  return (
    <Container sx={{ pt: { xs: 4, md: 6 } }}>
      <Box className="reveal" sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 40 } }}>{t('profile')}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 17 }}>{isProvider ? t('profileSub') : t('profileSubClient')}</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: isProvider ? '1fr 320px' : '1fr' }, gap: 3, alignItems: 'start' }}>
        <Paper className="reveal" style={delay(0.06)} sx={{ p: { xs: 3, sm: 4 } }}>
          {shownErr && <Alert severity="error" sx={{ mb: 2 }}>{t(shownErr)}</Alert>}
          <Box component="form" onSubmit={save} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            {!isProvider && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.25 }}>
                <TextField label={t('fullName')} value={form.fullName || ''} disabled />
                <TextField label={t('email')} value={form.email || ''} disabled />
              </Box>
            )}
            {isProvider && (
              <Autocomplete freeSolo options={SPECIALTY_SUGGESTIONS[lang]} inputValue={form.specialty || ''} onInputChange={(_, v) => set('specialty', v)}
                renderInput={params => <TextField {...params} label={t('specialty')} />} />
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: isProvider ? '1fr 1fr' : '1fr' }, gap: 2.25 }}>
              <TextField label={t('phone')} value={form.phone || ''} onChange={e => set('phone', e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneRoundedIcon /></InputAdornment> } }} />
              {isProvider && (
                <TextField label={t('price')} type="number" value={form.pricePerVisit ?? ''} onChange={e => set('pricePerVisit', e.target.value === '' ? null : Number(e.target.value))}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">€</InputAdornment> }, htmlInput: { min: 0, step: 1 } }} />
              )}
            </Box>
            {isProvider && (
              <>
                <TextField label={t('address')} value={form.address || ''} onChange={e => set('address', e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PlaceRoundedIcon /></InputAdornment> } }} />
                <TextField label={t('bio')} multiline minRows={4} value={form.bio || ''} onChange={e => set('bio', e.target.value)} />
              </>
            )}
            <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ alignSelf: 'flex-end', px: 4 }}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}>{t('save')}</Button>
          </Box>
        </Paper>

        {isProvider && (
          <Box className="reveal" style={delay(0.12)} sx={{ position: { md: 'sticky' }, top: { md: 104 } }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{t('preview')}</Typography>
            <Paper className="lift" sx={{ p: 2.5, borderRadius: 5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <PersonAvatar name={form.fullName} specialty={form.specialty} size={52} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 17 }} noWrap>{form.fullName}</Typography>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: cat?.color ?? 'secondary.main' }}>{form.specialty || '—'}</Typography>
                </Box>
              </Box>
              {form.bio && <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{form.bio}</Typography>}
              {form.address && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}><PlaceRoundedIcon fontSize="small" /><Typography variant="body2" noWrap>{form.address}</Typography></Box>}
              {form.pricePerVisit != null && (
                <Typography sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Box component="span" sx={{ fontWeight: 800, fontSize: 20 }}>€{form.pricePerVisit}</Box> <Box component="span" sx={{ color: 'text.secondary', fontSize: 13 }}>{t('perVisit')}</Box>
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      <DeleteAccount />
    </Container>
  )
}

function DeleteAccount() {
  const { t } = useLang()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const close = () => { setOpen(false); setPassword(''); setErr('') }

  const confirm = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await api('/api/account', { method: 'DELETE', body: JSON.stringify({ password }) })
      clearSession()
      nav('/', { replace: true, state: { toast: 'accountDeleted' } })
    } catch (ex) { setErr(errorMessage(ex)); setBusy(false) }
  }

  return (
    <>
      <Paper className="reveal" style={delay(0.18)}
        sx={{ mt: 3, p: { xs: 3, sm: 4 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', borderColor: 'error.main' }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography variant="h6" color="error">{t('deleteAccount')}</Typography>
          <Typography color="text.secondary">{t('deleteAccountDesc')}</Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<DeleteForeverRoundedIcon />} onClick={() => setOpen(true)}>{t('deleteAccount')}</Button>
      </Paper>

      <Dialog open={open} onClose={busy ? undefined : close} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={confirm}>
          <DialogTitle sx={{ fontWeight: 700 }}>{t('deleteAccountTitle')}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning">{t('deleteAccountWarn')}</Alert>
            {err && <Alert severity="error">{t(err)}</Alert>}
            <TextField type="password" label={t('confirmPassword')} value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" autoFocus required sx={{ mt: 0.5 }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={close} color="inherit" disabled={busy}>{t('cancel')}</Button>
            <Button type="submit" variant="contained" color="error" disabled={!password || busy}
              startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverRoundedIcon />}>{t('deleteForever')}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  )
}
