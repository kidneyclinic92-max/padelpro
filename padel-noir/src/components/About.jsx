import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

function CountUp({ target, suffix = '' }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const dur = 1800, start = performance.now()
    const tick = (now) => {
      const p    = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

export default function About() {
  const { content } = useSiteContent()
  const ab = content.sections.about
  const STATS = ab.stats?.length ? ab.stats : [
    { target: 2, suffix: '', label: 'Premium Courts' },
    { target: 3000, suffix: '+', label: 'Elite Members' },
    { target: 24, suffix: '/7', label: 'Always Open' },
  ]
  const split = ab.splitHeadline?.length ? ab.splitHeadline : ['WHERE', 'ELITE', 'MEETS', 'OBSESSION']
  const highlightWord = ab.highlightWord || 'ELITE'

  const sectionRef = useRef(null)
  const textRef    = useRef(null)
  const textInView = useInView(textRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0,1], ['-6%', '6%'])

  return (
    <section id="about" ref={sectionRef} style={sectionStyle} className="grain">

      {/* Subtle parallax BG accent */}
      <motion.div style={{ ...bgAccent, y: bgY }} aria-hidden />

      <motion.div className="about-inner-grid" style={{ ...innerGrid, position: 'relative' }}>
        {/* ── LEFT: Stat cards ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: .9, ease: [.16,1,.3,1] }}
          className="about-stats-panel"
          style={statsPanel}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .6 }}
            className="section-label"
            style={{ marginBottom: 32 }}
          >
            {ab.byTheNumbers}
          </motion.div>

          <motion.div className="about-stats-grid" style={statsGrid}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 24, borderColor: 'rgba(240,237,230,.08)' },
                  shown:  { opacity: 1, y: 0,  borderColor: 'rgba(240,237,230,.08)' },
                  hover:  { borderColor: 'rgba(200,255,0,.45)', y: -4 },
                }}
                initial="hidden"
                whileInView="shown"
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ duration: .65, delay: i * .08, ease: [.16,1,.3,1] }}
                style={statCard}
              >
                <span style={statIndex}>{String(i + 1).padStart(2, '0')}</span>

                <motion.span
                  variants={{ shown: { width: 24, opacity: .6 }, hover: { width: 44, opacity: 1 } }}
                  transition={{ duration: .35, ease: [.4,0,.2,1] }}
                  style={statAccentLine}
                />

                <div style={numStyle}>
                  <CountUp target={s.target} suffix={s.suffix} />
                </div>
                <div style={labelStyle}>{s.label}</div>

                <motion.div
                  variants={{ shown: { opacity: 0 }, hover: { opacity: 1 } }}
                  transition={{ duration: .4 }}
                  style={statGlow}
                  aria-hidden
                />
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

        {/* ── RIGHT: Text ── */}
        <div ref={textRef} className="about-text-panel" style={textPanel}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .6 }}
            className="section-label"
          >
            {ab.ourStory}
          </motion.div>

          <div style={{ overflow: 'hidden' }}>
            {split.map((word, i) => (
              <div key={`${word}-${i}`} style={{ overflow: 'hidden' }}>
                <motion.span
                  initial={{ y: '105%' }}
                  animate={textInView ? { y: 0 } : {}}
                  transition={{ duration: .85, delay: .05 + i * .1, ease: [.16,1,.3,1] }}
                  style={{
                    ...headWord,
                    color: word === highlightWord ? '#c8ff00' : '#f0ede6',
                    display: 'block',
                  }}
                >
                  {word}
                </motion.span>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .7, delay: .5 }}
            style={paraStyle}
          >
            {ab.paragraph1}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={textInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .7, delay: .62 }}
            style={{ ...paraStyle, marginTop: 16 }}
          >
            {ab.paragraph2}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={textInView ? { opacity: 1 } : {}}
            transition={{ delay: .8 }}
            whileHover={{ letterSpacing: '.22em', color: '#c8ff00' }}
            style={{ display: 'inline-block' }}
          >
            <Link to="/courts" style={linkCta} data-hover>
              {ab.courtsCta}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

const sectionStyle = {
  position: 'relative', padding: '0',
  overflow: 'hidden',
  borderTop: '1px solid rgba(240,237,230,.05)',
  background: `
    radial-gradient(ellipse 85% 65% at 18% 40%, rgba(200,255,0,.08) 0%, transparent 50%),
    radial-gradient(ellipse 55% 50% at 95% 15%, rgba(200,255,0,.04) 0%, transparent 45%),
    linear-gradient(180deg, #0c0c0c 0%, #080808 45%, #050505 100%)
  `.replace(/\s+/g, ' ').trim(),
}
const bgAccent = {
  position: 'absolute', top: '15%', left: '-10%',
  width: '55%', height: '72%',
  background: 'radial-gradient(ellipse, rgba(200,255,0,.14) 0%, transparent 65%)',
  pointerEvents: 'none', zIndex: 0,
  filter: 'blur(64px)',
}
const innerGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  position: 'relative', zIndex: 2,
}
const statsPanel = {
  background: 'transparent',
  padding: 'clamp(80px,9vw,120px) clamp(40px,5vw,80px)',
  position: 'relative',
  display: 'flex', flexDirection: 'column', justifyContent: 'center',
}
const statsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
}
const statCard = {
  position: 'relative',
  background: 'linear-gradient(155deg, rgba(22,22,22,.92) 0%, rgba(12,12,12,.88) 100%)',
  border: '1px solid rgba(240,237,230,.08)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '32px 28px 28px',
  overflow: 'hidden',
  cursor: 'default',
  transition: 'border-color .35s, transform .35s',
  boxShadow: '0 16px 48px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)',
}
const statIndex = {
  position: 'absolute', top: 14, right: 16,
  fontSize: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
  letterSpacing: '.2em', color: 'rgba(240,237,230,.28)',
}
const statAccentLine = {
  display: 'block',
  height: 1, background: 'rgba(200,255,0,.35)',
  marginBottom: 18,
}
const numStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(46px,5.4vw,72px)',
  lineHeight: 1,
  color: '#c8ff00',
  letterSpacing: '-.01em',
}
const labelStyle = {
  fontSize: 11, fontWeight: 600,
  letterSpacing: '.18em', textTransform: 'uppercase',
  color: 'rgba(240,237,230,.45)', marginTop: 10,
}
const statGlow = {
  position: 'absolute', inset: -1, zIndex: -1,
  background: 'radial-gradient(circle at 80% 20%, rgba(200,255,0,.15) 0%, transparent 58%)',
  pointerEvents: 'none',
}
const textPanel = {
  background: 'transparent',
  padding: 'clamp(80px,9vw,120px) clamp(40px,5vw,80px)',
  display: 'flex', flexDirection: 'column', justifyContent: 'center',
}
const headWord = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(46px,5.5vw,80px)',
  lineHeight: .92,
  letterSpacing: '-.01em',
}
const paraStyle = {
  fontSize: 15, lineHeight: 1.85,
  color: 'rgba(240,237,230,.58)',
  maxWidth: 460, marginTop: 28,
}
const linkCta = {
  display: 'inline-block',
  marginTop: 32,
  fontSize: 12, fontWeight: 600,
  letterSpacing: '.18em', textTransform: 'uppercase',
  color: 'rgba(240,237,230,.48)',
  transition: 'color .2s, letter-spacing .3s',
  cursor: 'pointer',
}
