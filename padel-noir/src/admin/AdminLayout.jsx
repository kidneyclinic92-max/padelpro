import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'

const AUTH_KEY = 'padel-pro-admin-auth'

const CONTENT_HASH_LINKS = [
  ['#nav', 'Navigation'],
  ['#home-hero', 'Home · Hero'],
  ['#home-ticker', 'Home · Ticker'],
  ['#home-showcase', 'Home · Showcase'],
  ['#home-pillars', 'Home · Pillars'],
  ['#home-reel', 'Home · Reel'],
  ['#page-heroes', 'Page heroes'],
  ['#section-about', 'About section'],
  ['#section-courts', 'Courts section'],
  ['#section-coaches', 'Coaches section'],
  ['#section-membership', 'Membership'],
  ['#section-booking', 'Booking CTA'],
  ['#footer', 'Footer'],
  ['#modal', 'Booking modal'],
  ['#import', 'Import / export'],
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const envPwd = import.meta.env.VITE_ADMIN_PASSWORD
  const [authed, setAuthed] = useState(() => {
    if (!envPwd) return true
    return sessionStorage.getItem(AUTH_KEY) === '1'
  })
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const login = (e) => {
    e.preventDefault()
    if (pw === envPwd) {
      sessionStorage.setItem(AUTH_KEY, '1')
      setAuthed(true)
      setErr('')
    } else {
      setErr('Incorrect password')
    }
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
    setPw('')
  }

  if (!authed) {
    return (
      <div style={shell}>
        <div style={card}>
          <h1 style={h1}>Padel Pro — Admin</h1>
          {!envPwd ? (
            <p style={hint}>
              Set <code style={code}>VITE_ADMIN_PASSWORD</code> in <code style={code}>padel-noir/.env</code> to protect this panel.
              Until then, access is open.
            </p>
          ) : null}
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={lab}>Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={inp}
              autoComplete="current-password"
            />
            {err ? <span style={{ color: '#ff6b6b', fontSize: 13 }}>{err}</span> : null}
            <button type="submit" style={btn}>Enter</button>
          </form>
          <button type="button" onClick={() => navigate('/')} style={{ ...btn, marginTop: 12, background: 'transparent', border: '1px solid rgba(240,237,230,.2)', color: '#f0ede6' }}>
            ← Back to site
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={shell}>
      <aside style={aside}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '.08em', marginBottom: 8 }}>
          PADEL <span style={{ color: '#c8ff00' }}>PRO</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '.2em', color: 'rgba(240,237,230,.4)', marginBottom: 28 }}>SITE ADMIN</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link to="/admin" style={{ ...sideLink, color: pathname === '/admin' ? '#c8ff00' : undefined }}>Site content</Link>
          <Link to="/admin/bookings" style={{ ...sideLink, color: pathname.startsWith('/admin/bookings') ? '#c8ff00' : undefined }}>Bookings</Link>
          {pathname === '/admin' ? (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(240,237,230,.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CONTENT_HASH_LINKS.map(([href, label]) => (
                <Link key={href} to={`/admin${href}`} style={sideSmall}>{label}</Link>
              ))}
            </div>
          ) : null}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link to="/" style={{ ...sideLink, color: '#c8ff00' }}>View website →</Link>
          {envPwd ? (
            <button type="button" onClick={logout} style={{ ...btn, background: 'transparent', border: '1px solid rgba(240,237,230,.15)', color: 'rgba(240,237,230,.7)' }}>
              Log out
            </button>
          ) : null}
        </div>
      </aside>
      <main style={main}>
        <Outlet />
      </main>
    </div>
  )
}

const shell = {
  minHeight: '100vh',
  background: '#050505',
  color: '#f0ede6',
  display: 'flex',
  fontFamily: "'DM Sans',sans-serif",
}
const aside = {
  width: 240,
  flexShrink: 0,
  borderRight: '1px solid rgba(240,237,230,.08)',
  padding: '28px 20px',
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  alignSelf: 'flex-start',
  height: '100vh',
  overflow: 'auto',
}
const main = { flex: 1, padding: '32px 40px 80px', maxWidth: 920 }
const sideSmall = {
  fontSize: 12,
  color: 'rgba(240,237,230,.55)',
  textDecoration: 'none',
  padding: '4px 0',
}
const sideLink = {
  fontSize: 13,
  color: 'rgba(240,237,230,.72)',
  textDecoration: 'none',
  padding: '6px 0',
  borderBottom: '1px solid transparent',
}
const card = {
  maxWidth: 400,
  margin: '80px auto',
  padding: 40,
  background: '#0c0c0c',
  border: '1px solid rgba(240,237,230,.1)',
  borderRadius: 8,
}
const h1 = { fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, marginBottom: 16, letterSpacing: '.04em' }
const hint = { fontSize: 13, color: 'rgba(240,237,230,.55)', lineHeight: 1.6, marginBottom: 20 }
const code = { color: '#c8ff00', fontSize: 12 }
const lab = { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(240,237,230,.45)' }
const inp = {
  background: '#111',
  border: '1px solid rgba(240,237,230,.15)',
  color: '#f0ede6',
  padding: '12px 14px',
  borderRadius: 4,
  fontSize: 15,
}
const btn = {
  background: '#c8ff00',
  color: '#000',
  border: 'none',
  padding: '14px 20px',
  borderRadius: 4,
  fontFamily: "'Bebas Neue',sans-serif",
  letterSpacing: '.16em',
  fontSize: 14,
  cursor: 'pointer',
}
