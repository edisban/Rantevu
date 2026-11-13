import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Button, ButtonBase, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Tooltip } from '@mui/material'
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

// A link in the header's glass capsule: the label on wider screens, just the icon on phones
function NavItem({ to, onClick, onHover, label, icon, active, count = 0 }:
  { to?: string; onClick?: () => void; onHover: (el: HTMLElement) => void; label: string; icon: ReactNode; active?: boolean; count?: number }) {
  const linkProps = to ? { component: Link, to } : { onClick }
  return (
    <ButtonBase {...linkProps} onMouseEnter={e => onHover(e.currentTarget)} onFocus={e => onHover(e.currentTarget)}
      aria-label={count > 0 ? `${label} (${count})` : label} aria-current={active ? 'page' : undefined}
      sx={{
        position: 'relative', zIndex: 1, gap: 0.75, px: { xs: 0.75, sm: 2 }, minHeight: { xs: 40, sm: 44 }, borderRadius: 999, fontSize: 14, fontFamily: 'inherit',
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

  // A glass droplet sits under the current page and slides to whichever item the pointer is on
  const menu = useRef<HTMLElement>(null)
  const [line, setLine] = useState<{ left: number; width: number } | null>(null)
  const moveLine = useCallback((el: HTMLElement | null | undefined) => {
    setLine(el ? { left: el.offsetLeft, width: el.offsetWidth } : null)
  }, [])
  const backToCurrent = useCallback(() => moveLine(menu.current?.querySelector<HTMLElement>('[aria-current="page"]')), [moveLine])
  // Labels change width with the language, so measure again after it switches
  useLayoutEffect(backToCurrent, [backToCurrent, pathname, lang, loggedIn, unread])

  return (
    // Floating glass capsules instead of a full-width bar. Behind them, a blur that fades out downwards
    // keeps scrolled content from showing sharply between the capsules.
    <Box component="header" sx={{
      position: 'sticky', top: 0, zIndex: 1100, isolation: 'isolate', pt: { xs: 1.5, md: 2 }, pb: { xs: 1, md: 1.5 },
      '&::before': {
        content: '""', position: 'absolute', inset: 0, bottom: -12, zIndex: -1, pointerEvents: 'none',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        mask: 'linear-gradient(to bottom, #000 55%, transparent)', WebkitMask: 'linear-gradient(to bottom, #000 55%, transparent)',
      },
    }}>
      <Container sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.5 } }}>
        <Paper component={Link} to={loggedIn ? dashboard : '/'} aria-label="Rendezvous"
          sx={{ textDecoration: 'none', mr: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: { xs: 48, sm: 56 }, minWidth: { xs: 48, sm: 0 }, px: { xs: 0, sm: 3 }, borderRadius: 999 }}>
          {/* The full wordmark doesn't fit next to the menu on phones: show the mark there */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}><Logo /></Box>
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}><LogoMark size={30} /></Box>
        </Paper>

        {loggedIn && (
          <Paper component="nav" ref={menu} onMouseLeave={backToCurrent} onBlur={backToCurrent}
            sx={{ display: 'flex', alignItems: 'center', p: { xs: 0.5, sm: 0.75 }, borderRadius: 999 }}>
            <NavItem to={dashboard} onHover={moveLine} label={t('dashboard')} icon={<SpaceDashboardRoundedIcon />} active={pathname === dashboard} />
            <NavItem to="/messages" onHover={moveLine} label={t('messages')} icon={<ChatRoundedIcon />} active={pathname === '/messages'} count={unread} />
            <NavItem to="/profile" onHover={moveLine} label={t('profile')} icon={<AccountCircleRoundedIcon />} active={pathname === '/profile'} />
            <NavItem onClick={() => setConfirm(true)} onHover={moveLine} label={t('logout')} icon={<LogoutRoundedIcon />} />
            <Box aria-hidden sx={theme => ({
              position: 'absolute', left: 0, top: { xs: 4, sm: 6 }, bottom: { xs: 4, sm: 6 }, borderRadius: 999,
              width: line?.width ?? 0, transform: `translateX(${line?.left ?? 0}px)`, opacity: line ? 1 : 0,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08))'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.55))',
              boxShadow: theme.palette.mode === 'dark'
                ? 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 12px -4px rgba(0, 0, 0, 0.6)'
                : 'inset 0 1px 1px #fff, 0 4px 12px -4px rgba(70, 8, 26, 0.35)',
              transition: 'transform .4s cubic-bezier(.3, 1.3, .5, 1), width .4s cubic-bezier(.3, 1.3, .5, 1), opacity .2s ease',
            })} />
          </Paper>
        )}

        <Paper sx={{ display: 'flex', alignItems: 'center', gap: 0.25, height: { xs: 48, sm: 56 }, px: 0.5, borderRadius: 999 }}>
          <Tooltip title={t('toggle') === 'EN' ? 'English' : 'Ελληνικά'}>
            <Button onClick={toggleLang} color="inherit" sx={{ minWidth: 40, px: 1, fontWeight: 700, color: 'text.secondary' }}>{t('toggle')}</Button>
          </Tooltip>
          <IconButton onClick={toggleTheme} aria-label="toggle theme" size="medium" sx={{ color: 'text.secondary', p: { xs: 1 } }}>
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Paper>

        {!loggedIn && <Button component={Link} to="/auth" variant="contained" sx={{ height: 48 }}>{t('signIn')}</Button>}
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
