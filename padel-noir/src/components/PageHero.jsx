import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

export default function PageHero({ eyebrow, title, subtitle, accentWord }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const words = title.split(' ')

  return (
    <section ref={ref} style={hero}>
      {/* Layered atmospheric backdrop */}
      <div style={bgRadial} aria-hidden />
      <div style={bgGrid} aria-hidden />
      <div style={bgVignette} aria-hidden />

      {/* Floating lime accent square */}
      <motion.div
        aria-hidden
        style={accentBlock}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
      />

      <motion.div style={{ ...inner, y, opacity }}>
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .15 }}
          style={crumb}
        >
          <Link to="/" style={crumbLink} data-hover>Home</Link>
          <span style={crumbSep}>/</span>
          <span style={crumbCurrent}>{eyebrow}</span>
        </motion.div>

        {/* Title */}
        <h1 style={titleStyle} aria-label={title}>
          {words.map((w, i) => (
            <span key={`${w}-${i}`} style={wordOuter}>
              <motion.span
                initial={{ y: '110%', skewY: 6 }}
                animate={{ y: 0, skewY: 0 }}
                transition={{ duration: .95, delay: .35 + i * .12, ease: [.16,1,.3,1] }}
                style={{
                  display: 'inline-block',
                  color: w === accentWord ? '#c8ff00' : '#f0ede6',
                }}
              >
                {w}{i < words.length - 1 ? '\u00A0' : ''}
              </motion.span>
            </span>
          ))}
        </h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: .35 + words.length * .12 }}
            style={subtitleStyle}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Animated horizontal line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: .55 + words.length * .12, ease: [.16,1,.3,1] }}
          style={divider}
        />
      </motion.div>
    </section>
  )
}

const hero = {
  position: 'relative',
  width: '100%',
  paddingTop: 'clamp(160px,18vh,220px)',
  paddingBottom: 'clamp(80px,10vh,120px)',
  overflow: 'hidden',
  background: '#070707',
  borderBottom: '1px solid rgba(240,237,230,.06)',
}
const bgRadial = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse at 75% 20%, rgba(200,255,0,.10) 0%, transparent 55%)',
  pointerEvents: 'none',
}
const bgGrid = {
  position: 'absolute', inset: 0,
  backgroundImage: `
    linear-gradient(rgba(240,237,230,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240,237,230,.025) 1px, transparent 1px)
  `,
  backgroundSize: '64px 64px',
  maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 75%)',
  pointerEvents: 'none',
}
const bgVignette = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(to bottom, transparent 0%, rgba(7,7,7,.85) 100%)',
  pointerEvents: 'none',
}
const accentBlock = {
  position: 'absolute',
  top: '24%', right: '8%',
  width: 'clamp(140px,18vw,260px)', height: 'clamp(140px,18vw,260px)',
  border: '1px solid rgba(200,255,0,.18)',
  pointerEvents: 'none',
}
const inner = {
  position: 'relative', zIndex: 2,
  maxWidth: 1320, margin: '0 auto',
  padding: '0 clamp(28px,6vw,96px)',
}
const crumb = {
  display: 'flex', alignItems: 'center', gap: 10,
  fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase',
  color: 'rgba(240,237,230,.5)',
  marginBottom: 28, fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
}
const crumbLink = {
  color: 'rgba(240,237,230,.6)',
  transition: 'color .25s',
}
const crumbSep = {
  color: 'rgba(240,237,230,.3)',
}
const crumbCurrent = {
  color: '#c8ff00',
}
const titleStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(56px,10vw,148px)',
  lineHeight: .92,
  letterSpacing: '-.01em',
  marginBottom: 28,
}
const wordOuter = { display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }
const subtitleStyle = {
  fontSize: 'clamp(15px,1.4vw,18px)',
  lineHeight: 1.7,
  color: 'rgba(240,237,230,.6)',
  maxWidth: 620,
  marginBottom: 36,
}
const divider = {
  height: 1, background: 'rgba(200,255,0,.4)',
  width: 'min(420px, 60%)', transformOrigin: 'left',
}
