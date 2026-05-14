import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

const SOCIALS = [
  { label: 'IG',  icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
  { label: 'X',   icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.945l4.273 5.649 4.776-5.649Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg> },
  { label: 'YT',  icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none"/></svg> },
  { label: 'TK',  icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
]

export default function Footer() {
  const { content } = useSiteContent()
  const nav = content.nav
  const f = content.sections.footer
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <footer style={footerStyle}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px' }}>
        {/* Top row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .7 }}
          style={topRow}
        >
          <div>
            <div style={logoStyle}>
              {nav.brandStem}<span style={{ color:'#c8ff00' }}>{nav.brandAccent}</span>
            </div>
            <div style={tagline}>{f.tagline}</div>
          </div>

          <div style={colWrap}>
            <FooterCol title={f.clubColumnTitle} links={f.clubLinks.map((l) => [l.label, l.to])} internal />
            <FooterCol title={f.contactColumnTitle} links={f.contactLines.map((l) => [l.label, l.href])} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(240,237,230,.35)' }}>{f.followLabel}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map(s => (
                <motion.a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  style={socialBtn}
                  whileHover={{ borderColor:'#c8ff00', color:'#c8ff00', background:'rgba(200,255,0,.1)', scale: 1.1 }}
                  data-hover
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [.4,0,.2,1] }}
          style={{ height: 1, background: 'rgba(240,237,230,.07)', transformOrigin: 'left', marginBottom: 28 }}
        />

        {/* Bottom */}
        <div style={bottomRow}>
          <span style={copy}>{f.copyright}</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            {(f.legal || []).map((l) => (
              <motion.a key={l} href="#" style={legalLink} whileHover={{ color:'#c8ff00' }} data-hover>{l}</motion.a>
            ))}
            <Link to="/admin" style={{ ...legalLink, textDecoration: 'none', marginLeft: 8 }}>Site admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links, internal }) {
  return (
    <div>
      <h5 style={colTitle}>{title}</h5>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(([label, href]) => (
          <li key={label}>
            {internal ? (
              <motion.span whileHover={{ color:'#f0ede6', x: 3 }} style={{ display: 'inline-block' }}>
                <Link to={href} style={colLink} data-hover>{label}</Link>
              </motion.span>
            ) : (
              <motion.a href={href} style={colLink} whileHover={{ color:'#f0ede6', x: 3 }} data-hover>
                {label}
              </motion.a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const footerStyle = {
  padding: '80px 0 40px',
  borderTop: '1px solid rgba(240,237,230,.07)',
  background: '#080808',
}
const topRow = {
  display: 'flex', alignItems: 'flex-start',
  justifyContent: 'space-between', marginBottom: 56,
  gap: 40, flexWrap: 'wrap',
}
const logoStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 38, letterSpacing: '.12em', color: '#f0ede6',
}
const tagline = {
  fontSize: 13, color: 'rgba(240,237,230,.35)', marginTop: 4,
}
const colWrap = {
  display: 'flex', gap: 56,
}
const colTitle = {
  fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
  color: 'rgba(240,237,230,.35)', marginBottom: 18, fontWeight: 600,
}
const colLink = {
  fontSize: 14, color: 'rgba(240,237,230,.55)',
  transition: 'color .2s',
  display: 'inline-block',
}
const socialBtn = {
  width: 38, height: 38, borderRadius: '50%',
  border: '1px solid rgba(240,237,230,.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'rgba(240,237,230,.5)',
  transition: 'border-color .2s, color .2s, background .2s',
  cursor: 'pointer',
}
const bottomRow = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
}
const copy   = { fontSize: 12, color: 'rgba(240,237,230,.28)' }
const legalLink = { fontSize: 12, color: 'rgba(240,237,230,.28)', transition: 'color .2s', display: 'inline-block' }
