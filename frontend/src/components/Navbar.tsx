import { useState, type ReactNode } from 'react'
import { Box, Button, ButtonBase, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import { useChat } from '../chat'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useThemeMode } from '../themeMode'
import { isSignedIn, logout as signOut } from '../api'
import Logo from './Logo'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'

// A text link in the header: the label on wider screens, just the icon on phones
function NavItem({ to, onClick, label, icon, active, count = 0 }:
  { to?: string; onClick?: () => void; label: string; icon: ReactNode; active?: boolean; count?: number }) {
  const linkProps = to ? { component: Link, to } : { onClick }
  return (
    <ButtonBase {...linkProps} aria-label={count > 0 ? `${label} (${count})` : label} aria-current={active ? 'page' : undefined}
      sx={{
        gap: 0.75, px: { xs: 1, sm: 0.25 }, minHeight: 44, borderRadius: 2, fontSize: 14, fontFamily: 'inherit',
        fontWeight: active ? 700 : 500, color: active ? 'text.primary' : 'text.secondary',
        transition: 'color .2s ease', '&:hover': { color: 'text.primary' },
        '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}>
      <Box component="span" sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>{icon}</Box>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{label}</Box>
      {count > 0 && (
        <Box component="span" sx={{ minWidth: 18, height: 18, px: 0.6, borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--brand-gradient)' }}>
          {count > 99 ? '99+' : count}
        </Box>
      )}
    </ButtonBase>
  )
}

export default function Navbar() {
  const { t, toggle: toggleLang } = useLang()
  const { mode, toggle: toggleTheme } = useThemeMode()
  const { unread } = useChat()
  const nav = useNavigate()
  const { pathname } = useLocation() // re-render on navigation so the logged-in state stays current
  const [confirm, setConfirm] = useState(false)
  const loggedIn = isSignedIn()
  const role = localStorage.getItem('role')
  const dashboard = role === 'ROLE_PROVIDER' ? '/provider/dashboard' : '/client/dashboard'
  const logout = async () => { await signOut(); setConfirm(false); nav('/') }

  return (
    <Box component="header" sx={theme => ({
      position: 'sticky', top: 0, zIndex: 1100,
      borderBottom: 1, borderColor: 'divider',
      // Translucent so the page backdrop shows through as content scrolls underneath
      backgroundColor: alpha(theme.palette.background.default, 0.7),
      backdropFilter: 'blur(14px) saturate(140%)', WebkitBackdropFilter: 'blur(14px) saturate(140%)',
    })}>
      <Container sx={{ minHeight: 72, display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
        <Box component={Link} to={loggedIn ? dashboard : '/'} aria-label="Rantevu" sx={{ textDecoration: 'none', mr: 'auto', display: 'flex' }}><Logo /></Box>

        {loggedIn && (
          <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 3.5 }, mr: { xs: 0.5, sm: 2 } }}>
            <NavItem to={dashboard} label={t('dashboard')} icon={<SpaceDashboardRoundedIcon />} active={pathname === dashboard} />
            <NavItem to="/messages" label={t('messages')} icon={<ChatRoundedIcon />} active={pathname === '/messages'} count={unread} />
            <NavItem to="/profile" label={t('profile')} icon={<AccountCircleRoundedIcon />} active={pathname === '/profile'} />
            <NavItem onClick={() => setConfirm(true)} label={t('logout')} icon={<LogoutRoundedIcon />} />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, pl: { sm: 2 }, borderLeft: { sm: 1 }, borderColor: { sm: 'divider' } }}>
          <Tooltip title={t('toggle') === 'EN' ? 'English' : 'Ελληνικά'}>
            <Button onClick={toggleLang} color="inherit" sx={{ minWidth: 44, px: 1, fontWeight: 700, color: 'text.secondary' }}>{t('toggle')}</Button>
          </Tooltip>
          <IconButton onClick={toggleTheme} aria-label="toggle theme" sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Box>

        {!loggedIn && <Button component={Link} to="/auth" variant="contained" sx={{ ml: 1 }}>{t('signIn')}</Button>}
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
