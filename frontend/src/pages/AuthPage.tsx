import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { useLang } from '../i18n'
import { Alert, Box, Button, Card, CardContent, Container, IconButton, InputAdornment, Snackbar, Tab, Tabs, TextField, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import WorkIcon from '@mui/icons-material/Work'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export default function AuthPage() {
  const { t } = useLang()
  const [tab, setTab] = useState(0)
  const [role, setRole] = useState<'client' | 'provider'>('client')
  const [form, setForm] = useState<any>({})
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [toast, setToast] = useState('')
  const nav = useNavigate()
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const login = async (e: any) => {
    e.preventDefault(); setErr(''); setMsg('')
    try {
      const res = await auth.login(form)
      localStorage.setItem('token', res.token); localStorage.setItem('role', res.role); localStorage.setItem('userId', res.userId)
      setToast('Logged in successfully')
      nav(res.role === 'ROLE_CLIENT' ? '/client/dashboard' : '/provider/dashboard')
    } catch { setErr(t('error')) }
  }
  const register = async (e: any) => {
    e.preventDefault(); setErr(''); setMsg('')
    try {
      const res = role === 'client' ? await auth.registerClient(form) : await auth.registerProvider(form)
      localStorage.setItem('token', res.token); localStorage.setItem('role', res.role); localStorage.setItem('userId', res.userId)
      setMsg(t('success'))
      nav(res.role === 'ROLE_CLIENT' ? '/client/dashboard' : '/provider/dashboard')
    } catch { setErr(t('error')) }
  }

  const adorn = (icon: any) => ({ slotProps: { input: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> } } })

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>Rantevu</Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
            <Tab label={t('signIn')} />
            <Tab label={t('signUp')} />
          </Tabs>
          {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          {tab === 0 && (
            <Box component="form" onSubmit={login} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label={t('username')} {...adorn(<PersonIcon />)} onChange={e => set('username', e.target.value)} />
              <TextField label={t('password')} type={show ? 'text' : 'password'} {...adorn(<LockIcon />)} onChange={e => set('password', e.target.value)}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(!show)}>{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
              <Button type="submit" variant="contained" fullWidth>{t('signIn')}</Button>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant={role === 'client' ? 'contained' : 'outlined'} onClick={() => setRole('client')} startIcon={<PersonIcon />} fullWidth>{t('client')}</Button>
                <Button variant={role === 'provider' ? 'contained' : 'outlined'} onClick={() => setRole('provider')} startIcon={<WorkIcon />} fullWidth>{t('provider')}</Button>
              </Box>
              <Box component="form" onSubmit={register} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label={t('username')} {...adorn(<PersonIcon />)} onChange={e => set('username', e.target.value)} />
                <TextField label={t('fullName')} {...adorn(<PersonIcon />)} onChange={e => set('fullName', e.target.value)} />
                <TextField label={t('email')} {...adorn(<EmailIcon />)} onChange={e => set('email', e.target.value)} />
                <TextField label={t('password')} type={show ? 'text' : 'password'} {...adorn(<LockIcon />)} onChange={e => set('password', e.target.value)} />
                <Button type="submit" variant="contained" fullWidth>{t('signUp')}</Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}><Alert severity="success">{toast}</Alert></Snackbar>
    </Container>
  )
}
