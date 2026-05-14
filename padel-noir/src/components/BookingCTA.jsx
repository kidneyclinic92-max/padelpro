import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import MagneticButton from './MagneticButton'
import { useSiteContent } from '../context/SiteContentContext'

export default function BookingCTA({ onBook }) {
  const { content } = useSiteContent()
  const bk = content.sections.bookingCta
  const WORDS = bk.words?.length ? bk.words : ['READY', 'TO', 'PLAY?']
  const accentWord = bk.accentWord || 'PLAY?'
  const sectionRef = useRef(null)
  const textRef    = useRef(null)
  const inView     = useInView(textRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1])

  return (
    <section id="book" ref={sectionRef} style={sectionStyle}>
      {/* Animated noise + gradient bg */}
      <motion.div style={{ ...noiseBg, scale: bgScale }} aria-hidden />
      <div style={limeSplash} aria-hidden />

      <div className="section-inner" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h2 ref={textRef} style={{ fontSize: 'clamp(56px,10vw,152px)', lineHeight: .88, marginBottom: 28 }}>
          {WORDS.map((word, i) => (
            <span key={`${word}-${i}`} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '.2em' }}>
              <motion.span
                initial={{ y: '110%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: .9, delay: i * .15, ease: [.16,1,.3,1] }}
                style={{
                  display: 'block',
                  color: word === accentWord ? '#c8ff00' : '#f0ede6',
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: .5, duration: .7 }}
          style={{ fontSize: 17, color: 'rgba(240,237,230,.55)', marginBottom: 52 }}
        >
          {bk.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: .9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: .65, duration: .6, ease: [.16,1,.3,1] }}
        >
          <MagneticButton
            onClick={onBook}
            strength={0.3}
            style={btnStyle}
          >
            {bk.button}
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}

const sectionStyle = {
  padding: '180px 0',
  position: 'relative', overflow: 'hidden',
  background: '#080808',
}
const noiseBg = {
  position: 'absolute', inset: 0,
  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E") center / 200px, linear-gradient(135deg, #0c0c0c, #111)`,
  opacity: .92,
}
const limeSplash = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)',
  width: '60%', height: '60%',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(200,255,0,.06) 0%, transparent 70%)',
  filter: 'blur(60px)',
  pointerEvents: 'none',
}
const btnStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 20, letterSpacing: '.22em',
  color: '#000', background: '#c8ff00',
  padding: '22px 80px', borderRadius: 2,
  border: 'none', cursor: 'pointer',
  boxShadow: '0 0 60px rgba(200,255,0,.2)',
  transition: 'box-shadow .3s',
}
