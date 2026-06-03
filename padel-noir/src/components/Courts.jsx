import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

const COURTS_FALLBACK = [
  { n: '01', name: 'COURT NO 1', badge: 'Panoramic Glass',   color: '#0e1a0a', accent: '#1d320f' },
  { n: '02', name: 'COURT NO 2', badge: 'Hardcourt Surface', color: '#080d18', accent: '#0d1630' },
]

function CourtCard({ court, onBook, delay, bookLabel }) {
  const ref      = useRef(null)
  const inView   = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState(false)
  const [tilted,  setTilted]  = useState({ x: 0, y: 0 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width  - 0.5
    const py = (e.clientY - rect.top)  / rect.height - 0.5
    setTilted({ x: py * 10, y: -px * 10 })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: .8, delay, ease: [.16,1,.3,1] }}
      className="court-card"
      style={{
        ...cardStyle,
        background: `linear-gradient(160deg, ${court.accent} 0%, ${court.color} 100%)`,
        rotateX: hovered ? tilted.x : 0,
        rotateY: hovered ? tilted.y : 0,
        transformPerspective: 800,
        boxShadow: hovered ? `0 28px 60px rgba(0,0,0,.6), 0 0 40px rgba(200,255,0,.06)` : '0 8px 32px rgba(0,0,0,.4)',
        transition: 'box-shadow .4s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilted({ x: 0, y: 0 }) }}
      onMouseMove={handleMove}
      data-hover
    >
      {/* Grid pattern */}
      <div style={patternStyle} />

      {/* Lime corner accent */}
      <div style={cornerAccent} />

      {/* Number watermark */}
      <span style={numWmark}>{court.n}</span>

      {/* Info */}
      <div style={infoLayer}>
        <motion.span
          style={badgeStyle}
          animate={{ opacity: hovered ? 1 : .8 }}
        >
          {court.badge}
        </motion.span>
        <div style={nameStyle}>{court.name}</div>
      </div>

      {/* Hover CTA */}
      <motion.div
        style={bookLayer}
        animate={{ y: hovered ? 0 : '100%' }}
        transition={{ duration: .35, ease: [.4,0,.2,1] }}
        onClick={onBook}
      >
        {bookLabel}
      </motion.div>
    </motion.div>
  )
}

export default function Courts({ onBook }) {
  const { content } = useSiteContent()
  const ct = content.sections.courts
  const COURTS = ct.cards?.length ? ct.cards : COURTS_FALLBACK
  const scrollRef  = useRef(null)
  const headerRef  = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const drag = useRef({ down: false, startX: 0, sl: 0 })

  const onDown = (e) => { drag.current = { down: true, startX: e.pageX - scrollRef.current.offsetLeft, sl: scrollRef.current.scrollLeft } }
  const onUp   = ()  => { drag.current.down = false }
  const onMove = (e) => {
    if (!drag.current.down) return
    e.preventDefault()
    scrollRef.current.scrollLeft = drag.current.sl - (e.pageX - scrollRef.current.offsetLeft - drag.current.startX)
  }

  return (
    <section id="courts" className="site-section" style={{ padding: '130px 0', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid lines */}
      <div style={bgGrid} aria-hidden />

      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 32 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: .7, ease: [.4,0,.2,1] }}
        className="section-inner courts-header-inner"
        style={{ margin: '0 auto 52px' }}
      >
        <div className="section-label">{ct.sectionLabel}</div>
        <div className="courts-header-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontSize: 'clamp(52px,7vw,100px)', lineHeight: .92 }}>
            {ct.titleLine1}<br />{ct.titleLine2}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,.5)', maxWidth: 280, marginBottom: 8 }}>
            {ct.stripCaption}
          </p>
        </div>
      </motion.div>

      <div
        ref={scrollRef}
        onMouseDown={onDown}
        onMouseLeave={onUp}
        onMouseUp={onUp}
        onMouseMove={onMove}
        className="courts-strip"
        style={stripStyle}
      >
        {COURTS.map((c, i) => (
          <CourtCard key={c.name} court={c} onBook={onBook} delay={i * .07} bookLabel={ct.bookLayer} />
        ))}
        {/* Spacer */}
        <div style={{ flex: '0 0 24px' }} />
      </div>

      {/* Scroll hint fade */}
      <div className="courts-fade-right" style={fadeRight} aria-hidden />
    </section>
  )
}

const cardStyle = {
  flex: '0 0 360px', height: 480,
  scrollSnapAlign: 'start',
  borderRadius: 6, position: 'relative',
  overflow: 'hidden', cursor: 'pointer',
  willChange: 'transform',
  userSelect: 'none',
}
const patternStyle = {
  position: 'absolute', inset: 0,
  opacity: .05,
  backgroundImage: 'linear-gradient(#c8ff00 1px,transparent 1px),linear-gradient(90deg,#c8ff00 1px,transparent 1px)',
  backgroundSize: '48px 48px',
}
const cornerAccent = {
  position: 'absolute', top: 0, left: 0,
  width: 3, height: 72,
  background: 'linear-gradient(to bottom, #c8ff00, transparent)',
}
const numWmark = {
  position: 'absolute', top: 20, right: 24,
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 110, lineHeight: 1,
  color: 'rgba(240,237,230,.04)',
  pointerEvents: 'none', userSelect: 'none',
}
const infoLayer = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  padding: '0 32px 80px',
}
const badgeStyle = {
  display: 'inline-block',
  fontSize: 10, fontWeight: 700,
  letterSpacing: '.22em', textTransform: 'uppercase',
  border: '1px solid rgba(200,255,0,.5)',
  color: '#c8ff00', padding: '5px 14px',
  borderRadius: 100, marginBottom: 12,
  background: 'rgba(200,255,0,.05)',
}
const nameStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 40, color: '#f0ede6', lineHeight: 1,
  textShadow: '0 2px 24px rgba(0,0,0,.8)',
}
const bookLayer = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  background: '#c8ff00', color: '#000',
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 15, letterSpacing: '.22em',
  textAlign: 'center', padding: 20,
  cursor: 'pointer',
}
const stripStyle = {
  padding: '8px 56px',
  overflowX: 'auto', scrollSnapType: 'x mandatory',
  WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
  display: 'flex', gap: 20,
  cursor: 'grab', userSelect: 'none',
}
const bgGrid = {
  position: 'absolute', inset: 0,
  backgroundImage: 'linear-gradient(rgba(200,255,0,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,.02) 1px,transparent 1px)',
  backgroundSize: '80px 80px',
  pointerEvents: 'none',
}
const fadeRight = {
  position: 'absolute', top: 0, right: 0,
  width: 120, height: '100%',
  background: 'linear-gradient(to left, #0a0a0a, transparent)',
  pointerEvents: 'none', zIndex: 1,
}
