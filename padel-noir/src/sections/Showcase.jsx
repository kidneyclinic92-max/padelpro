import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'
import { useMediaQuery } from '../hooks/useMediaQuery'

function CourtStage({ style }) {
  return (
    <div className="showcase-court" style={style}>
      <div style={courtCenterLine} />
      <div style={courtNet} />
      <div style={courtBackWall} />
      <div style={courtSideLine} />
      <div style={courtFrontLine} />
      <div style={stageOverlay} />
    </div>
  )
}

export default function Showcase() {
  const { content } = useSiteContent()
  const sh = content.home.showcase
  const SPECS = sh.specs || []
  const ref = useRef(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
    enabled: !isMobile,
  })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: .4 })

  const eyebrowOpacity = useTransform(p, [0, .1], [0, 1])
  const titleY         = useTransform(p, [0, .35], ['0vh', '-3vh'])
  const titleScale     = useTransform(p, [0, .35], [1, .92])
  const titleOpacity   = useTransform(p, [.55, .8],  [1, 0])
  const imgScale       = useTransform(p, [0, .55], [.85, 1.08])
  const imgY           = useTransform(p, [0, 1], ['8%', '-8%'])
  const imgOpacity     = useTransform(p, [0, .15, .85, 1], [.4, 1, 1, .55])
  const specOpacity    = useTransform(p, [.15, .4], [0, 1])
  const specY          = useTransform(p, [.15, .4], ['16px', '0px'])
  const finalY         = useTransform(p, [.7, 1], ['40%', '0%'])
  const finalOpacity   = useTransform(p, [.7, 1], [0, 1])

  if (isMobile) {
    return (
      <section className="showcase-section showcase-section--mobile">
        <div className="showcase-mobile">
          <p className="showcase-mobile-eyebrow">
            <span style={eyebrowLine} />
            {sh.eyebrow}
          </p>
          <h2 className="showcase-mobile-title" aria-label={sh.titleAria}>
            <span>{sh.titleLine1}</span>
            <span className="showcase-mobile-title-accent">{sh.titleLine2}</span>
          </h2>
          <div className="showcase-mobile-stage">
            <CourtStage style={stageInnerMobile} />
          </div>
          <p className="showcase-mobile-footer">
            <span style={finalDot} />
            <span>{sh.finalText}</span>
            <span style={finalDot} />
          </p>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="showcase-section" style={sectionStyle}>
      <div className="showcase-sticky" style={sticky}>
        <div style={bgGrid} aria-hidden />
        <div style={bgGlow} aria-hidden />

        <motion.div className="showcase-eyebrow" style={{ ...eyebrow, opacity: eyebrowOpacity }}>
          <span style={eyebrowLine} />
          {sh.eyebrow}
        </motion.div>

        <motion.h2
          className="showcase-title"
          style={{ ...title, y: titleY, scale: titleScale, opacity: titleOpacity }}
          aria-label={sh.titleAria}
        >
          <span style={titleLine}>{sh.titleLine1}</span>
          <span style={{ ...titleLine, color: '#c8ff00' }}>{sh.titleLine2}</span>
        </motion.h2>

        <motion.div className="showcase-stage" style={{ ...stage, scale: imgScale, y: imgY, opacity: imgOpacity }}>
          <CourtStage style={stageInner} />
        </motion.div>

        {SPECS.map((s) => (
          <motion.div
            key={s.tag}
            className="showcase-spec"
            style={{
              ...specCard,
              left: s.x, top: s.y,
              opacity: specOpacity, y: specY,
            }}
          >
            <span style={specTag}>{s.tag}</span>
            <div style={specCore}>
              <span style={specValue}>{s.value}</span>
              <span style={specLabel}>{s.label}</span>
            </div>
            <span style={specConnector} />
          </motion.div>
        ))}

        <motion.div className="showcase-final-line" style={{ ...finalLine, y: finalY, opacity: finalOpacity }}>
          <span style={finalDot} />
          <span style={finalText}>{sh.finalText}</span>
          <span style={finalDot} />
        </motion.div>
      </div>
    </section>
  )
}

const sectionStyle = {
  position: 'relative',
  height: '280vh',
  background: '#070707',
}
const sticky = {
  position: 'sticky', top: 0,
  height: '100vh', width: '100%',
  overflow: 'hidden',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const bgGrid = {
  position: 'absolute', inset: 0, zIndex: 1,
  backgroundImage: `
    linear-gradient(rgba(240,237,230,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240,237,230,.025) 1px, transparent 1px)
  `,
  backgroundSize: '72px 72px',
  maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 75%)',
}
const bgGlow = {
  position: 'absolute', inset: 0, zIndex: 1,
  background: 'radial-gradient(ellipse at 50% 60%, rgba(200,255,0,.08) 0%, transparent 55%)',
}
const eyebrow = {
  position: 'absolute', top: 'clamp(96px,14vh,140px)', left: '50%',
  transform: 'translateX(-50%)', zIndex: 4,
  display: 'inline-flex', alignItems: 'center', gap: 14,
  fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase',
  color: 'rgba(200,255,0,.85)',
  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
  whiteSpace: 'nowrap',
}
const eyebrowLine = {
  display: 'inline-block', width: 40, height: 1, background: '#c8ff00', opacity: .6,
}
const title = {
  position: 'relative', zIndex: 3,
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(64px,12vw,180px)',
  lineHeight: .9, textAlign: 'center',
  color: '#f0ede6',
  letterSpacing: '-.01em',
  display: 'flex', flexDirection: 'column',
  pointerEvents: 'none',
}
const titleLine = { display: 'block' }
const stage = {
  position: 'absolute', inset: 0, zIndex: 2,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const stageInner = {
  position: 'relative',
  width: 'clamp(320px,52vw,720px)',
  height: 'clamp(220px,32vw,440px)',
  background: 'linear-gradient(165deg, #0a1d12 0%, #0d2818 45%, #062416 100%)',
  border: '1px solid rgba(200,255,0,.12)',
  borderRadius: 6,
  overflow: 'hidden',
  boxShadow: '0 50px 120px rgba(0,0,0,.55), inset 0 0 80px rgba(200,255,0,.06)',
}
const stageInnerMobile = {
  ...stageInner,
  width: '100%',
  maxWidth: 340,
  height: 220,
  margin: '0 auto',
}
const courtCenterLine = {
  position: 'absolute', top: 0, bottom: 0, left: '50%',
  width: 2, background: 'rgba(240,237,230,.4)',
  transform: 'translateX(-50%)',
}
const courtNet = {
  position: 'absolute', top: 0, bottom: 0, left: '50%',
  width: 1, background: 'rgba(240,237,230,.8)',
  transform: 'translateX(-.5px)',
  boxShadow: '0 0 16px rgba(240,237,230,.4)',
}
const courtBackWall = {
  position: 'absolute', top: '18%', bottom: '18%', left: '4%', right: '4%',
  border: '1.5px solid rgba(240,237,230,.35)',
  borderRadius: 4,
}
const courtSideLine = {
  position: 'absolute', top: '35%', bottom: '35%', left: '4%', right: '4%',
  borderTop: '1px solid rgba(240,237,230,.22)',
  borderBottom: '1px solid rgba(240,237,230,.22)',
}
const courtFrontLine = {
  position: 'absolute', top: 0, bottom: 0, left: '50%',
  width: '12%', transform: 'translateX(-50%)',
  borderLeft: '1px solid rgba(240,237,230,.22)',
  borderRight: '1px solid rgba(240,237,230,.22)',
}
const stageOverlay = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,.0) 30%, rgba(0,0,0,.4) 100%), radial-gradient(circle at 50% 30%, rgba(200,255,0,.18) 0%, transparent 60%)',
}
const specCard = {
  position: 'absolute', zIndex: 5,
  display: 'flex', flexDirection: 'column', gap: 8,
  padding: '14px 18px',
  background: 'linear-gradient(155deg, rgba(15,15,15,.85), rgba(8,8,8,.7))',
  border: '1px solid rgba(200,255,0,.22)',
  borderRadius: 3,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 20px 60px rgba(0,0,0,.4), 0 0 0 1px rgba(200,255,0,.05) inset',
  minWidth: 180,
}
const specTag = {
  fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase',
  color: 'rgba(200,255,0,.9)', fontWeight: 600,
}
const specCore = {
  display: 'flex', alignItems: 'baseline', gap: 10,
}
const specValue = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 32, color: '#f0ede6', lineHeight: 1,
  letterSpacing: '-.01em',
}
const specLabel = {
  fontSize: 11, color: 'rgba(240,237,230,.55)',
}
const specConnector = {
  position: 'absolute', bottom: -10, left: 22,
  width: 1, height: 22,
  background: 'linear-gradient(180deg, rgba(200,255,0,.5), transparent)',
}
const finalLine = {
  position: 'absolute', bottom: 'clamp(48px,7vh,80px)', left: '50%',
  transform: 'translateX(-50%)', zIndex: 4,
  display: 'flex', alignItems: 'center', gap: 16,
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 'clamp(18px,2vw,26px)',
  letterSpacing: '.18em',
  color: '#f0ede6',
  whiteSpace: 'nowrap',
}
const finalDot = {
  display: 'inline-block', width: 6, height: 6,
  background: '#c8ff00', borderRadius: '50%',
  boxShadow: '0 0 12px #c8ff00',
}
const finalText = {
  color: 'rgba(240,237,230,.85)',
}
