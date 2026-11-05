import { useState } from 'react'
import { Badge, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Tooltip } from '@mui/material'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import { useChat } from '../chat'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useThemeMode } from '../themeMode'
import { logoutLocal } from '../api'
import Logo from './Logo'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'

export default function Navbar() {
  const { t, toggle: toggleLang } = useLang()
  const { mode, toggle: toggleTheme } = useThemeMode()
  const { unread } = useChat()
  const nav = useNavigate()
  useLocation() // re-render on navigation so the logged-in state stays current
  const [confirm, setConfirm] = useState(false)
  const loggedIn = !!localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const dashboard = role === 'ROLE_PROVIDER' ? '/provider/dashboard' : '/client/dashboard'
  const logout = () => { logoutLocal(); setConfirm(false); nav('/') }

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, pt: { xs: 1.5, md: 2 } }}>
      <Container maxWidth="lg">
        <Paper sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component={Link} to={loggedIn ? dashboard : '/'} sx={{ textDecoration: 'none', flexGrow: 1 }}><Logo /></Box>

          {loggedIn && (
            <>
              <Button component={Link} to={dashboard} color="inherit" startIcon={<SpaceDashboardRoundedIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>{t('dashboard')}</Button>
              <Tooltip title={t('messages')}>
                <Button component={Link} to="/messages" color="inherit" aria-label={t('messages')} sx={{ minWidth: 0, px: { xs: 1, sm: 1.5 } }}
                  startIcon={<Badge color="error" badgeContent={unread} max={99}><ChatRoundedIcon /></Badge>}>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('messages')}</Box>
                </Button>
              </Tooltip>
              {role === 'ROLE_PROVIDER' && (
                <Button component={Link} to="/profile" color="inherit" startIcon={<AccountCircleRoundedIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>{t('profile')}</Button>
              )}
            </>
          )}

          <Tooltip title={t('toggle') === 'EN' ? 'English' : 'Ελληνικά'}>
            <Button onClick={toggleLang} color="inherit" startIcon={<TranslateRoundedIcon />} sx={{ minWidth: 0, px: 1.5 }}>{t('toggle')}</Button>
          </Tooltip>
          <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>

          {!loggedIn && <Button component={Link} to="/auth" variant="contained" sx={{ ml: 0.5 }}>{t('signIn')}</Button>}
          {loggedIn && (
            <Tooltip title={t('logout')}>
              <IconButton onClick={() => setConfirm(true)} color="inherit" aria-label={t('logout')}><LogoutRoundedIcon /></IconButton>
            </Tooltip>
          )}
        </Paper>
      </Container>

      <Dialog open={confirm} onClose={() => setConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('logout')}</DialogTitle>
        <DialogContent>{t('logoutConfirm')}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirm(false)} color="inherit">{t('cancel')}</Button>
          <Button onClick={logout} variant="contained">{t('logout')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
