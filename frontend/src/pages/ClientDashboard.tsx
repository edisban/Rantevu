import { useEffect, useState } from 'react'
import { api } from '../api'
import { Button, Card, CardContent, Container, TextField, Typography, Box } from '@mui/material'

export default function ClientDashboard() {
  const [providers, setProviders] = useState<any[]>([])
  const [appts, setAppts] = useState<any[]>([])
  const [q, setQ] = useState('')
  useEffect(() => {
    api('/api/providers').then(setProviders).catch(() => {})
    api('/api/appointments/mine').then(setAppts).catch(() => {})
  }, [])
  const request = async (p: any) => {
    const date = prompt('Appointment date (YYYY-MM-DDTHH:MM)')
    if (!date) return
    await api('/api/appointments', { method: 'POST', body: JSON.stringify({ providerId: p.userId, appointmentDate: date, notes: '' }) })
    api('/api/appointments/mine').then(setAppts)
  }
  const filtered = providers.filter(p => {
    const s = q.toLowerCase()
    return !s || (p.specialty || '').toLowerCase().includes(s) || (p.address || '').toLowerCase().includes(s) || (p.user?.fullName || '').toLowerCase().includes(s)
  })
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Providers</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField fullWidth placeholder="Search by name or location" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }} />
        <Button variant="contained" onClick={() => {}}>Search</Button>
      </Box>
      {filtered.length === 0 && <Typography color="text.secondary" sx={{ mb: 2 }}>No providers available</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 2, mb: 4 }}>
        {filtered.map(p => (
          <Card key={p.userId}><CardContent>
            <Typography variant="h6">{p.specialty || 'Provider'}</Typography>
            <Typography color="text.secondary">{p.address}</Typography>
            <Typography>€{p.pricePerVisit}</Typography>
            <Button sx={{ mt: 1 }} variant="contained" onClick={() => request(p)}>Request appointment</Button>
          </CardContent></Card>
        ))}
      </Box>
      <Typography variant="h5" gutterBottom>My appointments</Typography>
      {appts.map(a => <Card key={a.id} sx={{ mb: 1 }}><CardContent><Typography>{a.appointmentDate} — {a.status}</Typography></CardContent></Card>)}
    </Container>
  )
}
