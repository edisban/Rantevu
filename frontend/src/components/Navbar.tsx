import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Button, ButtonBase, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import { useChat } from '../chat'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useThemeMode } from '../themeMode'
import { isSignedIn, logout as signOut } from '../api'
import Logo, { LogoMark } from './Logo'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'

// A text link in the header: the label on wider screens, just the icon on phones
function NavItem({ to, onClick, onHover, label, icon, active, count = 0 }:
  { to?: string; onClick?: () => void; onHover: (el: HTMLElement) => void; label: string; icon: ReactNode; active?: boolean; count?: number }) {
  const linkProps = to ? { component: Link, to } : { onClick }
  return (
    <ButtonBase {...linkProps} onMouseEnter={e => onHover(e.currentTarget)} onFocus={e => onHover(e.currentTarget)}
      aria-label={count > 0 ? `${label} (${count})` : label} aria-current={active ? 'page' : undefined}
      sx={{
        gap: 0.75, px: { xs: 0.75, sm: 0.25 }, minHeight: 44, borderRadius: 2, fontSize: 14, fontFamily: 'inherit',
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
  const { t, lang, toggle: toggleLang } = useLang()
  const { mode, toggle: toggleTheme } = useThemeMode()
  const { unread } = useChat()
  const nav = useNavigate()
  const { pathname } = useLocation() // re-render on navigation so the logged-in state stays current
  const [confirm, setConfirm] = useState(false)
  const loggedIn = isSignedIn()
  const role = localStorage.getItem('role')
  const dashboard = role === 'ROLE_PROVIDER' ? '/provider/dashboard' : '/client/dashboard'
  const logout = async () => { await signOut(); setConfirm(false); nav('/') }

  // The underline sits under the current page and slides to whichever item the pointer is on
  const menu = useRef<HTMLElement>(null)
  const [line, setLine] = useState<{ left: number; width: number } | null>(null)
  const moveLine = useCallback((el: HTMLElement | null | undefined) => {
    setLine(el ? { left: el.offsetLeft, width: el.offsetWidth } : null)
  }, [])
  const backToCurrent = useCallback(() => moveLine(menu.current?.querySelector<HTMLElement>('[aria-current="page"]')), [moveLine])
  // Labels change width with the language, so measure again after it switches
  useLayoutEffect(backToCurrent, [backToCurrent, pathname, lang, loggedIn, unread])

  return (
    // One full-width bar of frosted glass: the page shows softly through it as content scrolls underneath
    <Box component="header" sx={theme => ({
      position: 'sticky', top: 0, zIndex: 1100,
      borderBottom: 1, borderColor: 'divider',
      backgroundColor: alpha(theme.palette.background.default, 0.72),
      backdropFilter: 'blur(16px) saturate(130%)', WebkitBackdropFilter: 'blur(16px) saturate(130%)',
      boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px -24px rgba(0, 0, 0, 0.9)' : '0 10px 30px -24px rgba(70, 30, 20, 0.45)',
    })}>
      <Container sx={{ minHeight: 72, display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
        <Box component={Link} to={loggedIn ? dashboard : '/'} aria-label="Rendezvous" sx={{ textDecoration: 'none', mr: 'auto', display: 'flex', alignItems: 'center' }}>
          {/* The full wordmark doesn't fit next to the menu on phones: show the mark there */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}><Logo /></Box>
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}><LogoMark size={32} /></Box>
        </Box>

        {loggedIn && (
          <Box component="nav" ref={menu} onMouseLeave={backToCurrent} onBlur={backToCurrent}
            sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 3.5 }, mr: { xs: 0.5, sm: 2 } }}>
            <NavItem to={dashboard} onHover={moveLine} label={t('dashboard')} icon={<SpaceDashboardRoundedIcon />} active={pathname === dashboard} />
            <NavItem to="/messages" onHover={moveLine} label={t('messages')} icon={<ChatRoundedIcon />} active={pathname === '/messages'} count={unread} />
            <NavItem to="/profile" onHover={moveLine} label={t('profile')} icon={<AccountCircleRoundedIcon />} active={pathname === '/profile'} />
            <NavItem onClick={() => setConfirm(true)} onHover={moveLine} label={t('logout')} icon={<LogoutRoundedIcon />} />
            {/* Sits on the header's bottom border: (72px header - 44px items) / 2 below the menu */}
            <Box aria-hidden sx={{
              position: 'absolute', left: 0, bottom: -14, height: 3, borderRadius: 3, bgcolor: 'primary.main',
              width: line?.width ?? 0, transform: `translateX(${line?.left ?? 0}px)`, opacity: line ? 1 : 0,
              transition: 'transform .35s cubic-bezier(.3, 1.3, .5, 1), width .35s cubic-bezier(.3, 1.3, .5, 1), opacity .2s ease',
            }} />
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
