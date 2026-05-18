import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MagneticButton from '../components/MagneticButton'

const MARQUEE_WORDS = ['JOIN', 'THE', 'RIDE', '★']

export default function JoinTheRide({ onBook }) {
  const ref = useRef(null)
  const navigate = useNavigate()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: .4 })

  /* Marquee row counter-translates so it feels alive */
  const marqueeX1 = useTransform(p, [0, 1], ['0%', '-25%'])
  const marqueeX2 = useTransform(p, [0, 1], ['-15%', '8%'])

  /* Background glow scale */
  const glowScale = useTransform(p, [0, 1], [0.8, 1.4])

  return (
    <section ref={ref} style={section}>
      {/* Pulsing radial glow */}
      <motion.div style={{ ...glow, scale: glowScale }} aria-hidden />

      {/* Top label */}
      <div className="join-top-row" style={topRow}>
        <span style={smallLabel}>
          <span style={dash} />
          THE NEXT MOVE
        </span>
        <span style={smallLabel} aria-hidden>
          PARIS · EST. 2019
          <span style={dash} />
        </span>
      </div>

      {/* Marquee 1 — forward drift */}
      <motion.div style={{ ...marquee, x: marqueeX1 }}>
        {Array.from({ length: 4 }).map((_, r) => (
          <span key={r} style={marqueeRow}>
            {MARQUEE_WORDS.map((w, i) => (
              <span key={`${r}-${i}`} className={w === '★' ? undefined : 'join-marquee-word'} style={w === '★' ? marqueeStar : marqueeWord}>{w}</span>
            ))}
          </span>
        ))}
      </motion.div>

      {/* Center CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .9, delay: .2, ease: [.16,1,.3,1] }}
        style={ctaPanel}
      >
        <p style={ctaCopy}>
          A members-only club for the obsessed. Twelve courts.
          Three thousand players. One way of life.
        </p>
        <div style={ctaRow}>
          <MagneticButton onClick={onBook} style={ctaPrimary}>
            Book a Trial Session
          </MagneticButton>
          <MagneticButton onClick={() => navigate('/membership')} style={ctaSecondary}>
            View Memberships
          </MagneticButton>
        </div>
      </motion.div>

      {/* Marquee 2 — reverse drift */}
      <motion.div style={{ ...marquee, x: marqueeX2, color: 'rgba(200,255,0,.85)' }}>
        {Array.from({ length: 4 }).map((_, r) => (
          <span key={r} style={marqueeRow}>
            {MARQUEE_WORDS.map((w, i) => (
              <span key={`${r}-${i}`} className={w === '★' ? undefined : 'join-marquee-word'} style={w === '★' ? marqueeStar : marqueeWord}>{w}</span>
            ))}
          </span>
        ))}
      </motion.div>

      {/* Bottom metric row */}
      <div className="join-bottom-row" style={bottomRow}>
        <div style={bottomItem}>
          <span style={bottomVal}>06:00–24:00</span>
          <span style={bottomLab}>Hours · Mon–Sun</span>
        </div>
        <div style={bottomItem}>
          <span style={bottomVal}>12 Rue du Sport</span>
          <span style={bottomLab}>Paris, 75008</span>
        </div>
        <div style={bottomItem}>
          <span style={bottomVal}>+33 1 23 45 67 89</span>
          <span style={bottomLab}>Concierge</span>
        </div>
      </div>
    </section>
  )
}

const section = {
  position: 'relative',
  padding: 'clamp(120px,16vh,200px) 0 clamp(80px,10vh,140px)',
  background: '#040404',
  overflow: 'hidden',
  borderTop: '1px solid rgba(240,237,230,.04)',
}
const glow = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80vw', height: '80vw',
  maxWidth: 1200, maxHeight: 1200,
  background: 'radial-gradient(circle, rgba(200,255,0,.12) 0%, transparent 60%)',
  pointerEvents: 'none',
  filter: 'blur(40px)',
  zIndex: 0,
}
const topRow = {
  position: 'relative', zIndex: 1,
  maxWidth: 1320, margin: '0 auto',
  padding: '0 clamp(28px,6vw,96px)',
  display: 'flex', justifyContent: 'space-between',
  marginBottom: 48,
}
const smallLabel = {
  display: 'inline-flex', alignItems: 'center', gap: 12,
  fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase',
  color: 'rgba(240,237,230,.5)',
  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
}
const dash = {
  display: 'inline-block', width: 36, height: 1,
  background: '#c8ff00', opacity: .6,
}
const marquee = {
  position: 'relative', zIndex: 1,
  display: 'flex',
  whiteSpace: 'nowrap',
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(72px,12vw,200px)',
  lineHeight: 1.05,
  letterSpacing: '-.015em',
  color: 'rgba(240,237,230,.92)',
  willChange: 'transform',
}
const marqueeRow = {
  display: 'inline-flex', gap: 'clamp(40px,5vw,80px)',
  marginRight: 'clamp(40px,5vw,80px)',
}
const marqueeWord = { display: 'inline-block' }
const marqueeStar = {
  display: 'inline-block',
  color: '#c8ff00',
  transform: 'translateY(-.05em)',
}

const ctaPanel = {
  position: 'relative', zIndex: 2,
  maxWidth: 720, margin: 'clamp(40px,6vh,80px) auto',
  padding: '0 clamp(28px,6vw,96px)',
  textAlign: 'center',
}
const ctaCopy = {
  fontSize: 'clamp(15px,1.4vw,18px)',
  lineHeight: 1.7,
  color: 'rgba(240,237,230,.65)',
  marginBottom: 32,
}
const ctaRow = {
  display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
}
const ctaPrimary = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 16, letterSpacing: '.2em',
  color: '#000', background: '#c8ff00',
  border: '2px solid #c8ff00',
  padding: '15px 44px', borderRadius: 2,
  transition: 'box-shadow .3s',
}
const ctaSecondary = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 16, letterSpacing: '.2em',
  color: '#f0ede6', background: 'transparent',
  border: '1.5px solid rgba(240,237,230,.32)',
  padding: '15px 34px', borderRadius: 2,
  transition: 'border-color .3s, color .3s',
}
const bottomRow = {
  position: 'relative', zIndex: 1,
  maxWidth: 1320, margin: 'clamp(80px,10vh,120px) auto 0',
  padding: '0 clamp(28px,6vw,96px)',
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 24,
  borderTop: '1px solid rgba(240,237,230,.08)',
  paddingTop: 'clamp(40px,5vh,56px)',
}
const bottomItem = {
  display: 'flex', flexDirection: 'column', gap: 6,
}
const bottomVal = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(20px,2vw,28px)',
  color: '#f0ede6', lineHeight: 1.1,
  letterSpacing: '.04em',
}
const bottomLab = {
  fontSize: 10, letterSpacing: '.24em',
  textTransform: 'uppercase', color: 'rgba(240,237,230,.4)',
  fontWeight: 600,
}
