import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollMeter() {
  const { pathname } = useLocation()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 22, mass: .3 })

  const [pct, setPct] = useState(0)
  useEffect(() => {
    return smooth.on('change', (v) => setPct(Math.round(v * 100)))
  }, [smooth])

  const barScaleX = useTransform(smooth, [0, 1], [0, 1])

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      {/* Top progress bar */}
      <motion.div style={{ ...barWrap }}>
        <motion.div style={{ ...bar, scaleX: barScaleX }} />
      </motion.div>

      {/* Floating percentage indicator (bottom-right) */}
      <div className="scroll-meter-pct" style={pctWrap} aria-hidden>
        <span style={pctNum}>{String(pct).padStart(2, '0')}</span>
        <span style={pctSign}>%</span>
      </div>
    </>
  )
}

const barWrap = {
  position: 'fixed', top: 0, left: 0, right: 0,
  height: 2, background: 'transparent',
  zIndex: 1100, pointerEvents: 'none',
}
const bar = {
  width: '100%', height: '100%',
  background: 'linear-gradient(90deg, #c8ff00 0%, #e8ff60 100%)',
  transformOrigin: 'left',
  boxShadow: '0 0 12px rgba(200,255,0,.6)',
}
const pctWrap = {
  position: 'fixed', right: 20, bottom: 20,
  zIndex: 1100, pointerEvents: 'none',
  display: 'flex', alignItems: 'baseline', gap: 2,
  fontFamily: "'Bebas Neue',sans-serif",
  mixBlendMode: 'difference',
}
const pctNum = {
  fontSize: 28, letterSpacing: '.04em',
  color: '#f0ede6', lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
}
const pctSign = {
  fontSize: 12, color: '#c8ff00', fontWeight: 700,
}
