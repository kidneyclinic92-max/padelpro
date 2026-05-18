import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

const COACHES_FALLBACK = [
  {
    initials: 'MV', name: 'MARCO VIDAL', tag: 'Head Coach',
    nationality: '🇪🇸 Spain',
    bio: 'Former WPT top-30 player with 14 years of elite competition. Marco breaks down technique and tactical positioning with surgical precision — turning raw ability into elite performance.',
  },
  {
    initials: 'SA', name: 'SOFIA ALLENDE', tag: 'Performance Coach',
    nationality: '🇦🇷 Argentina',
    bio: 'Certified sports scientist and national champion. Sofia specialises in physical conditioning and data-driven athleticism — turning good players into exceptional ones.',
  },
  {
    initials: 'KT', name: 'KARIM TAHIR', tag: 'Junior Academy',
    nationality: '🇫🇷 France',
    bio: 'Youth development specialist with a track record of producing national-level juniors. Karim blends competitive intensity with technical mastery to build the complete player.',
  },
]

function CoachCard({ coach, delay }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - rect.top)  / rect.height - 0.5) * 8,
      y: -((e.clientX - rect.left) / rect.width  - 0.5) * 8,
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: .8, delay, ease: [.16,1,.3,1] }}
      style={{
        ...cardBase,
        rotateX: hovered ? tilt.x : 0,
        rotateY: hovered ? tilt.y : 0,
        transformPerspective: 900,
        border: `1px solid ${hovered ? 'rgba(200,255,0,.25)' : 'rgba(240,237,230,.07)'}`,
        background: hovered ? 'rgba(200,255,0,.03)' : 'rgba(255,255,255,.02)',
        boxShadow: hovered ? '0 24px 48px rgba(0,0,0,.5)' : '0 4px 20px rgba(0,0,0,.3)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x:0, y:0 }) }}
      onMouseMove={onMove}
      data-hover
    >
      {/* Glare effect */}
      <motion.div
        style={glare}
        animate={{
          opacity: hovered ? .06 : 0,
          x: hovered ? `${tilt.y * 8}%` : '0%',
          y: hovered ? `${tilt.x * 8}%` : '0%',
        }}
        transition={{ duration: .1 }}
      />

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <motion.div
          style={{
            ...avatarStyle,
            filter: hovered ? 'grayscale(0%) brightness(1.05)' : 'grayscale(100%) brightness(.75)',
          }}
          transition={{ duration: .5 }}
          animate={{
            boxShadow: hovered ? '0 0 0 3px #c8ff00' : '0 0 0 0px transparent',
          }}
        >
          {coach.initials}
        </motion.div>
        <div>
          <div style={nameStyle}>{coach.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(240,237,230,.4)', marginTop: 2 }}>{coach.nationality}</div>
        </div>
      </div>

      <span style={tagStyle}>{coach.tag}</span>
      <p style={bioStyle}>{coach.bio}</p>
    </motion.div>
  )
}

export default function Coaches() {
  const { content } = useSiteContent()
  const ch = content.sections.coaches
  const COACHES = ch.list?.length ? ch.list : COACHES_FALLBACK
  const headerRef = useRef(null)
  const inView    = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section id="coaches" style={sectionStyle} className="grain site-section">
      <div className="section-inner">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .7, ease: [.4,0,.2,1] }}
        >
          <div className="section-label">{ch.sectionLabel}</div>
          <h2 style={{ fontSize: 'clamp(52px,7vw,100px)', lineHeight: .92, marginBottom: 64 }}>
            {ch.titleLine1}<br />{ch.titleLine2}
          </h2>
        </motion.div>

        <motion.div className="coaches-grid-inner" style={gridStyle}>
          {COACHES.map((c, i) => <CoachCard key={c.name} coach={c} delay={i * .13} />)}
        </motion.div>
      </div>
    </section>
  )
}

const sectionStyle = {
  padding: '130px 0',
  background: '#0d0d0d', position: 'relative',
}
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3,1fr)',
  gap: 24,
}
const cardBase = {
  borderRadius: 6, padding: '40px 36px',
  position: 'relative', overflow: 'hidden',
  cursor: 'default', willChange: 'transform',
  transition: 'border-color .3s, background .3s, box-shadow .4s',
}
const glare = {
  position: 'absolute', inset: '-50%',
  background: 'radial-gradient(circle at 50% 50%, white, transparent 60%)',
  pointerEvents: 'none', zIndex: 0,
}
const avatarStyle = {
  width: 80, height: 80, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Bebas Neue',sans-serif", fontSize: 28,
  color: '#c8ff00', background: '#0f1a0a',
  flexShrink: 0,
  transition: 'filter .5s, box-shadow .3s',
}
const nameStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 26, color: '#f0ede6', lineHeight: 1,
}
const tagStyle = {
  display: 'inline-block', fontSize: 10, fontWeight: 700,
  letterSpacing: '.22em', textTransform: 'uppercase',
  color: '#c8ff00', background: 'rgba(200,255,0,.1)',
  padding: '5px 14px', borderRadius: 100, marginBottom: 16,
}
const bioStyle = {
  fontSize: 14, lineHeight: 1.8,
  color: 'rgba(240,237,230,.58)',
  position: 'relative', zIndex: 1,
}
