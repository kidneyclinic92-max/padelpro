import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteContent } from '../context/SiteContentContext'

const api = (path) => (import.meta.env.VITE_API_BASE || '') + path

export default function Modal({ open, onClose }) {
  const { content } = useSiteContent()
  const m = content.sections.modal
  const COURTS = m.courts?.length ? m.courts : []
  const TIMESLOTS = m.timeslots?.length ? m.timeslots : []

  const [phase, setPhase] = useState('form')
  const [submitErr, setSubmitErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', date: '', court: '', time: '' })

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const d = new Date()
      d.setDate(d.getDate() + 1)
      setPhase('form')
      setSubmitErr('')
      setSubmitting(false)
      setForm((f) => ({ ...f, date: d.toISOString().split('T')[0] }))
    } else {
      document.body.style.overflow = ''
      setTimeout(() => {
        setPhase('form')
        setSubmitErr('')
        setForm({ name: '', email: '', date: '', court: '', time: '' })
      }, 400)
    }
  }, [open])

  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitErr('')
    setSubmitting(true)
    try {
      const r = await fetch(api('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          date: form.date,
          court: form.court,
          time: form.time,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'Request failed')
      setPhase('pending')
    } catch (err) {
      setSubmitErr(err.message || m.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .35 }}
          style={overlayStyle}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 50, scale: .95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: .97 }}
            transition={{ duration: .45, ease: [.34,1.3,.64,1] }}
            style={panelStyle}
          >
            <motion.button
              style={closeStyle}
              onClick={onClose}
              whileHover={{ color: '#c8ff00', rotate: 90 }}
              transition={{ duration: .2 }}
              data-hover
            >
              ×
            </motion.button>

            <AnimatePresence mode="wait">
              {phase === 'pending' ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: .8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: .4, ease: [.16,1,.3,1] }}
                  style={{ textAlign: 'center', padding: '48px 0' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: .1, duration: .5, ease: [.16,1,.3,1] }}
                    style={checkCircle}
                  >
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={2.5}>
                      <polyline points="4,12 9,17 20,6" />
                    </svg>
                  </motion.div>
                  <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: '#c8ff00', marginBottom: 12, marginTop: 24 }}>
                    {m.pendingTitle}
                  </h2>
                  <p style={{ color: 'rgba(240,237,230,.55)', fontSize: 15, lineHeight: 1.65, maxWidth: 380, margin: '0 auto' }}>
                    {m.pendingBody}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p style={eyebrow}>{m.brand}</p>
                  <h2 style={titleStyle}>{m.title}</h2>
                  <p style={subtitleStyle}>{m.subtitle}</p>

                  <form onSubmit={submit} style={{ marginTop: 32 }}>
                    <Field label={m.nameLabel}>
                      <input
                        style={inputStyle}
                        type="text"
                        placeholder={m.namePlaceholder}
                        value={form.name}
                        onChange={set('name')}
                        required
                        className="noir-input"
                      />
                    </Field>

                    <Field label={m.emailLabel}>
                      <input
                        style={inputStyle}
                        type="email"
                        placeholder={m.emailPlaceholder}
                        value={form.email}
                        onChange={set('email')}
                        required
                        autoComplete="email"
                        className="noir-input"
                      />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <Field label={m.dateLabel}>
                        <input
                          style={inputStyle}
                          type="date"
                          value={form.date}
                          onChange={set('date')}
                          required
                          className="noir-input"
                        />
                      </Field>
                      <Field label={m.timeLabel}>
                        <select style={inputStyle} value={form.time} onChange={set('time')} required className="noir-input">
                          <option value="">{m.timePlaceholder}</option>
                          {TIMESLOTS.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label={m.courtLabel}>
                      <select style={inputStyle} value={form.court} onChange={set('court')} required className="noir-input">
                        <option value="">{m.courtPlaceholder}</option>
                        {COURTS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>

                    {submitErr ? (
                      <p style={{ color: '#ff8a80', fontSize: 14, marginBottom: 12 }}>{submitErr}</p>
                    ) : null}

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ boxShadow: submitting ? undefined : '0 0 40px rgba(200,255,0,.4)', scale: submitting ? 1 : 1.01 }}
                      whileTap={{ scale: submitting ? 1 : .98 }}
                      style={{ ...submitStyle, opacity: submitting ? .6 : 1 }}
                      data-hover
                    >
                      {submitting ? '…' : m.submit}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <style>{`
            .noir-input { outline: none; -webkit-appearance: none; }
            .noir-input:focus { border-color: #c8ff00 !important; background: rgba(200,255,0,.04) !important; }
            select.noir-input { background-color: #181818 !important; }
            select.noir-input option { background: #181818; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}
const panelStyle = {
  background: '#0e0e0e',
  border: '1px solid rgba(200,255,0,.18)',
  borderRadius: 8,
  padding: '60px 56px',
  width: '100%',
  maxWidth: 530,
  position: 'relative',
  boxShadow: '0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(200,255,0,.06)',
}
const closeStyle = {
  position: 'absolute',
  top: 20,
  right: 24,
  background: 'none',
  border: 'none',
  color: 'rgba(240,237,230,.4)',
  fontSize: 32,
  cursor: 'pointer',
  lineHeight: 1,
  display: 'flex',
  transition: 'color .2s',
}
const checkCircle = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  background: '#c8ff00',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
}
const eyebrow = {
  fontSize: 10,
  letterSpacing: '.28em',
  textTransform: 'uppercase',
  color: '#c8ff00',
  marginBottom: 10,
}
const titleStyle = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 52,
  color: '#f0ede6',
  lineHeight: 1,
  marginBottom: 8,
}
const subtitleStyle = {
  fontSize: 14,
  color: 'rgba(240,237,230,.45)',
}
const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: 'rgba(240,237,230,.5)',
  marginBottom: 8,
}
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(240,237,230,.1)',
  borderRadius: 3,
  color: '#f0ede6',
  fontFamily: "'DM Sans',sans-serif",
  fontSize: 15,
  padding: '14px 16px',
  transition: 'border-color .2s, background .2s',
}
const submitStyle = {
  width: '100%',
  marginTop: 10,
  background: '#c8ff00',
  color: '#000',
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 18,
  letterSpacing: '.2em',
  padding: '19px',
  border: 'none',
  borderRadius: 2,
  cursor: 'pointer',
  transition: 'box-shadow .3s',
}
