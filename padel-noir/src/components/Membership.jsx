import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import MagneticButton from './MagneticButton'
import { useSiteContent } from '../context/SiteContentContext'

const TIERS_FALLBACK = [
  {
    name: 'Challenger', price: '49', period: '/mo · billed monthly',
    features: ['4 court bookings / month','Full access to both courts','Locker room & showers','Member app & community'],
    featured: false,
  },
  {
    name: 'Elite', price: '99', period: '/mo · billed annually',
    features: ['Unlimited court bookings','2 guest passes / month','Priority peak-hour access','Tournament entries included'],
    featured: true, badge: 'Most Popular',
  },
  {
    name: 'Noir Black', price: '199', period: '/mo · billed annually',
    features: ['Everything in Elite','Private court blocks included','Concierge court reservation','VIP lounge & bar access'],
    featured: false,
  },
]

function TierCard({ tier, delay, onBook, ctaLabel }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: tier.featured ? -16 : 0 } : {}}
      transition={{ duration: .85, delay, ease: [.16,1,.3,1] }}
      whileHover={{ y: tier.featured ? -26 : -10 }}
      className={tier.featured ? 'membership-card-featured' : undefined}
      style={{
        ...cardBase,
        border: tier.featured ? '1px solid #c8ff00' : '1px solid rgba(240,237,230,.07)',
        background: tier.featured ? 'rgba(200,255,0,.04)' : 'rgba(255,255,255,.02)',
      }}
    >
      {/* Glow for featured */}
      {tier.featured && (
        <div style={featuredGlow} aria-hidden />
      )}

      {tier.badge && (
        <div style={badgeStyle}>{tier.badge}</div>
      )}

      <div style={tierName}>{tier.name}</div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, margin: '16px 0 4px' }}>
        <span style={supStyle}>€</span>
        <span style={priceStyle}>{tier.price}</span>
      </div>
      <div style={periodStyle}>{tier.period}</div>

      <div style={divider} />

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tier.features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: delay + .2 + i * .07, duration: .5 }}
            style={featureLi}
          >
            <span style={checkBox}>
              <svg width={10} height={10} viewBox="0 0 12 12" fill="none" stroke="#c8ff00" strokeWidth={2.5}>
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </span>
            {f}
          </motion.li>
        ))}
      </ul>

      <MagneticButton
        onClick={onBook}
        style={{
          ...btnStyle,
          ...(tier.featured ? btnFeat : {}),
          width: '100%', display: 'block', marginTop: 36,
        }}
      >
        {ctaLabel}
      </MagneticButton>
    </motion.div>
  )
}

export default function Membership({ onBook }) {
  const { content } = useSiteContent()
  const mem = content.sections.membership
  const TIERS = mem.tiers?.length ? mem.tiers : TIERS_FALLBACK
  const headerRef = useRef(null)
  const inView    = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section id="membership" className="site-section" style={{ padding: '130px 0', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative grid */}
      <div style={bgGrid} aria-hidden />

      <div className="section-inner">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .7 }}
        >
          <div className="section-label">{mem.sectionLabel}</div>
          <h2 style={{ fontSize: 'clamp(52px,7vw,100px)', lineHeight: .92, marginBottom: 16 }}>
            {mem.titleLine1}<br />{mem.titleLine2}
          </h2>
          <p style={{ color: 'rgba(240,237,230,.5)', fontSize: 15, marginBottom: 72, maxWidth: 480 }}>
            {mem.intro}
          </p>
        </motion.div>

        <div className="membership-grid-inner" style={gridStyle}>
          {TIERS.map((t, i) => (
            <TierCard key={t.name} tier={t} delay={i * .12} onBook={onBook} ctaLabel={mem.tierCta} />
          ))}
        </div>
      </div>
    </section>
  )
}

const cardBase = {
  borderRadius: 8, padding: '48px 38px',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  position: 'relative', overflow: 'hidden',
  transition: 'border-color .3s',
}
const featuredGlow = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse at 50% 0%, rgba(200,255,0,.08) 0%, transparent 70%)',
  pointerEvents: 'none',
}
const badgeStyle = {
  position: 'absolute', top: 0, right: 32,
  background: '#c8ff00', color: '#000',
  fontSize: 10, fontWeight: 800,
  letterSpacing: '.16em', textTransform: 'uppercase',
  padding: '6px 16px', borderRadius: '0 0 6px 6px',
}
const tierName = {
  fontSize: 12, fontWeight: 700,
  letterSpacing: '.2em', textTransform: 'uppercase',
  color: '#c8ff00',
}
const supStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 28, color: '#f0ede6',
  marginTop: 10, display: 'inline-block',
}
const priceStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 80, lineHeight: 1, color: '#f0ede6',
}
const periodStyle = {
  fontSize: 12, color: 'rgba(240,237,230,.4)', marginBottom: 32,
}
const divider = {
  height: 1, background: 'rgba(240,237,230,.07)', marginBottom: 28,
}
const featureLi = {
  display: 'flex', alignItems: 'flex-start', gap: 12,
  fontSize: 14, color: 'rgba(240,237,230,.78)',
}
const checkBox = {
  flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
  background: 'rgba(200,255,0,.1)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  marginTop: 1,
}
const btnStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 15, letterSpacing: '.2em',
  padding: '16px 24px', borderRadius: 2,
  border: '1px solid #c8ff00',
  color: '#c8ff00', background: 'transparent',
  cursor: 'pointer', textAlign: 'center',
  transition: 'background .25s, color .25s, box-shadow .25s',
}
const btnFeat = {
  background: '#c8ff00', color: '#000',
  boxShadow: '0 0 28px rgba(200,255,0,.3)',
}
const bgGrid = {
  position: 'absolute', inset: 0,
  backgroundImage: 'linear-gradient(rgba(200,255,0,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,.018) 1px,transparent 1px)',
  backgroundSize: '80px 80px', pointerEvents: 'none',
}
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3,1fr)',
  gap: 22, alignItems: 'start',
}
