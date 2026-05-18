import { useCallback, useEffect, useState } from 'react'
import { useAdminApiKey } from './useAdminApiKey'

const api = (path) => (import.meta.env.VITE_API_BASE || '') + path

export default function AdminBookings() {
  const { adminKey, saveAdminKey, clearAdminKey, hasBuiltInKey } = useAdminApiKey()
  const [keyInput, setKeyInput] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    if (!adminKey) {
      setLoading(false)
      return
    }
    setErr('')
    setLoading(true)
    try {
      const r = await fetch(api('/api/bookings'), {
        headers: { 'X-Admin-Key': adminKey },
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || r.statusText)
      }
      setBookings(await r.json())
    } catch (e) {
      setErr(e.message || 'Failed to load')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (id) => {
    if (!adminKey) return
    setBusyId(id)
    setErr('')
    try {
      const r = await fetch(api(`/api/bookings/${encodeURIComponent(id)}/approve`), {
        method: 'POST',
        headers: { 'X-Admin-Key': adminKey },
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      await load()
    } catch (e) {
      setErr(e.message || 'Approve failed')
    } finally {
      setBusyId(null)
    }
  }

  const pending = bookings.filter((b) => b.status === 'pending')
  const done = bookings.filter((b) => b.status === 'approved')

  if (!adminKey) {
    return (
      <div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '.06em', marginBottom: 8 }}>
          Court bookings
        </h1>
        <p style={{ color: 'rgba(240,237,230,.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Enter the same value as <code style={code}>ADMIN_API_KEY</code> on the server (repo root{' '}
          <code style={code}>.env</code> locally, Azure Application settings in production).
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!keyInput.trim()) {
              setErr('Admin API key is required.')
              return
            }
            setErr('')
            saveAdminKey(keyInput)
          }}
          style={{ maxWidth: 420 }}
        >
          <label style={label} htmlFor="admin-api-key">
            Admin API key
          </label>
          <input
            id="admin-api-key"
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            style={input}
            autoComplete="off"
          />
          <button type="submit" style={{ ...btn, marginTop: 12 }}>
            Continue
          </button>
        </form>
        {err ? <p style={{ color: '#ff8a80', marginTop: 16 }}>{err}</p> : null}
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '.06em', marginBottom: 8 }}>
        Court bookings
      </h1>
      <p style={{ color: 'rgba(240,237,230,.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        Pending requests appear first. Approving sends the confirmation email to the guest via Gmail (server).
      </p>

      {!hasBuiltInKey ? (
        <button type="button" onClick={clearAdminKey} style={{ ...btnGhost, marginBottom: 16 }}>
          Change admin API key
        </button>
      ) : null}

      <button type="button" onClick={load} style={btnGhost} disabled={loading}>
        {loading ? 'Loading…' : 'Refresh'}
      </button>

      {err ? <p style={{ color: '#ff8a80', marginTop: 16 }}>{err}</p> : null}

      <h2 style={h2}>Pending ({pending.length})</h2>
      {pending.length === 0 && !loading ? (
        <p style={{ color: 'rgba(240,237,230,.4)' }}>No pending bookings.</p>
      ) : (
        <div className="admin-table-wrap">
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>When</th>
              <th style={th}>Guest</th>
              <th style={th}>Email</th>
              <th style={th}>Court</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {pending.map((b) => (
              <tr key={b.id}>
                <td style={td}>{new Date(b.createdAt).toLocaleString()}</td>
                <td style={td}>{b.name}</td>
                <td style={td}>{b.email}</td>
                <td style={td}>{b.court}</td>
                <td style={td}>{b.date}</td>
                <td style={td}>{b.time}</td>
                <td style={td}>
                  <button
                    type="button"
                    style={btn}
                    disabled={busyId === b.id}
                    onClick={() => approve(b.id)}
                  >
                    {busyId === b.id ? '…' : 'Approve & email'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <h2 style={{ ...h2, marginTop: 48 }}>Approved ({done.length})</h2>
      {done.length === 0 ? (
        <p style={{ color: 'rgba(240,237,230,.4)' }}>None yet.</p>
      ) : (
        <div className="admin-table-wrap">
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Approved</th>
              <th style={th}>Guest</th>
              <th style={th}>Email</th>
              <th style={th}>Court</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {done.map((b) => (
              <tr key={b.id}>
                <td style={td}>{b.approvedAt ? new Date(b.approvedAt).toLocaleString() : '—'}</td>
                <td style={td}>{b.name}</td>
                <td style={td}>{b.email}</td>
                <td style={td}>{b.court}</td>
                <td style={td}>{b.date}</td>
                <td style={td}>{b.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}

const code = {
  fontFamily: 'monospace',
  fontSize: 12,
  background: 'rgba(240,237,230,.08)',
  padding: '2px 6px',
  borderRadius: 3,
}
const label = {
  display: 'block',
  fontSize: 10,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'rgba(240,237,230,.45)',
  marginBottom: 8,
}
const input = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(240,237,230,.06)',
  border: '1px solid rgba(240,237,230,.15)',
  borderRadius: 4,
  color: '#f0ede6',
  fontSize: 14,
  boxSizing: 'border-box',
}

const h2 = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 20,
  letterSpacing: '.08em',
  color: '#c8ff00',
  marginTop: 28,
  marginBottom: 14,
}
const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  marginTop: 8,
}
const th = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid rgba(240,237,230,.12)',
  color: 'rgba(240,237,230,.45)',
  fontSize: 10,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
}
const td = {
  padding: '12px',
  borderBottom: '1px solid rgba(240,237,230,.06)',
  verticalAlign: 'middle',
}
const btn = {
  background: '#c8ff00',
  color: '#000',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 4,
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 12,
  letterSpacing: '.1em',
  cursor: 'pointer',
}
const btnGhost = {
  ...btn,
  background: 'transparent',
  color: '#c8ff00',
  border: '1px solid rgba(200,255,0,.4)',
}
