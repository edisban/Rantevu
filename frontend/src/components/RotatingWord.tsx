import { useEffect, useState } from 'react'

const STEP_MS = 3000
const SLIDE_MS = 600

// Slides through the words one after another. The first word is repeated at the end, so the last
// step slides on to it and then jumps back to the start without a visible rewind.
// Screen readers get the whole list once instead of a word that keeps changing.
export default function RotatingWord({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const [snap, setSnap] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let jump: number | undefined
    const timer = window.setInterval(() => {
      setSnap(false)
      setIndex(i => {
        const next = i + 1
        if (next === words.length) jump = window.setTimeout(() => { setSnap(true); setIndex(0) }, SLIDE_MS + 50)
        return next
      })
    }, STEP_MS)
    return () => { window.clearInterval(timer); window.clearTimeout(jump) }
  }, [words])

  return (
    <>
      <span className="rot" aria-hidden>
        <span className="rot__inner" style={{ transform: `translateY(-${index * 1.2}em)`, transition: snap ? 'none' : undefined }}>
          {[...words, words[0]].map((w, i) => <span key={i} className={className}>{w}</span>)}
        </span>
      </span>
      <span className="sr-only">{words.join(', ')}</span>
    </>
  )
}
