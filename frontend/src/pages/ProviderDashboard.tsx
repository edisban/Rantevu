import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api'
import type { Appointment, ProfileResponse, Provider } from '../types'
import { useLang } from '../i18n'
import { DateBlock, EmptyState, PersonAvatar, StatTile, StatusChip } from '../components/ui'
import { formatDateTime } from '../format'
import { Alert, Box, Button, Container, Paper, Snackbar, Tab, Tabs, Typography } from '@mui/material'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import { delay } from '../style'

export default function ProviderDashboard() {
  const { t, locale } = useLang()
  const [appts, setAppts] = useState<Appointment[]>([])
  const [profile, setProfile] = useState<Provider | null | undefined>(undefined)
  const [tab, setTab] = useState(0)
  const location = useLocation()
  const nav = useNavigate()
  // Pages that redirect here (e.g. after saving the profile) can pass a message key to show
  const [toast, setToast] = useState(() => (location.state as { toast?: string } | null)?.toast ?? '')
  const [err, setErr] = useState('')

  const load = () => api<Appointment[]>('/api/appointments/mine').then(setAppts).catch(e => setErr(errorMessage(e)))
  useEffect(() => {
    load()
    api<ProfileResponse>('/api/profile').then(d => setProfile(d.profile)).catch(() => setProfile(null))
    // Clear the one-time message so a page refresh doesn't show it again
    if (location.state) nav(location.pathname, { replace: true, state: null })
  }, [])

  const setStatus = async (id: number, status: string) => {
    try {
      await api(`/api/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
      setToast('updated'); load()
    } catch (e) { setErr(errorMessage(e)) }
  }

  const now = new Date()
  const pending = appts.filter(a => a.status === 'PENDING' && new Date(a.appointmentDate) >= now)
  const upcoming = appts.filter(a => a.status === 'ACCEPTED' && new Date(a.appointmentDate) >= now)
  // Soonest first for actionable lists, newest first for history
  const lists = [[...pending].reverse(), [...upcoming].reverse(), appts]
  const shown = lists[tab]!
  const incomplete = profile !== undefined && (!profile?.specialty || !profile?.address || profile?.pricePerVisit == null)
  const firstName = (localStorage.getItem('fullName') || '').split(' ')[0]

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
      <Box className="reveal" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 40 } }}>{t('hello', { name: '' })}<span className="gradient-text">{firstName}</span></Typography>
          <Typography color="text.secondary" sx={{ fontSize: 17 }}>{t('providerSub')}</Typography>
        </Box>
        <Button component={Link} to="/profile" variant="outlined" startIcon={<EditRoundedIcon />}>{t('editProfile')}</Button>
      </Box>

      {incomplete && (
        <Alert severity="info" className="reveal" sx={{ mb: 3 }}
          action={<Button component={Link} to="/profile" color="inherit" size="small">{t('editProfile')}</Button>}>
          <strong>{t('completeProfile')}</strong> — {t('completeProfileDesc')}
        </Alert>
      )}
      {err && <Alert severity="error" onClose={() => setErr('')} sx={{ mb: 3 }}>{t(err)}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        <StatTile icon={<HourglassTopRoundedIcon />} label={t('statPending')} value={pending.length} color="#f59e0b" delay={0.05} />
        <StatTile icon={<EventAvailableRoundedIcon />} label={t('statUpcoming')} value={upcoming.length} color="var(--brand-a)" delay={0.1} />
        <StatTile icon={<InsightsRoundedIcon />} label={t('statTotal')} value={appts.length} color="var(--brand-b)" delay={0.15} />
      </Box>

      <Paper className="reveal" style={delay(0.2)} sx={{ p: { xs: 2, sm: 3 } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTabs-indicator': { height: 3, borderRadius: 3, background: 'var(--brand-gradient)' } }}>
          <Tab label={`${t('tabPending')} (${pending.length})`} />
          <Tab label={`${t('tabUpcoming')} (${upcoming.length})`} />
          <Tab label={t('tabAll')} />
        </Tabs>

        {shown.length === 0 && <EmptyState icon={<InboxRoundedIcon fontSize="large" />} title={t('noRequests')} desc={t('noRequestsDesc')} />}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {shown.map((a, i) => {
            const d = new Date(a.appointmentDate)
            const future = d >= now
            return (
              <Paper key={a.id} className="reveal" style={delay(Math.min(i, 8) * 0.04)}
                sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', boxShadow: 'none' }}>
                <DateBlock date={d} />
                <PersonAvatar name={a.client.fullName} size={44} />
                <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700 }}>{a.client.fullName}</Typography>
                    <StatusChip status={a.status} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{formatDateTime(d, locale)}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', color: 'text.secondary', mt: 0.5 }}>
                    {a.client.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailRoundedIcon sx={{ fontSize: 16 }} /><Typography variant="caption">{a.client.email}</Typography></Box>}
                    {a.client.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneRoundedIcon sx={{ fontSize: 16 }} /><Typography variant="caption">{a.client.phone}</Typography></Box>}
                  </Box>
                  {a.notes && <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>“{a.notes}”</Typography>}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Button component={Link} to={`/messages?with=${a.client.id}`} color="inherit" startIcon={<ChatBubbleOutlineRoundedIcon />}>{t('message')}</Button>
                  {a.status === 'PENDING' && future && (
                    <>
                      <Button variant="outlined" color="error" startIcon={<CloseRoundedIcon />} onClick={() => setStatus(a.id, 'REJECTED')}>{t('reject')}</Button>
                      <Button variant="contained" startIcon={<CheckRoundedIcon />} onClick={() => setStatus(a.id, 'ACCEPTED')}>{t('accept')}</Button>
                    </>
                  )}
                  {a.status === 'ACCEPTED' && future && (
                    <Button color="error" onClick={() => setStatus(a.id, 'CANCELLED')}>{t('cancelAppt')}</Button>
                  )}
                </Box>
              </Paper>
            )
          })}
        </Box>
      </Paper>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{t(toast)}</Alert>
      </Snackbar>
    </Container>
  )
}
