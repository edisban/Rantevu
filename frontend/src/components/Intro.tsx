import { useEffect, useState } from 'react'
import { LogoMark } from './Logo'
import { useLang } from '../i18n'

const KEY = 'introSeen'

function alreadySeen() {
  try { return sessionStorage.getItem(KEY) === '1' } catch { return false }
}

// Full-screen splash shown once per browser session. Click to skip.
export default function Intro() {
  const { t } = useLang()
  const [phase, setPhase] = useState<'show' | 'leave' | 'done'>(() => (alreadySeen() ? 'done' : 'show'))

  useEffect(() => {
    if (phase !== 'show') return
    try { sessionStorage.setItem(KEY, '1') } catch { /* storage blocked */ }
    const leave = setTimeout(() => setPhase('leave'), 2500)
    return () => clearTimeout(leave)
  }, [phase])

  useEffect(() => {
    if (phase !== 'leave') return
    const done = setTimeout(() => setPhase('done'), 700)
    return () => clearTimeout(done)
  }, [phase])

  if (phase === 'done') return null
  return (
    <div className={`intro${phase === 'leave' ? ' intro--leave' : ''}`} onClick={() => setPhase('leave')} role="presentation">
      <div className="intro__glow" />
      <div className="intro__mark"><LogoMark size={104} animated /></div>
      <div className="intro__word" aria-label="Rantevu">
        {'Rantevu'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${0.75 + i * 0.06}s` }}>{c}</span>)}
      </div>
      <div className="intro__tag">{t('tagline')}</div>
      <div className="intro__bar" />
    </div>
  )
}
