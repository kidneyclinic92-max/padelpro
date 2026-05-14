import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

const PANELS_FALLBACK = [
  { idx: '01', tag: 'COMPETITION', title: 'Tournament Series', caption: 'Weekly ladders · monthly opens · annual championship.', accent: '#ff7a3d' },
  { idx: '02', tag: 'RECOVERY', title: 'Recovery Lounge', caption: 'Cryo · sauna · physio — built into every membership.', accent: '#00d2ff' },
  { idx: '03', tag: 'SOCIAL', title: 'The Members Bar', caption: 'Late kitchen · curated wines · padel on every screen.', accent: '#c8ff00' },
]

export default function Reel() {
  const { content } = useSiteContent()
  const rl = content.home.reel
  const panels = rl.panels?.length ? rl.panels : PANELS_FALLBACK
  const n = Math.max(1, panels.length)
  const reelSectionHeight = `${Math.round(350 * (n / 4))}vh`
  const reelXEnd = `${-((n - 1) / n) * 100}%`
  const reelTotalStr = String(n).padStart(2, '0')

  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: .4 })

  /* Horizontal travel — translates the inner track sideways */
  const x = useTransform(p, [0, 1], ['0%', reelXEnd])

  return (
    <section ref={ref} style={{ ...section, height: reelSectionHeight }}>
      <div style={sticky}>
        {/* Top fixed label */}
        <div style={topbar}>
          <span style={topLabel}>
            <span style={topDash} />
            {rl.topLabel}
          </span>
          <span style={topHint}>{rl.topHint}</span>
        </div>

        {/* Horizontal track */}
        <motion.div style={{ ...track, x }}>
          {panels.map((panel, i) => (
            <article key={panel.idx} style={panelStyle}>
              {/* Panel index */}
              <div style={panelIndex}>{panel.idx} / {reelTotalStr}</div>

              {/* Visual block */}
              <div style={{
                ...panelVisual,
                background: `linear-gradient(155deg, rgba(15,15,15,.95), rgba(8,8,8,.85)), radial-gradient(circle at 70% 30%, ${panel.accent}28 0%, transparent 60%)`,
              }}>
                {/* Animated grid backdrop */}
                <div style={panelGrid} aria-hidden />
                {/* Floating accent square */}
                <motion.div
                  aria-hidden
                  style={{ ...panelAccent, borderColor: `${panel.accent}55` }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 40 + i * 8, ease: 'linear', repeat: Infinity }}
                />
                {/* Big number echo */}
                <div style={panelBigNum}>{panel.idx}</div>

                {/* Bottom-right accent line */}
                <div style={{ ...panelEdge, background: panel.accent }} />
              </div>

              {/* Caption */}
              <div style={panelCaption}>
                <div style={{ ...panelTag, color: panel.accent }}>{panel.tag}</div>
                <h3 style={panelTitle}>{panel.title}</h3>
                <p style={panelCopy}>{panel.caption}</p>
              </div>
            </article>
          ))}
        </motion.div>

        {/* Progress dots */}
        <div style={dotsRow}>
          {panels.map((_, i) => (
            <Dot key={i} progress={scrollYProgress} idx={i} total={panels.length} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Dot({ progress, idx, total }) {
  const clamp = (n) => Math.max(0.0001, Math.min(0.9999, n))
  const lo = idx / total
  const hi = (idx + 1) / total
  const opacity = useTransform(
    progress,
    [clamp(lo - .05), clamp(lo + .05), clamp(hi - .05), clamp(hi + .05)],
    [.25, 1, 1, .25],
  )
  return (
    <motion.span style={{ ...dot, opacity }} />
  )
}

const section = {
  position: 'relative',
  background: '#050505',
}
const sticky = {
  position: 'sticky', top: 0,
  height: '100vh', width: '100%',
  overflow: 'hidden',
  display: 'flex', alignItems: 'center',
}
const topbar = {
  position: 'absolute', top: 'clamp(96px,12vh,128px)',
  left: 'clamp(28px,6vw,96px)', right: 'clamp(28px,6vw,96px)', zIndex: 5,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const topLabel = {
  display: 'inline-flex', alignItems: 'center', gap: 12,
  fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase',
  color: 'rgba(200,255,0,.85)',
  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
}
const topDash = { width: 36, height: 1, background: '#c8ff00', opacity: .6 }
const topHint = {
  fontSize: 10, letterSpacing: '.3em',
  color: 'rgba(240,237,230,.4)', fontWeight: 600,
}

const track = {
  display: 'flex',
  gap: 'clamp(40px,6vw,80px)',
  paddingLeft: 'clamp(28px,6vw,96px)',
  paddingRight: '40vw',
  willChange: 'transform',
}
const panelStyle = {
  flexShrink: 0,
  width: 'clamp(420px,52vw,640px)',
  display: 'flex', flexDirection: 'column', gap: 24,
}
const panelIndex = {
  fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase',
  color: 'rgba(240,237,230,.4)', fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
}
const panelVisual = {
  position: 'relative',
  height: 'clamp(280px,42vh,420px)',
  borderRadius: 4,
  border: '1px solid rgba(240,237,230,.08)',
  overflow: 'hidden',
}
const panelGrid = {
  position: 'absolute', inset: 0,
  backgroundImage: `
    linear-gradient(rgba(240,237,230,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240,237,230,.03) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
}
const panelAccent = {
  position: 'absolute',
  top: '20%', right: '12%',
  width: 'clamp(80px,12vw,160px)', height: 'clamp(80px,12vw,160px)',
  border: '1px solid',
  pointerEvents: 'none',
}
const panelBigNum = {
  position: 'absolute', bottom: '-18px', left: '6%',
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(140px,22vw,260px)',
  color: 'rgba(240,237,230,.04)',
  lineHeight: 1, letterSpacing: '-.04em',
  pointerEvents: 'none',
}
const panelEdge = {
  position: 'absolute', bottom: 0, right: 0,
  width: 'clamp(80px,12vw,140px)', height: 2,
  opacity: .6,
}
const panelCaption = {
  display: 'flex', flexDirection: 'column', gap: 8,
}
const panelTag = {
  fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', fontWeight: 600,
}
const panelTitle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(32px,3.6vw,56px)',
  lineHeight: 1, color: '#f0ede6',
  letterSpacing: '-.005em',
}
const panelCopy = {
  fontSize: 14, lineHeight: 1.6,
  color: 'rgba(240,237,230,.5)',
  maxWidth: 380,
}

const dotsRow = {
  position: 'absolute', bottom: 'clamp(56px,8vh,96px)', left: '50%',
  transform: 'translateX(-50%)', zIndex: 5,
  display: 'flex', gap: 14,
}
const dot = {
  display: 'block', width: 30, height: 2,
  background: '#c8ff00', borderRadius: 1,
}
