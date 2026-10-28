import { useEffect, useState } from 'react'
import { api } from '../api'
import { Button, Card, CardContent, Container, TextField, Typography, Box, Snackbar, Alert } from '@mui/material'

export default function ProviderDashboard() {
  const [appts, setAppts] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [toast, setToast] = useState('')
  const load = () => api('/api/appointments/mine').then(setAppts).catch(() => {})
  useEffect(() => { load(); api('/api/profile').then((d: any) => setForm({ ...d.user, ...d.profile })).catch(() => {}) }, [])
  const setStatus = async (id: number, status: string) => {
    await api(`/api/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
    setToast('Updated'); load()
  }
  const save = async (e: any) => {
    e.preventDefault()
    await api('/api/profile', { method: 'PUT', body: JSON.stringify(form) })
    setToast('Saved')
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Profile</Typography>
      <Card sx={{ mb: 3 }}><CardContent>
        <Box component="form" onSubmit={save} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Phone" value={form.phone || ''} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
          <TextField label="Specialty" value={form.specialty || ''} onChange={e => setForm((f: any) => ({ ...f, specialty: e.target.value }))} />
          <TextField label="Address" value={form.address || ''} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
          <TextField label="Bio" multiline rows={3} value={form.bio || ''} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} />
          <TextField label="Price" type="number" value={form.pricePerVisit || ''} onChange={e => setForm((f: any) => ({ ...f, pricePerVisit: Number(e.target.value) }))} />
          <Button type="submit" variant="contained">Save</Button>
        </Box>
      </CardContent></Card>
      <Typography variant="h5" gutterBottom>Incoming appointments</Typography>
      {appts.map(a => (
        <Card key={a.id} sx={{ mb: 2 }}><CardContent>
          <Typography>{a.appointmentDate} — {a.status}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={() => setStatus(a.id, 'ACCEPTED')}>Accept</Button>
            <Button variant="outlined" color="error" onClick={() => setStatus(a.id, 'REJECTED')}>Reject</Button>
          </Box>
        </CardContent></Card>
      ))}
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}><Alert severity="success">{toast}</Alert></Snackbar>
    </Container>
  )
}
