import { motion } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

export default function Ticker() {
  const { content } = useSiteContent()
  const base = content.home.ticker.items || []
  const ITEMS = base.length ? [...base, ...base] : []
  return (
    <div style={wrapStyle}>
      <motion.div
        style={trackStyle}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {ITEMS.map((item, i) => (
          <span key={i} style={item === '★' ? starStyle : itemStyle}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

const wrapStyle = {
  width: '100%',
  overflow: 'hidden',
  background: '#c8ff00',
  padding: '13px 0',
  position: 'relative',
  zIndex: 5,
}
const trackStyle = {
  display: 'flex',
  whiteSpace: 'nowrap',
  willChange: 'transform',
}
const itemStyle = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: '#000',
  padding: '0 28px',
  flexShrink: 0,
}
const starStyle = {
  ...itemStyle,
  color: 'rgba(0,0,0,0.4)',
  padding: '0 6px',
}
