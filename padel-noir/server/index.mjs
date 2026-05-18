/**
 * Booking API + Gmail SMTP (nodemailer).
 * Loads env from padel-noir/.env then padel_pro/.env (parent) so GMAIL_* can live at repo root.
 */
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const padelNoirRoot = path.join(__dirname, '..')
const padelProRoot = path.join(__dirname, '..', '..')

loadEnv({ path: path.join(padelProRoot, '.env') })
loadEnv({ path: path.join(padelNoirRoot, '.env') })

const PORT = Number(process.env.PORT || process.env.BOOKING_API_PORT || 3001)
const DIST_DIR = path.join(padelNoirRoot, 'dist')
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'bookings.json')
const ADMIN_KEY = process.env.ADMIN_API_KEY || ''
const GMAIL_USER = process.env.GMAIL_USER || ''
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')

function readBookings() {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeBookings(list) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8')
}

function requireAdmin(req, res, next) {
  const key = req.get('x-admin-key') || ''
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

let transporter = null
function getTransport() {
  if (!GMAIL_USER || !GMAIL_PASS) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    })
  }
  return transporter
}

async function sendApprovalEmail(booking) {
  const tx = getTransport()
  if (!tx) throw new Error('Gmail is not configured (GMAIL_USER / GMAIL_APP_PASSWORD)')

  const subject = 'Your PADEL PRO court booking is confirmed'
  const text = [
    `Hi ${booking.name},`,
    '',
    `Your court booking has been approved.`,
    '',
    `Court: ${booking.court}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    '',
    'See you on the court.',
    '',
    '— PADEL PRO',
  ].join('\n')

  const html = `
    <p>Hi ${escapeHtml(booking.name)},</p>
    <p>Your court booking has been <strong>approved</strong>.</p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;color:#666">Court</td><td>${escapeHtml(booking.court)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666">Date</td><td>${escapeHtml(booking.date)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666">Time</td><td>${escapeHtml(booking.time)}</td></tr>
    </table>
    <p style="margin-top:16px">See you on the court.</p>
    <p style="color:#888;font-size:12px">— PADEL PRO</p>
  `

  await tx.sendMail({
    from: `"PADEL PRO" <${GMAIL_USER}>`,
    to: booking.email,
    subject,
    text,
    html,
  })
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    gmail: Boolean(GMAIL_USER && GMAIL_PASS),
    adminKey: Boolean(ADMIN_KEY),
  })
})

app.post('/api/bookings', (req, res) => {
  const { name, email, date, court, time } = req.body || {}
  if (!name || !email || !date || !court || !time) {
    return res.status(400).json({ error: 'Missing name, email, date, court, or time' })
  }
  const emailNorm = String(email).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const booking = {
    id: randomUUID(),
    name: String(name).trim(),
    email: emailNorm,
    date: String(date),
    court: String(court),
    time: String(time),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const list = readBookings()
  list.unshift(booking)
  writeBookings(list)
  res.status(201).json({ id: booking.id, status: booking.status })
})

app.get('/api/bookings', requireAdmin, (_req, res) => {
  res.json(readBookings())
})

app.post('/api/bookings/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params
  const list = readBookings()
  const idx = list.findIndex((b) => b.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' })

  const b = list[idx]
  if (b.status === 'approved') {
    return res.status(400).json({ error: 'Already approved' })
  }

  try {
    await sendApprovalEmail(b)
  } catch (e) {
    console.error('sendApprovalEmail', e)
    return res.status(500).json({ error: e.message || 'Failed to send email' })
  }

  list[idx] = {
    ...b,
    status: 'approved',
    approvedAt: new Date().toISOString(),
  }
  writeBookings(list)
  res.json({ ok: true, booking: list[idx] })
})

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(DIST_DIR, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
} else {
  console.warn('[padel-pro] dist/ not found — run npm run build before starting in production.')
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PADEL PRO listening on port ${PORT}`)
  if (!GMAIL_USER || !GMAIL_PASS) console.warn('[booking-api] Gmail env missing — approval emails will fail.')
  if (!ADMIN_KEY) console.warn('[booking-api] ADMIN_API_KEY missing — admin booking list/approve disabled.')
})
