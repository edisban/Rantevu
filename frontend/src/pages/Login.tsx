import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material'

export default function Login() {
  const [form, setForm] = useState<any>({})
  const nav = useNavigate()
  const submit = async (e: any) => {
    e.preventDefault()
    const res = await auth.login(form)
    localStorage.setItem('token', res.token); localStorage.setItem('role', res.role); localStorage.setItem('userId', res.userId)
    nav(res.role === 'ROLE_CLIENT' ? '/client/dashboard' : '/provider/dashboard')
  }
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
          <TextField label="Password" type="password" onChange={e => setForm((f: any) => ({ ...f, password: e.target.value }))} />
          <Button type="submit" variant="contained">Login</Button>
        </Box>
      </Paper>
    </Container>
  )
}
