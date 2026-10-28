import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { Box, Button, Container, Paper, Tab, Tabs, TextField, Typography } from '@mui/material'

export default function Register() {
  const [role, setRole] = useState(0)
  const [form, setForm] = useState<any>({})
  const nav = useNavigate()
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const isProvider = role === 1
  const submit = async (e: any) => {
    e.preventDefault()
    const res = isProvider ? await auth.registerProvider(form) : await auth.registerClient(form)
    localStorage.setItem('token', res.token); localStorage.setItem('role', res.role); localStorage.setItem('userId', res.userId)
    nav(res.role === 'ROLE_CLIENT' ? '/client/dashboard' : '/provider/dashboard')
  }
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <Tabs value={role} onChange={(_, v) => setRole(v)} sx={{ mb: 2 }}>
          <Tab label="Client" />
          <Tab label="Provider" />
        </Tabs>
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" onChange={e => set('email', e.target.value)} />
          <TextField label="Password" type="password" onChange={e => set('password', e.target.value)} />
          <TextField label="Full name" onChange={e => set('fullName', e.target.value)} />
          <TextField label="Phone" onChange={e => set('phone', e.target.value)} />
          {isProvider && <>
            <TextField label="Specialty" onChange={e => set('specialty', e.target.value)} />
            <TextField label="Bio" onChange={e => set('bio', e.target.value)} />
            <TextField label="Address" onChange={e => set('address', e.target.value)} />
            <TextField label="Price per visit" type="number" onChange={e => set('pricePerVisit', Number(e.target.value))} />
          </>}
          <Button type="submit" variant="contained">Register</Button>
        </Box>
      </Paper>
    </Container>
  )
}
