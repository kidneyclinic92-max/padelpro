import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

const PILLARS_FALLBACK = [
  { num: '01', word: 'PRECISION',  copy: 'Every court engineered to ITF standards, every surface installed with sub-millimeter tolerance.' },
  { num: '02', word: 'INTENSITY',  copy: 'Floodlights calibrated for tournament-grade visibility. Climate held within ±2°C of optimal play.' },
  { num: '03', word: 'COMMUNITY',  copy: 'Three thousand obsessed members. Open round-the-clock. The club never sleeps because neither do you.' },
]

function MetricCounter({ target, suffix = '', duration = 1800 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [v, setV] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setV(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>
}

export default function Pillars() {
  const { content } = useSiteContent()
  const pl = content.home.pillars
  const pillarRows = pl.pillars?.length ? pl.pillars : PILLARS_FALLBACK
  const headlineWords = pl.headlineWords?.length ? pl.headlineWords : ['BUILT', 'FOR', 'THE', 'OBSESSED.']
  const accentWord = pl.accentWord || 'OBSESSED.'
  const metrics = pl.metrics?.length ? pl.metrics : [
    { v: 2, s: '', l: 'Courts' },
    { v: 3000, s: '+', l: 'Members' },
    { v: 24, s: '/7', l: 'Open' },
  ]

  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: .4 })

  /* Parallax oversized background word */
  const bgWordX = useTransform(p, [0, 1], ['10%', '-25%'])

  return (
    <section ref={ref} style={section}>
      {/* Oversized parallax word (background) */}
      <motion.div style={{ ...bgWord, x: bgWordX }} aria-hidden>
        {pl.bgWord}
      </motion.div>

      <div style={inner}>
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: .7 }}
          style={topLabel}
        >
          <span style={topDash} />
          {pl.topLabel}
        </motion.div>

        {/* Big introductory line */}
        <h2 style={hed}>
          {headlineWords.map((w, i) => (
            <span key={`${w}-${i}`} style={{ overflow: 'hidden', display: 'inline-block', marginRight: '.32em' }}>
              <motion.span
                initial={{ y: '105%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, delay: .1 + i * .09, ease: [.16,1,.3,1] }}
                style={{
                  display: 'inline-block',
                  color: w === accentWord ? '#c8ff00' : '#f0ede6',
                }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* Pillar rows */}
        <div style={pillarList}>
          {pillarRows.map((row, i) => (
            <motion.article
              key={row.word}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: .9, delay: i * .12, ease: [.16,1,.3,1] }}
              style={pillarRow}
            >
              <div style={pillarNum}>{row.num}</div>
              <h3 style={pillarWord}>{row.word}</h3>
              <p style={pillarCopy}>{row.copy}</p>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.1, delay: i * .12 + .35, ease: [.16,1,.3,1] }}
                style={pillarRule}
              />
            </motion.article>
          ))}
        </div>

        {/* Bottom metric row */}
        <div style={{ ...metricRow, gridTemplateColumns: `repeat(${metrics.length}, 1fr)` }}>
          {metrics.map((m, i) => (
            <motion.div
              key={m.l}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .7, delay: i * .08 }}
              style={metricItem}
            >
              <span style={metricVal}>
                <MetricCounter target={m.v} suffix={m.s} />
              </span>
              <span style={metricLab}>{m.l}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const section = {
  position: 'relative',
  padding: 'clamp(120px,16vh,200px) 0 clamp(140px,18vh,220px)',
  background: '#070707',
  overflow: 'hidden',
  borderTop: '1px solid rgba(240,237,230,.04)',
  borderBottom: '1px solid rgba(240,237,230,.04)',
}
const bgWord = {
  position: 'absolute',
  top: '50%', left: 0, transform: 'translateY(-50%)',
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(180px,30vw,420px)',
  whiteSpace: 'nowrap',
  color: 'rgba(240,237,230,.025)',
  letterSpacing: '-.02em', lineHeight: 1,
  pointerEvents: 'none', userSelect: 'none',
  zIndex: 0,
}
const inner = {
  position: 'relative', zIndex: 1,
  maxWidth: 1320, margin: '0 auto',
  padding: '0 clamp(28px,6vw,96px)',
}
const topLabel = {
  display: 'inline-flex', alignItems: 'center', gap: 12,
  fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase',
  color: 'rgba(200,255,0,.85)',
  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
  marginBottom: 36,
}
const topDash = {
  width: 36, height: 1, background: '#c8ff00', opacity: .6,
}
const hed = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(56px,9vw,140px)',
  lineHeight: .92, letterSpacing: '-.01em',
  marginBottom: 'clamp(80px,10vh,120px)',
}
const pillarList = {
  display: 'flex', flexDirection: 'column', gap: 0,
}
const pillarRow = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr 2fr',
  gap: 'clamp(24px,4vw,72px)',
  padding: 'clamp(32px,5vh,52px) 0',
  alignItems: 'baseline',
}
const pillarNum = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(18px,1.4vw,22px)',
  color: 'rgba(200,255,0,.85)',
  letterSpacing: '.1em',
  fontVariantNumeric: 'tabular-nums',
}
const pillarWord = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(40px,5.5vw,84px)',
  lineHeight: 1, color: '#f0ede6',
  letterSpacing: '-.005em',
}
const pillarCopy = {
  fontSize: 'clamp(14px,1.1vw,16px)',
  lineHeight: 1.7,
  color: 'rgba(240,237,230,.55)',
  maxWidth: 520,
}
const pillarRule = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  height: 1, background: 'rgba(240,237,230,.07)',
  transformOrigin: 'left',
}
const metricRow = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 24, marginTop: 'clamp(80px,10vh,120px)',
  borderTop: '1px solid rgba(240,237,230,.08)',
  paddingTop: 'clamp(40px,6vh,64px)',
}
const metricItem = {
  display: 'flex', flexDirection: 'column', gap: 8,
}
const metricVal = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(48px,6vw,84px)',
  color: '#c8ff00', lineHeight: 1,
  letterSpacing: '-.01em',
  fontVariantNumeric: 'tabular-nums',
}
const metricLab = {
  fontSize: 11, fontWeight: 600, letterSpacing: '.22em',
  textTransform: 'uppercase', color: 'rgba(240,237,230,.45)',
}
