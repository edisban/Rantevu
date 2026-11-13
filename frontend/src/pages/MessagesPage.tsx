import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Alert, Badge, Box, ButtonBase, Chip, CircularProgress, Container, IconButton, Paper, TextField, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import ForumRoundedIcon from '@mui/icons-material/ForumRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import { api, errorMessage } from '../api'
import { useChat } from '../chat'
import { NONE, keys, useContacts, useThread } from '../queries'
import { useLang } from '../i18n'
import { EmptyState, PersonAvatar } from '../components/ui'
import { formatTime } from '../format'
import type { ChatMessage, Contact } from '../types'

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export default function MessagesPage() {
  const { t, locale } = useLang()
  const { connected, refreshUnread, onMessage, setOpenPeer } = useChat()
  const me = Number(localStorage.getItem('userId'))
  const [params, setParams] = useSearchParams()
  const activeId = params.get('with') ? Number(params.get('with')) : null

  const queryClient = useQueryClient()
  const contactsQuery = useContacts()
  const threadQuery = useThread(activeId)
  const contacts = contactsQuery.data ?? (contactsQuery.isError ? NONE : null)
  const thread = activeId == null ? null : threadQuery.data ?? (threadQuery.isError ? NONE : null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const loadError = contactsQuery.error ?? threadQuery.error
  const shownErr = err || (loadError ? errorMessage(loadError) : '')
  const scroller = useRef<HTMLDivElement>(null)

  const active = contacts?.find(c => c.userId === activeId) ?? null
  const select = (id: number | null) => setParams(id ? { with: String(id) } : {})

  // Adds a message to a cached conversation once, whether it came from the socket or from our own POST
  const addToThread = useCallback((peer: number, m: ChatMessage) =>
    queryClient.setQueryData<ChatMessage[]>(keys.thread(peer), th => (th && !th.some(x => x.id === m.id) ? [...th, m] : th)),
  [queryClient])

  // Keep the open conversation's messages out of the unread badge
  useEffect(() => {
    setOpenPeer(activeId)
    return () => setOpenPeer(null)
  }, [activeId, setOpenPeer])

  // Loading a conversation marks it read on the server: mirror that in the list and the badge
  useEffect(() => {
    if (activeId == null || !threadQuery.isSuccess) return
    queryClient.setQueryData<Contact[]>(keys.contacts, cs => cs?.map(c => (c.userId === activeId ? { ...c, unread: 0 } : c)))
    refreshUnread()
  }, [activeId, threadQuery.isSuccess, threadQuery.dataUpdatedAt, queryClient, refreshUnread])

  // Live updates: append to the conversation and refresh previews in the list
  useEffect(() => onMessage(m => {
    const other = m.senderId === me ? m.receiverId : m.senderId
    addToThread(other, m)
    if (other === activeId && m.senderId === other) void api(`/api/messages/${other}/read`, { method: 'PUT' }).catch(() => {})
    queryClient.setQueryData<Contact[]>(keys.contacts, cs => {
      if (!cs) return cs
      const updated = cs.map(c => c.userId !== other ? c : {
        ...c, lastMessage: m.content, lastAt: m.createdAt, lastFromMe: m.senderId === me,
        unread: other === activeId || m.senderId === me ? c.unread : c.unread + 1,
      })
      return [...updated].sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''))
    })
  }), [onMessage, me, activeId, queryClient, addToThread])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread])

  const send = async () => {
    const content = draft.trim()
    if (!content || activeId == null) return
    setSending(true); setErr('')
    try {
      const m = await api<ChatMessage>(`/api/messages/${activeId}`, { method: 'POST', body: JSON.stringify({ content }) })
      setDraft('')
      // The same message also arrives over the socket; the id check keeps it from showing twice
      addToThread(activeId, m)
    } catch (e) { setErr(errorMessage(e)) } finally { setSending(false) }
  }

  const subtitle = (c: Contact) => c.specialty || (c.role === 'ROLE_CLIENT' ? t('client') : t('provider'))
  const shortTime = (iso: string) => {
    const d = new Date(iso)
    return sameDay(d, new Date()) ? formatTime(d, locale) : d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  }
  const dayLabel = (d: Date) => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (sameDay(d, new Date())) return t('today')
    if (sameDay(d, yesterday)) return t('yesterday')
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const list = (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: { md: 1 }, borderColor: { md: 'divider' } }}>
      <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{t('messages')}</Typography>
        <LiveDot connected={connected} />
      </Box>
      <Box sx={{ overflowY: 'auto', px: 1.25, pb: 1.25, flex: 1 }}>
        {!contacts && <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress size={28} /></Box>}
        {contacts?.length === 0 && (
          <Box sx={{ p: 1.25 }}><EmptyState icon={<ForumRoundedIcon fontSize="large" />} title={t('chatEmpty')} desc={t('chatEmptyDesc')} /></Box>
        )}
        {contacts?.map(c => (
          <ButtonBase key={c.userId} onClick={() => select(c.userId)}
            sx={theme => ({
              width: '100%', p: 1.25, mb: 0.5, gap: 1.5, borderRadius: 3.5, justifyContent: 'flex-start', textAlign: 'left', transition: 'background-color .2s',
              backgroundColor: c.userId === activeId ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) },
            })}>
            <Badge color="error" badgeContent={c.unread} max={99} overlap="circular">
              <PersonAvatar name={c.fullName} specialty={c.specialty} size={46} />
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography noWrap sx={{ fontWeight: 700, flex: 1 }}>{c.fullName}</Typography>
                {c.lastAt && <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{shortTime(c.lastAt)}</Typography>}
              </Box>
              <Typography variant="body2" noWrap color={c.unread ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: c.unread ? 700 : 400 }}>
                {c.lastMessage ? `${c.lastFromMe ? t('you') + ': ' : ''}${c.lastMessage}` : subtitle(c)}
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  )

  const conversation = active ? (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => select(null)} sx={{ display: { md: 'none' } }} aria-label="back"><ArrowBackRoundedIcon /></IconButton>
        <PersonAvatar name={active.fullName} specialty={active.specialty} size={42} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700 }}>{active.fullName}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{subtitle(active)}</Typography>
        </Box>
        <Box sx={{ display: { md: 'none' } }}><LiveDot connected={connected} /></Box>
      </Box>

      <Box ref={scroller} sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {!thread && <Box sx={{ display: 'grid', placeItems: 'center', flex: 1 }}><CircularProgress size={28} /></Box>}
        {thread?.length === 0 && (
          <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.6 }} />
            <Typography>{t('startChat')}</Typography>
          </Box>
        )}
        {thread?.map((m, i) => {
          const mine = m.senderId === me
          const d = new Date(m.createdAt)
          const prev = thread[i - 1]
          const newDay = !prev || !sameDay(d, new Date(prev.createdAt))
          return (
            <Fragment key={m.id}>
              {newDay && <Chip size="small" label={dayLabel(d)} sx={{ alignSelf: 'center', my: 1.5, backdropFilter: 'blur(8px)' }} />}
              <Box className="bubble-in" sx={theme => ({
                alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: { xs: '85%', sm: '70%' }, px: 1.75, py: 1,
                borderRadius: '18px', [mine ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: '6px',
                ...(mine
                  ? { background: 'var(--brand-gradient)', color: '#fff', boxShadow: '0 8px 20px -12px var(--brand-glow)' }
                  : { backgroundColor: alpha(theme.palette.text.primary, 0.07), border: 1, borderColor: 'divider' }),
              })}>
                <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 15 }}>{m.content}</Typography>
                <Typography sx={{ fontSize: 11, opacity: 0.7, textAlign: 'right', mt: 0.25 }}>{formatTime(d, locale)}</Typography>
              </Box>
            </Fragment>
          )
        })}
      </Box>

      <Box component="form" onSubmit={e => { e.preventDefault(); void send() }}
        sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
        <TextField fullWidth multiline maxRows={4} size="small" placeholder={t('typeMessage')} value={draft}
          onChange={e => setDraft(e.target.value)} slotProps={{ htmlInput: { maxLength: 2000 } }}
          // Enter sends, Shift+Enter adds a new line
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }} />
        <IconButton type="submit" disabled={!draft.trim() || sending} aria-label={t('send')}
          sx={{ width: 44, height: 44, color: '#fff', background: 'var(--brand-gradient)', '&.Mui-disabled': { color: '#fff', opacity: 0.45 } }}>
          {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  ) : (
    <Box sx={{ flex: 1, display: { xs: 'none', md: 'grid' }, placeItems: 'center', p: 4 }}>
      <EmptyState icon={<ChatBubbleOutlineRoundedIcon fontSize="large" />} title={t('selectChat')} desc={t('chatEmptyDesc')} />
    </Box>
  )

  return (
    <Container sx={{ pt: { xs: 3, md: 5 } }}>
      {shownErr && <Alert severity="error" onClose={() => setErr('')} sx={{ mb: 2 }}>{t(shownErr)}</Alert>}
      <Paper className="reveal" sx={{
        p: 0, overflow: 'hidden', height: { xs: 'calc(100dvh - 140px)', md: 'calc(100dvh - 190px)' }, minHeight: 480,
        display: 'grid', gridTemplateColumns: { xs: '1fr', md: '330px 1fr', xl: '380px 1fr' }, gridTemplateRows: 'minmax(0, 1fr)',
      }}>
        {/* On phones show either the list or the open conversation */}
        <Box sx={{ display: { xs: active ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', minHeight: 0 }}>{list}</Box>
        <Box sx={{ display: { xs: active ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', minHeight: 0 }}>{conversation}</Box>
      </Paper>
    </Container>
  )
}

function LiveDot({ connected }: { connected: boolean }) {
  const { t } = useLang()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
      <Box className={connected ? 'live-dot' : undefined}
        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: connected ? 'success.main' : 'warning.main' }} />
      {connected ? t('live') : t('connecting')}
    </Box>
  )
}
