import { useEffect, useState } from 'react'
import { useSiteContent } from '../context/SiteContentContext'
import { getAt } from '../utils/siteContentUtils'

function AdminField({ path, label, multiline, rows = 2 }) {
  const { content, patch } = useSiteContent()
  const val = getAt(content, path)
  const str = val === undefined || val === null ? '' : String(val)
  const common = {
    width: '100%',
    boxSizing: 'border-box',
    background: '#0a0a0a',
    border: '1px solid rgba(240,237,230,.12)',
    color: '#f0ede6',
    padding: '10px 12px',
    borderRadius: 4,
    fontSize: 14,
    fontFamily: "'DM Sans',sans-serif",
    marginTop: 6,
  }
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={lab}>{label}</span>
      {multiline ? (
        <textarea style={{ ...common, minHeight: rows * 22, resize: 'vertical' }} value={str} onChange={(e) => patch(path, e.target.value)} rows={rows} />
      ) : (
        <input style={common} value={str} onChange={(e) => patch(path, e.target.value)} />
      )}
    </label>
  )
}

function JsonBlock({ path, label, rows = 14 }) {
  const { content, patch } = useSiteContent()
  const live = getAt(content, path)
  const [text, setText] = useState(() => JSON.stringify(live, null, 2))
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setText(JSON.stringify(getAt(content, path), null, 2))
    setMsg('')
  }, [content, path])

  const apply = () => {
    try {
      patch(path, JSON.parse(text))
      setMsg('Saved')
      setTimeout(() => setMsg(''), 2000)
    } catch {
      setMsg('Invalid JSON — fix and try again')
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ ...lab, marginBottom: 8 }}>{label}</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={rows}
        spellCheck={false}
        style={{
          width: '100%', boxSizing: 'border-box', fontFamily: 'ui-monospace, monospace',
          fontSize: 12, background: '#080808', color: '#c8e6c9', border: '1px solid rgba(200,255,0,.15)',
          borderRadius: 4, padding: 12, lineHeight: 1.45,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button type="button" onClick={apply} style={applyBtn}>Apply JSON</button>
        {msg ? <span style={{ fontSize: 13, color: msg === 'Saved' ? '#c8ff00' : '#ff8a80' }}>{msg}</span> : null}
      </div>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} style={sec}>
      <h2 style={h2}>{title}</h2>
      {children}
    </section>
  )
}

export default function AdminDashboard() {
  const { content, resetToDefaults, replaceAll } = useSiteContent()
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'padel-pro-site-content.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const applyImport = () => {
    try {
      const parsed = JSON.parse(importText)
      replaceAll(parsed)
      setImportMsg('Imported and merged with defaults.')
      setTimeout(() => setImportMsg(''), 3000)
    } catch {
      setImportMsg('Invalid JSON')
    }
  }

  return (
    <div>
      <p style={{ color: 'rgba(240,237,230,.55)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
        Changes save automatically in this browser (localStorage). Use Export to back up JSON. Import merges into the default schema so new fields from updates are preserved.
      </p>

      <Section id="nav" title="Navigation">
        <AdminField path="nav.brandStem" label="Brand (first part)" />
        <AdminField path="nav.brandAccent" label="Brand accent (second part)" />
        <AdminField path="nav.bookCta" label="Book button" />
        <JsonBlock path="nav.links" label="Nav links (array of { label, to })" rows={8} />
      </Section>

      <Section id="home-hero" title="Home · Hero">
        <AdminField path="home.hero.headline" label="Headline (words separated by spaces)" />
        <AdminField path="home.hero.primaryCta" label="Primary CTA" />
        <AdminField path="home.hero.exploreCta" label="Secondary CTA" />
        <AdminField path="home.hero.explorePath" label="Secondary CTA path (e.g. /about)" />
        <AdminField path="home.hero.scrollLabel" label="Scroll indicator label" />
        <AdminField path="home.hero.videoSrc" label="Hero video URL (public/…)" />
        <AdminField path="home.hero.posterSrc" label="Poster image URL" />
        <JsonBlock path="home.hero.stats" label="Bottom stat bar [{ value, label }, …]" rows={8} />
      </Section>

      <Section id="home-ticker" title="Home · Ticker">
        <JsonBlock path="home.ticker.items" label="Ticker items (array of strings, include ★ between phrases)" rows={10} />
      </Section>

      <Section id="home-showcase" title="Home · Showcase">
        <AdminField path="home.showcase.eyebrow" label="Eyebrow" />
        <AdminField path="home.showcase.titleLine1" label="Title line 1" />
        <AdminField path="home.showcase.titleLine2" label="Title line 2 (lime)" />
        <AdminField path="home.showcase.titleAria" label="Accessibility label" />
        <AdminField path="home.showcase.finalText" label="Bottom line text" />
        <JsonBlock path="home.showcase.specs" label="Spec cards [{ tag, value, label, x, y }, …]" rows={12} />
      </Section>

      <Section id="home-pillars" title="Home · Pillars">
        <AdminField path="home.pillars.bgWord" label="Background scrolling word" />
        <AdminField path="home.pillars.topLabel" label="Small label" />
        <AdminField path="home.pillars.accentWord" label="Accent word in headline (for lime color)" />
        <JsonBlock path="home.pillars.headlineWords" label="Headline words (array of strings)" rows={4} />
        <JsonBlock path="home.pillars.pillars" label="Pillar rows [{ num, word, copy }, …]" rows={10} />
        <JsonBlock path="home.pillars.metrics" label="Bottom metrics [{ v, s, l }, …] — v number, s suffix, l label" rows={8} />
      </Section>

      <Section id="home-reel" title="Home · Reel (horizontal scroll)">
        <AdminField path="home.reel.topLabel" label="Top left label" />
        <AdminField path="home.reel.topHint" label="Top right hint" />
        <JsonBlock path="home.reel.panels" label="Panels [{ idx, tag, title, caption, accent }, …]" rows={16} />
      </Section>

      <Section id="page-heroes" title="Inner page heroes">
        <h3 style={h3}>About</h3>
        <AdminField path="pageHero.about.eyebrow" label="Eyebrow" />
        <AdminField path="pageHero.about.title" label="Title (full)" />
        <AdminField path="pageHero.about.accentWord" label="Accent word (lime in title)" />
        <AdminField path="pageHero.about.subtitle" label="Subtitle" multiline rows={3} />
        <h3 style={h3}>Courts</h3>
        <AdminField path="pageHero.courts.eyebrow" label="Eyebrow" />
        <AdminField path="pageHero.courts.title" label="Title" />
        <AdminField path="pageHero.courts.accentWord" label="Accent word" />
        <AdminField path="pageHero.courts.subtitle" label="Subtitle" multiline rows={3} />
        <h3 style={h3}>Coaches</h3>
        <AdminField path="pageHero.coaches.eyebrow" label="Eyebrow" />
        <AdminField path="pageHero.coaches.title" label="Title" />
        <AdminField path="pageHero.coaches.accentWord" label="Accent word" />
        <AdminField path="pageHero.coaches.subtitle" label="Subtitle" multiline rows={3} />
        <h3 style={h3}>Membership</h3>
        <AdminField path="pageHero.membership.eyebrow" label="Eyebrow" />
        <AdminField path="pageHero.membership.title" label="Title" />
        <AdminField path="pageHero.membership.accentWord" label="Accent word" />
        <AdminField path="pageHero.membership.subtitle" label="Subtitle" multiline rows={3} />
      </Section>

      <Section id="section-about" title="About section (home + /about)">
        <AdminField path="sections.about.byTheNumbers" label="Left column label" />
        <AdminField path="sections.about.ourStory" label="Right column label" />
        <AdminField path="sections.about.highlightWord" label="Highlight word in split headline" />
        <JsonBlock path="sections.about.splitHeadline" label="Split headline words (array)" rows={3} />
        <JsonBlock path="sections.about.stats" label="Stat cards [{ target, suffix, label }, …]" rows={8} />
        <AdminField path="sections.about.paragraph1" label="Paragraph 1" multiline rows={4} />
        <AdminField path="sections.about.paragraph2" label="Paragraph 2" multiline rows={4} />
        <AdminField path="sections.about.courtsCta" label="Courts link text" />
      </Section>

      <Section id="section-courts" title="Courts section">
        <AdminField path="sections.courts.sectionLabel" label="Section label" />
        <AdminField path="sections.courts.titleLine1" label="Title line 1" />
        <AdminField path="sections.courts.titleLine2" label="Title line 2" />
        <AdminField path="sections.courts.stripCaption" label="Strip caption" multiline rows={2} />
        <AdminField path="sections.courts.bookLayer" label="Book hover CTA" />
        <JsonBlock path="sections.courts.cards" label="Court cards [{ n, name, badge, color, accent }, …]" rows={14} />
      </Section>

      <Section id="section-coaches" title="Coaches section">
        <AdminField path="sections.coaches.sectionLabel" label="Section label" />
        <AdminField path="sections.coaches.titleLine1" label="Title line 1" />
        <AdminField path="sections.coaches.titleLine2" label="Title line 2" />
        <JsonBlock path="sections.coaches.list" label="Coaches [{ initials, name, tag, nationality, bio }, …]" rows={18} />
      </Section>

      <Section id="section-membership" title="Membership section">
        <AdminField path="sections.membership.sectionLabel" label="Section label" />
        <AdminField path="sections.membership.titleLine1" label="Title line 1" />
        <AdminField path="sections.membership.titleLine2" label="Title line 2" />
        <AdminField path="sections.membership.intro" label="Intro paragraph" multiline rows={3} />
        <AdminField path="sections.membership.tierCta" label="Tier button text" />
        <JsonBlock path="sections.membership.tiers" label="Tiers (JSON)" rows={22} />
      </Section>

      <Section id="section-booking" title="Booking CTA section">
        <JsonBlock path="sections.bookingCta.words" label="Headline words (array)" rows={3} />
        <AdminField path="sections.bookingCta.accentWord" label="Accent word (lime)" />
        <AdminField path="sections.bookingCta.sub" label="Subcopy" />
        <AdminField path="sections.bookingCta.button" label="Button" />
      </Section>

      <Section id="footer" title="Footer">
        <AdminField path="sections.footer.tagline" label="Tagline" />
        <AdminField path="sections.footer.clubColumnTitle" label="Club column title" />
        <AdminField path="sections.footer.contactColumnTitle" label="Contact column title" />
        <AdminField path="sections.footer.followLabel" label="Follow label" />
        <AdminField path="sections.footer.copyright" label="Copyright line" />
        <JsonBlock path="sections.footer.clubLinks" label="Club links [{ label, to }, …]" rows={8} />
        <JsonBlock path="sections.footer.contactLines" label="Contact lines [{ label, href }, …]" rows={8} />
        <JsonBlock path="sections.footer.legal" label="Legal links (array of strings)" rows={3} />
      </Section>

      <Section id="modal" title="Booking modal">
        <AdminField path="sections.modal.brand" label="Eyebrow brand" />
        <AdminField path="sections.modal.title" label="Title" />
        <AdminField path="sections.modal.subtitle" label="Subtitle" multiline rows={2} />
        <AdminField path="sections.modal.nameLabel" label="Name field label" />
        <AdminField path="sections.modal.namePlaceholder" label="Name placeholder" />
        <AdminField path="sections.modal.emailLabel" label="Email field label" />
        <AdminField path="sections.modal.emailPlaceholder" label="Email placeholder" />
        <AdminField path="sections.modal.dateLabel" label="Date label" />
        <AdminField path="sections.modal.timeLabel" label="Time label" />
        <AdminField path="sections.modal.timePlaceholder" label="Time placeholder" />
        <AdminField path="sections.modal.courtLabel" label="Court label" />
        <AdminField path="sections.modal.courtPlaceholder" label="Court placeholder" />
        <AdminField path="sections.modal.submit" label="Submit button" />
        <AdminField path="sections.modal.pendingTitle" label="After submit — title (pending approval)" />
        <AdminField path="sections.modal.pendingBody" label="After submit — message" multiline rows={3} />
        <AdminField path="sections.modal.submitError" label="Generic submit error message" multiline rows={2} />
        <AdminField path="sections.modal.successTitle" label="(Legacy) success title" />
        <AdminField path="sections.modal.successBody" label="(Legacy) success body" multiline rows={3} />
        <JsonBlock path="sections.modal.courts" label="Court options (array of strings)" rows={6} />
        <JsonBlock path="sections.modal.timeslots" label="Time slots (array of strings)" rows={8} />
      </Section>

      <Section id="import" title="Import / export / reset">
        <button type="button" onClick={exportJson} style={{ ...applyBtn, marginBottom: 16 }}>Download JSON export</button>
        <button type="button" onClick={() => { resetToDefaults(); setImportMsg('Reset to built-in defaults.') }} style={{ ...applyBtn, marginLeft: 12, background: '#3d1515', border: '1px solid #ff6b6b', color: '#ffb4b4' }}>
          Reset all to defaults
        </button>
        <p style={{ color: 'rgba(240,237,230,.45)', fontSize: 13, marginTop: 16 }}>{importMsg}</p>
        <div style={{ ...lab, marginTop: 24, marginBottom: 8 }}>Paste full JSON to import (merge)</div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={12}
          placeholder="{ ... }"
          style={{
            width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 12,
            background: '#080808', color: '#eee', border: '1px solid rgba(240,237,230,.12)', borderRadius: 4, padding: 12,
          }}
        />
        <button type="button" onClick={applyImport} style={{ ...applyBtn, marginTop: 10 }}>Merge import</button>
      </Section>
    </div>
  )
}

const sec = { marginBottom: 56, paddingBottom: 40, borderBottom: '1px solid rgba(240,237,230,.06)' }
const h2 = { fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: '.06em', marginBottom: 20, color: '#c8ff00' }
const h3 = { fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(240,237,230,.45)', margin: '20px 0 12px' }
const lab = { fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(240,237,230,.45)', display: 'block' }
const applyBtn = {
  background: '#c8ff00', color: '#000', border: 'none', padding: '10px 18px', borderRadius: 4,
  fontFamily: "'Bebas Neue',sans-serif", letterSpacing: '.12em', fontSize: 13, cursor: 'pointer',
}
