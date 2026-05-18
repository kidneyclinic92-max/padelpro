import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

export default function Nav({ onBook }) {
  const { content } = useSiteContent()
  const { brandStem, brandAccent, bookCta, links } = content.nav
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* On subpages: nav is always solid. On home: nav transitions on scroll. */
  const solid = !isHome || scrolled

  return (
    <>
      <motion.nav
        className="site-nav"
        initial={{ y: -88, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: .8, delay: .8, ease: [.16,1,.3,1] }}
        style={{
          ...navBase,
          background: solid ? 'rgba(10,10,10,0.92)' : 'transparent',
          backdropFilter: solid ? 'blur(22px)' : 'none',
          WebkitBackdropFilter: solid ? 'blur(22px)' : 'none',
          borderBottom: solid ? '1px solid rgba(240,237,230,.06)' : '1px solid transparent',
        }}
      >
        {/* Logo */}
        <motion.div whileHover={{ letterSpacing: '.18em' }} transition={{ duration: .3 }} style={logoWrap}>
          <Link to="/" style={logoStyle}>
            {brandStem}
            <span style={{ color: '#c8ff00' }}>{brandAccent}</span>
          </Link>
        </motion.div>

        {/* Desktop links */}
        <ul className="nav-desktop-links" style={linksWrap}>
          {links.map(l => <NavItem key={l.label} {...l} />)}
        </ul>

        {/* Desktop CTA */}
        <motion.button
          className="nav-desktop-cta"
          onClick={onBook}
          data-hover
          style={ctaStyle}
          whileHover={{
            background: '#c8ff00', color: '#000',
            boxShadow: '0 0 24px rgba(200,255,0,.45)',
            borderColor: '#c8ff00',
          }}
          whileTap={{ scale: .96 }}
          transition={{ duration: .2 }}
        >
          {bookCta}
        </motion.button>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" style={hamburgerStyle} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <motion.span style={hamLine} animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }} />
          <motion.span style={hamLine} animate={{ opacity: menuOpen ? 0 : 1 }} />
          <motion.span style={hamLine} animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }} />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mob-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: .3 }}
            className="mobile-menu"
            style={mobileMenu}
          >
            {links.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * .06 }}
              >
                <RouterNavLink
                  to={l.to}
                  className="mob-nav-link"
                  style={({ isActive }) => ({
                    ...mobLink,
                    color: isActive ? '#c8ff00' : '#f0ede6',
                  })}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </RouterNavLink>
              </motion.div>
            ))}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: .24 }}
              style={{ ...ctaStyle, width: '100%', marginTop: 12, justifyContent: 'center' }}
              onClick={() => { setMenuOpen(false); onBook() }}
            >
              {bookCta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavItem({ label, to }) {
  const [hovered, setHovered] = useState(false)
  return (
    <li>
      <RouterNavLink
        to={to}
        data-hover
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={({ isActive }) => ({
          ...linkStyle,
          color: isActive ? '#c8ff00' : 'rgba(240,237,230,.8)',
        })}
      >
        {({ isActive }) => (
          <>
            {label}
            <motion.span
              style={underline}
              animate={{ width: (hovered || isActive) ? '100%' : '0%' }}
              transition={{ duration: .3, ease: [.4,0,.2,1] }}
            />
          </>
        )}
      </RouterNavLink>
    </li>
  )
}

const navBase = {
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
  padding: '0 52px', height: 72,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  transition: 'background .4s, backdrop-filter .4s, border-bottom .4s',
}
const logoWrap = { display: 'inline-block' }
const logoStyle = {
  fontFamily: "'Bebas Neue',sans-serif", fontSize: 26,
  letterSpacing: '.14em', color: '#f0ede6',
  transition: 'letter-spacing .3s',
  display: 'inline-block',
}
const linksWrap = {
  display: 'flex', gap: 40, listStyle: 'none',
}
const linkStyle = {
  fontSize: 12, fontWeight: 500, letterSpacing: '.14em',
  textTransform: 'uppercase', position: 'relative',
  paddingBottom: 3,
  transition: 'color .2s',
  display: 'inline-block',
}
const underline = {
  position: 'absolute', bottom: 0, left: 0,
  height: 1, background: '#c8ff00',
  display: 'block', width: 0,
}
const ctaStyle = {
  fontSize: 12, fontWeight: 600, letterSpacing: '.16em',
  textTransform: 'uppercase',
  border: '1px solid rgba(200,255,0,.5)',
  color: '#c8ff00', background: 'transparent',
  padding: '10px 24px', borderRadius: 2,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  transition: 'background .2s, color .2s, box-shadow .2s',
}
const hamburgerStyle = {
  display: 'none',
  flexDirection: 'column', gap: 5, background: 'none', border: 'none',
  cursor: 'pointer', padding: 8,
}
const hamLine = {
  display: 'block', width: 24, height: 1.5, background: '#f0ede6',
  transformOrigin: 'center',
}
const mobileMenu = {
  position: 'fixed', top: 72, left: 0, right: 0, zIndex: 999,
  background: 'rgba(10,10,10,.97)',
  backdropFilter: 'blur(20px)',
  padding: '32px 24px 40px',
  borderBottom: '1px solid rgba(240,237,230,.08)',
}
const mobLink = {
  display: 'block', fontSize: 32, fontFamily: "'Bebas Neue',sans-serif",
  letterSpacing: '.1em', padding: '10px 0',
  borderBottom: '1px solid rgba(240,237,230,.06)',
}
