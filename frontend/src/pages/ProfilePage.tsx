import { useEffect, useState } from 'react'
import { api } from '../api'
import { useLang } from '../i18n'
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material'

export default function ProfilePage() {
  const { t } = useLang()
  const [form, setForm] = useState<any>({})
  const [msg, setMsg] = useState('')
  useEffect(() => {
    api('/api/profile').then((d: any) => setForm({ ...d.user, ...d.profile })).catch(() => {})
  }, [])
  const save = async (e: any) => {
    e.preventDefault()
    await api('/api/profile', { method: 'PUT', body: JSON.stringify(form) })
    setMsg('OK')
  }
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>{t('profile')}</Typography>
        <Box component="form" onSubmit={save} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label={t('phone')} value={form.phone || ''} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
          <TextField label={t('specialty')} value={form.specialty || ''} onChange={e => setForm((f: any) => ({ ...f, specialty: e.target.value }))} />
          <TextField label={t('address')} value={form.address || ''} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
          <TextField label={t('bio')} multiline rows={3} value={form.bio || ''} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} />
          <TextField label={t('price')} type="number" value={form.pricePerVisit || ''} onChange={e => setForm((f: any) => ({ ...f, pricePerVisit: Number(e.target.value) }))} />
          <Button type="submit" variant="contained">{t('save')}</Button>
          {msg && <Typography color="success.main">{msg}</Typography>}
        </Box>
      </Paper>
    </Container>
  )
}
