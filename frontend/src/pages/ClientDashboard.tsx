import { useEffect, useMemo, useState } from 'react'
import { api, errorMessage } from '../api'
import type { Appointment, Provider } from '../types'
import { useLang } from '../i18n'
import { CATEGORIES, categoryOf, normalize } from '../categories'
import BookingDialog from '../components/BookingDialog'
import { DateBlock, EmptyState, PersonAvatar, StatusChip } from '../components/ui'
import { formatTime } from '../format'
import { Alert, Box, Button, Chip, Container, IconButton, InputAdornment, Paper, Skeleton, Snackbar, TextField, Tooltip, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import { alpha } from '@mui/material/styles'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import AppsRoundedIcon from '@mui/icons-material/AppsRounded'
import { delay } from '../style'

export default function ClientDashboard() {
  const { t, lang, locale } = useLang()
  const [providers, setProviders] = useState<Provider[] | null>(null)
  const [appts, setAppts] = useState<Appointment[]>([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  const [booking, setBooking] = useState<Provider | null>(null)
  const location = useLocation()
  const nav = useNavigate()
  const [toast, setToast] = useState(() => (location.state as { toast?: string } | null)?.toast ?? '')
  const [err, setErr] = useState('')

  const loadAppts = () => api<Appointment[]>('/api/appointments/mine').then(setAppts).catch(e => setErr(errorMessage(e)))
  useEffect(() => {
    api<Provider[]>('/api/providers').then(setProviders).catch(e => { setProviders([]); setErr(errorMessage(e)) })
    loadAppts()
    // Clear the one-time message so a page refresh doesn't show it again
    if (location.state) nav(location.pathname, { replace: true, state: null })
  }, [])

  const filtered = useMemo(() => (providers ?? []).filter(p => {
    if (cat && categoryOf(p.specialty)?.key !== cat) return false
    const s = normalize(q.trim())
    if (!s) return true
    return [p.fullName, p.specialty, p.address].some(v => normalize(v || '').includes(s))
  }), [providers, q, cat])

  const specialtyById = useMemo(() => new Map((providers ?? []).map(p => [p.userId, p.specialty])), [providers])
  const now = new Date()
  const upcoming = appts.filter(a => new Date(a.appointmentDate) >= now).reverse()
  const past = appts.filter(a => new Date(a.appointmentDate) < now)

  const cancel = async (id: number) => {
    try {
      await api(`/api/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'CANCELLED' }) })
      setToast(t('updated')); loadAppts()
    } catch (e) { setErr(errorMessage(e)) }
  }

  const firstName = (localStorage.getItem('fullName') || '').split(' ')[0]

  return (
    <Container sx={{ pt: { xs: 4, md: 6 } }}>
      <Box className="reveal" sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 40 } }}>{t('hello', { name: '' })}<span className="gradient-text">{firstName}</span></Typography>
        <Typography color="text.secondary" sx={{ fontSize: 17 }}>{t('clientSub')}</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px', xl: '1fr 420px' }, gap: 3, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Paper className="reveal" style={delay(0.06)} sx={{ p: 2, mb: 3 }}>
            <TextField fullWidth placeholder={t('searchPh')} value={q} onChange={e => setQ(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'thin' }}>
              <Chip icon={<AppsRoundedIcon />} label={t('all')} clickable onClick={() => setCat(null)} color={cat === null ? 'primary' : 'default'} variant={cat === null ? 'filled' : 'outlined'} />
              {CATEGORIES.map(c => {
                const Icon = c.icon
                const active = cat === c.key
                return (
                  <Chip key={c.key} icon={<Icon style={{ color: active ? '#fff' : c.color }} />} label={c[lang]} clickable onClick={() => setCat(active ? null : c.key)}
                    variant={active ? 'filled' : 'outlined'} sx={active ? { backgroundColor: c.color, color: '#fff', '&:hover': { backgroundColor: c.color } } : undefined} />
                )
              })}
            </Box>
          </Paper>

          {err && <Alert severity="error" onClose={() => setErr('')} sx={{ mb: 2 }}>{t(err)}</Alert>}
          {providers && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>{t('found', { n: filtered.length })}</Typography>}

          {!providers && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
              {[0, 1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={210} sx={{ borderRadius: 5 }} />)}
            </Box>
          )}
          {providers && filtered.length === 0 && <EmptyState icon={<PersonSearchRoundedIcon fontSize="large" />} title={t('noProviders')} desc={t('noProvidersDesc')} />}

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
            {filtered.map((p, i) => {
              const c = categoryOf(p.specialty)
              return (
                <Paper key={p.userId} className="reveal lift" style={delay(0.1 + Math.min(i, 8) * 0.05)}
                  sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, borderRadius: 5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <PersonAvatar name={p.fullName} specialty={p.specialty} size={52} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 17 }} noWrap>{p.fullName}</Typography>
                      {p.specialty && (
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: c?.color ?? 'secondary.main' }}>{p.specialty}</Typography>
                      )}
                    </Box>
                  </Box>
                  {p.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.bio}</Typography>
                  )}
                  {p.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <PlaceRoundedIcon fontSize="small" /><Typography variant="body2" noWrap>{p.address}</Typography>
                    </Box>
                  )}
                  <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider' }}>
                    <Typography>
                      {p.pricePerVisit != null && <><Box component="span" sx={{ fontWeight: 800, fontSize: 20 }}>€{p.pricePerVisit}</Box> <Box component="span" sx={{ color: 'text.secondary', fontSize: 13 }}>{t('perVisit')}</Box></>}
                    </Typography>
                    <Button variant="contained" size="small" startIcon={<EventAvailableRoundedIcon />} onClick={() => setBooking(p)}>{t('book')}</Button>
                  </Box>
                </Paper>
              )
            })}
          </Box>
        </Box>

        <Paper className="reveal" style={delay(0.12)} sx={{ p: 2.5, position: { md: 'sticky' }, top: { md: 104 }, order: { xs: -1, md: 0 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('myAppointments')}</Typography>
          {appts.length === 0 && <EmptyState icon={<EventAvailableRoundedIcon fontSize="large" />} title={t('noAppointments')} desc={t('noAppointmentsDesc')} />}
          {[{ label: t('upcoming'), list: upcoming }, { label: t('past'), list: past.slice(0, 5) }].map(group => group.list.length > 0 && (
            <Box key={group.label} sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{group.label}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.5 }}>
                {group.list.map(a => {
                  const d = new Date(a.appointmentDate)
                  const open = (a.status === 'PENDING' || a.status === 'ACCEPTED') && d >= now
                  return (
                    <Box key={a.id} sx={theme => ({ display: 'flex', gap: 1.5, p: 1.25, borderRadius: 3.5, backgroundColor: alpha(theme.palette.text.primary, 0.035), opacity: d < now ? 0.75 : 1 })}>
                      <DateBlock date={d} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>{a.provider.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {formatTime(d, locale)}{specialtyById.get(a.provider.id) ? ` · ${specialtyById.get(a.provider.id)}` : ''}
                        </Typography>
                        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StatusChip status={a.status} />
                          <Tooltip title={t('message')}>
                            <IconButton component={Link} to={`/messages?with=${a.provider.id}`} size="small" color="primary" sx={{ ml: 'auto' }} aria-label={t('message')}>
                              <ChatBubbleOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {open && <Button size="small" color="error" onClick={() => cancel(a.id)} sx={{ minWidth: 0 }}>{t('cancelAppt')}</Button>}
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          ))}
        </Paper>
      </Box>

      <BookingDialog key={booking?.userId ?? 'none'} provider={booking} onClose={() => setBooking(null)} onBooked={() => { setBooking(null); setToast(t('requestSent')); loadAppts() }} />
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
      </Snackbar>
    </Container>
  )
}
