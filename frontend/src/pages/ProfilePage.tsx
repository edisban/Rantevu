import { useEffect, useState, type FormEvent } from 'react'
import { api, errorMessage } from '../api'
import type { Me, ProfileResponse, Provider } from '../types'
import { useLang } from '../i18n'
import { SPECIALTY_SUGGESTIONS, categoryOf } from '../categories'
import { PersonAvatar } from '../components/ui'
import { Alert, Autocomplete, Box, Button, CircularProgress, Container, InputAdornment, Paper, Snackbar, TextField, Typography } from '@mui/material'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { delay } from '../style'

export default function ProfilePage() {
  const { t, lang } = useLang()
  const [form, setForm] = useState<Partial<Me & Provider>>({})
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [err, setErr] = useState('')
  const set = (k: keyof (Me & Provider), v: string | number | null) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api<ProfileResponse>('/api/profile').then(d => setForm({ ...d.user, ...d.profile })).catch(e => setErr(errorMessage(e)))
  }, [])

  const save = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await api('/api/profile', { method: 'PUT', body: JSON.stringify(form) })
      setToast(t('saved'))
    } catch (ex) { setErr(errorMessage(ex)) } finally { setBusy(false) }
  }

  const cat = categoryOf(form.specialty)

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 } }}>
      <Box className="reveal" sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 40 } }}>{t('profile')}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 17 }}>{t('profileSub')}</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 280px' }, gap: 3, alignItems: 'start' }}>
        <Paper className="reveal" style={delay(0.06)} sx={{ p: { xs: 3, sm: 4 } }}>
          {err && <Alert severity="error" sx={{ mb: 2 }}>{t(err)}</Alert>}
          <Box component="form" onSubmit={save} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            <Autocomplete freeSolo options={SPECIALTY_SUGGESTIONS[lang]} inputValue={form.specialty || ''} onInputChange={(_, v) => set('specialty', v)}
              renderInput={params => <TextField {...params} label={t('specialty')} />} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.25 }}>
              <TextField label={t('phone')} value={form.phone || ''} onChange={e => set('phone', e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneRoundedIcon /></InputAdornment> } }} />
              <TextField label={t('price')} type="number" value={form.pricePerVisit ?? ''} onChange={e => set('pricePerVisit', e.target.value === '' ? null : Number(e.target.value))}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">€</InputAdornment> }, htmlInput: { min: 0, step: 1 } }} />
            </Box>
            <TextField label={t('address')} value={form.address || ''} onChange={e => set('address', e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PlaceRoundedIcon /></InputAdornment> } }} />
            <TextField label={t('bio')} multiline minRows={4} value={form.bio || ''} onChange={e => set('bio', e.target.value)} />
            <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ alignSelf: 'flex-end', px: 4 }}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}>{t('save')}</Button>
          </Box>
        </Paper>

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
      </Box>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
      </Snackbar>
    </Container>
  )
}
