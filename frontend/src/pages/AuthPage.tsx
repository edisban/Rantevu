import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth, errorMessage, saveSession } from '../api'
import { useLang } from '../i18n'
import { CATEGORIES, SPECIALTY_SUGGESTIONS } from '../categories'
import { Alert, Autocomplete, Box, Button, ButtonBase, Chip, CircularProgress, Container, IconButton, InputAdornment, Paper, Snackbar, Tab, Tabs, TextField, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import WorkRoundedIcon from '@mui/icons-material/WorkRounded'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { delay } from '../style'

const dashboardFor = (role: string) => (role === 'ROLE_PROVIDER' ? '/provider/dashboard' : '/client/dashboard')

export default function AuthPage() {
  const { t, lang } = useLang()
  const nav = useNavigate()
  const loggedInRole = localStorage.getItem('role')
  const location = useLocation()
  const [toast, setToast] = useState(() => (location.state as { toast?: string } | null)?.toast ?? '')

  const features = [
    { icon: <BoltRoundedIcon />, title: t('featInstant'), desc: t('featInstantDesc') },
    { icon: <NotificationsActiveRoundedIcon />, title: t('featStatus'), desc: t('featStatusDesc') },
    { icon: <AutoAwesomeRoundedIcon />, title: t('featAny'), desc: t('featAnyDesc') },
  ]

  return (
    <Container sx={{ pt: { xs: 5, md: 9 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' }, gap: { xs: 5, md: 7 }, alignItems: 'center' }}>
        <Box>
          <Chip className="reveal" icon={<AutoAwesomeRoundedIcon />} label={t('heroBadge')} color="primary" variant="outlined"
            sx={theme => ({ mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.08), backdropFilter: 'blur(10px)' })} />
          <Typography className="reveal" style={delay(0.08)} variant="h2" component="h1" sx={{ fontSize: { xs: 38, sm: 48, md: 58 }, lineHeight: 1.05, mb: 2.5 }}>
            {t('heroTitle1')} <span className="gradient-text">{t('heroTitle2')}</span>
          </Typography>
          <Typography className="reveal" style={delay(0.16)} color="text.secondary" sx={{ fontSize: { xs: 16, md: 18 }, maxWidth: 560, mb: 4 }}>
            {t('heroSub')}
          </Typography>

          <Box className="reveal" style={delay(0.24)} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 5 }}>
            {CATEGORIES.map(c => {
              const Icon = c.icon
              return (
                <Chip key={c.key} icon={<Icon style={{ color: c.color }} />} label={c[lang]} variant="outlined"
                  sx={theme => ({ py: 2.25, px: 0.5, borderColor: theme.palette.divider, backgroundColor: alpha(theme.palette.background.paper, 0.5), backdropFilter: 'blur(10px)' })} />
              )
            })}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            {features.map((f, i) => (
              <Paper key={f.title} className="reveal lift" style={delay(0.32 + i * 0.08)} sx={{ p: 2.25 }}>
                <Box sx={{ display: 'inline-grid', placeItems: 'center', width: 40, height: 40, borderRadius: 3, mb: 1.5, color: '#fff', background: 'var(--brand-gradient)' }}>{f.icon}</Box>
                <Typography sx={{ fontWeight: 700 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* A form reads best at a fixed size, so the card stops growing on wide screens */}
        <Box className="reveal" style={delay(0.2)} sx={{ width: '100%', maxWidth: 520, justifySelf: { md: 'end' } }}>
          {loggedInRole
            ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>{t('alreadySignedIn')}</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>{localStorage.getItem('fullName')}</Typography>
                <Button component={Link} to={dashboardFor(loggedInRole)} variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>{t('goDashboard')}</Button>
              </Paper>
            )
            : <AuthCard onDone={role => nav(dashboardFor(role))} suggestions={SPECIALTY_SUGGESTIONS[lang]} />}
        </Box>
      </Box>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{t(toast)}</Alert>
      </Snackbar>
    </Container>
  )
}

function AuthCard({ onDone, suggestions }: { onDone: (role: string) => void; suggestions: string[] }) {
  const { t } = useLang()
  const [tab, setTab] = useState(0)
  const [role, setRole] = useState<'client' | 'provider'>('client')
  const [form, setForm] = useState<Record<string, string>>({})
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const res = tab === 0 ? await auth.login(form)
        : role === 'client' ? await auth.registerClient(form) : await auth.registerProvider(form)
      saveSession(res)
      onDone(res.role)
    } catch (ex) {
      const message = errorMessage(ex)
      // A wrong login stays vague on purpose; a lockout or a validation rule is shown as is
      setErr(tab === 0 && message === 'Bad credentials' ? 'error' : message)
    } finally { setBusy(false) }
  }

  const icon = (el: ReactNode) => ({ startAdornment: <InputAdornment position="start">{el}</InputAdornment> })
  const passwordField = (
    <TextField label={t('password')} type={show ? 'text' : 'password'} required value={form.password || ''} onChange={e => set('password', e.target.value)}
      helperText={tab === 1 ? t('pwMin') : undefined} autoComplete={tab === 0 ? 'current-password' : 'new-password'}
      slotProps={{ input: { ...icon(<LockRoundedIcon />), endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(!show)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
  )

  const switchTab = (v: number) => { if (v !== tab) { setTab(v); setErr('') } }
  // Sign up sits to the right of Sign in, so content slides in from that side
  const dir = tab === 1 ? 'right' : 'left'

  return (
    <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: '0 0 auto 0', height: 4, background: 'var(--brand-gradient)' }} />
      <Box key={`head-${tab}`} className="auth-fade" sx={{ mb: 2.5 }}>
        <Typography variant="h5">{tab === 0 ? t('welcomeBack') : t('createAccount')}</Typography>
        <Typography color="text.secondary">{tab === 0 ? t('welcomeSub') : t('createSub')}</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => switchTab(v)} variant="fullWidth"
        sx={theme => ({ mb: 3, p: 0.5, borderRadius: 3.5, minHeight: 0, backgroundColor: alpha(theme.palette.text.primary, 0.05),
          '& .MuiTabs-indicator': { height: '100%', borderRadius: 3, background: 'var(--brand-gradient)', zIndex: 0, boxShadow: '0 6px 18px -6px var(--brand-glow)', transition: 'left .4s cubic-bezier(.65,0,.35,1), width .4s cubic-bezier(.65,0,.35,1)' },
          '& .MuiTab-root': { zIndex: 1, minHeight: 40, borderRadius: 3, transition: 'color .3s ease' },
          '& .Mui-selected': { color: '#fff !important' } })}>
        <Tab label={t('signIn')} />
        <Tab label={t('signUp')} />
      </Tabs>

      <AutoHeight>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{t(err)}</Alert>}

      <Box key={`form-${tab}`} component="form" onSubmit={submit} className={`auth-swap auth-swap--${dir}`} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tab === 1 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {(['client', 'provider'] as const).map(r => (
              <ButtonBase key={r} onClick={() => setRole(r)} sx={theme => {
                const active = role === r
                return {
                  p: 1.75, borderRadius: 3.5, justifyContent: 'flex-start', gap: 1.25, textAlign: 'left', border: 1.5,
                  borderColor: active ? theme.palette.primary.main : theme.palette.divider,
                  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent', transition: 'all .2s',
                }
              }}>
                <Box sx={{ color: role === r ? 'primary.main' : 'text.secondary', display: 'flex' }}>{r === 'client' ? <PersonRoundedIcon /> : <WorkRoundedIcon />}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t(r)}</Typography>
                  <Typography variant="caption" color="text.secondary">{t(r + 'Desc')}</Typography>
                </Box>
              </ButtonBase>
            ))}
          </Box>
        )}

        <TextField label={t('username')} required value={form.username || ''} onChange={e => set('username', e.target.value)} autoComplete="username" slotProps={{ input: icon(<PersonRoundedIcon />) }} />
        {tab === 1 && (
          <>
            <TextField label={t('fullName')} required value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} autoComplete="name" slotProps={{ input: icon(<BadgeRoundedIcon />) }} />
            <TextField label={t('email')} type="email" required value={form.email || ''} onChange={e => set('email', e.target.value)} autoComplete="email" slotProps={{ input: icon(<EmailRoundedIcon />) }} />
            {role === 'provider' && (
              <Autocomplete className="auth-fade" freeSolo options={suggestions} inputValue={form.specialty || ''} onInputChange={(_, v) => set('specialty', v)}
                renderInput={params => <TextField {...params} label={t('specialty')} />} />
            )}
          </>
        )}
        {passwordField}
        <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ py: 1.4, mt: 0.5 }}
          endIcon={busy ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}>
          {tab === 0 ? t('signIn') : t('signUp')}
        </Button>
      </Box>
      </AutoHeight>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2.5 }}>
        {tab === 0 ? t('noAccount') : t('haveAccount')}{' '}
        <ButtonBase onClick={() => switchTab(1 - tab)} sx={{ fontWeight: 700, fontSize: 'inherit', color: 'primary.main', borderRadius: 1, px: 0.5, verticalAlign: 'baseline', '&:hover': { textDecoration: 'underline' } }}>
          {tab === 0 ? t('signUp') : t('signIn')}
        </ButtonBase>
      </Typography>
    </Paper>
  )
}

// Smoothly animates its height when the content inside changes size
function AutoHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // The padding/negative margin pair leaves room for floating labels and focus rings
  return (
    <Box sx={{ height, m: '-8px -6px', overflow: 'hidden', transition: 'height .4s cubic-bezier(.2,.7,.2,1)' }}>
      <Box ref={inner} sx={{ p: '8px 6px' }}>{children}</Box>
    </Box>
  )
}
