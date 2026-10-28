import { useEffect, useState } from 'react'
import { AppBar, Button, Dialog, DialogActions, DialogTitle, IconButton, Toolbar, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useThemeMode } from '../themeMode'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

export default function Navbar() {
  const { t, toggle: toggleLang } = useLang()
  const { mode, toggle: toggleTheme } = useThemeMode()
  const nav = useNavigate()
  const loc = useLocation()
  const [confirm, setConfirm] = useState(false)
  const loggedIn = !!localStorage.getItem('token')
  useEffect(() => {}, [loc])
  const logout = () => { localStorage.clear(); setConfirm(false); nav('/') }
  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>Rantevu</Typography>
        <Button component={Link} to="/">{t('home')}</Button>
        {!loggedIn && <Button component={Link} to="/auth">{t('login')}</Button>}
        {!loggedIn && <Button component={Link} to="/auth" variant="contained" sx={{ ml: 1 }}>{t('register')}</Button>}
        <Button onClick={toggleLang} sx={{ ml: 1, minWidth: 48 }}>{t('toggle')}</Button>
        <IconButton onClick={toggleTheme} sx={{ ml: 1 }} color="inherit">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {loggedIn && <Button onClick={() => setConfirm(true)} sx={{ ml: 1 }}>{t('logout')}</Button>}
      </Toolbar>
      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Cancel</Button>
          <Button onClick={logout} variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}
