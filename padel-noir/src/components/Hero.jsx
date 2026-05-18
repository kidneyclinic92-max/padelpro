import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MagneticButton from './MagneticButton'
import { useSiteContent } from '../context/SiteContentContext'

export default function Hero({ onBook }) {
  const { content } = useSiteContent()
  const h = content.home.hero
  const sectionRef = useRef(null)
  const canvasRef  = useRef(null)
  const navigate   = useNavigate()

  /* ── Framer Motion parallax on scroll ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const rawY      = useTransform(scrollYProgress, [0,1], [0, -140])
  const parallaxY = useSpring(rawY, { stiffness: 80, damping: 22 })
  const opacity   = useTransform(scrollYProgress, [0, .7], [1, 0])
  const imgScale  = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  /* ── Canvas cinematic animation ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, raf

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* --- Bokeh particles (orange + teal matching image) --- */
    function mkBokeh() {
      const teal   = ['rgba(0,229,255,', 'rgba(0,180,216,', 'rgba(72,202,228,']
      const orange = ['rgba(255,163,71,', 'rgba(255,200,80,', 'rgba(255,120,40,']
      const isOrange = Math.random() > .45
      const col = isOrange ? orange[Math.floor(Math.random()*orange.length)]
                           :  teal[Math.floor(Math.random()*teal.length)]
      return {
        x:    Math.random() * W,
        y:    H * .3 + Math.random() * H * .7,
        r:    3 + Math.random() * 22,
        col,
        a:    .1 + Math.random() * .55,
        vy:   -(0.15 + Math.random() * .5),
        vx:   (Math.random() - .5) * .3,
        life: 0,
        maxLife: 220 + Math.random() * 280,
        phase: Math.random() * Math.PI * 2,
      }
    }
    const bokeh = Array.from({length: 55}, mkBokeh)

    /* --- Sparkle dots --- */
    function mkSpark() {
      return {
        x: Math.random() * W,
        y: Math.random() * H * .75,
        r: .5 + Math.random() * 2,
        a: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: .02 + Math.random() * .04,
      }
    }
    const sparks = Array.from({length: 90}, mkSpark)

    /* --- Energy streak lines (teal) --- */
    function mkStreak() {
      const side = Math.random() > .5
      return {
        x1: side ? W*.15 + Math.random()*W*.2 : W*.6 + Math.random()*W*.25,
        y1: H*.4  + Math.random() * H*.45,
        len: 60 + Math.random()*140,
        angle: (-Math.PI*.18) + (Math.random()-.5)*.6,
        life: 0, maxLife: 25 + Math.random()*35,
        alpha: .6 + Math.random()*.4,
        w: .8 + Math.random()*1.8,
        timer: Math.random() * 120,
      }
    }
    const streaks = Array.from({length: 16}, mkStreak)

    /* --- Ball arc --- */
    const ballArc = { t: 0, speed: .004, trail: [] }

    /* --- Lens flare (sun center-top-right) --- */
    const FLARE_X = .52, FLARE_Y = .42

    let t = 0

    function drawBokeh() {
      bokeh.forEach((b, i) => {
        b.life++
        b.x += b.vx + Math.sin(t*.008 + b.phase)*.25
        b.y += b.vy
        const lifeRatio = b.life / b.maxLife
        const fade = lifeRatio < .15 ? lifeRatio/.15 : lifeRatio > .75 ? 1-(lifeRatio-.75)/.25 : 1
        const pulse = .8 + Math.sin(t*.04 + b.phase)*.2

        ctx.save()
        ctx.globalAlpha = b.a * fade * pulse
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0,   b.col + (.9 * fade * pulse) + ')')
        g.addColorStop(0.5, b.col + (.3 * fade * pulse) + ')')
        g.addColorStop(1,   b.col + '0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r * (1 + pulse*.08), 0, Math.PI*2)
        ctx.fill()
        ctx.restore()

        if (b.life >= b.maxLife || b.y < -30) bokeh[i] = mkBokeh()
      })
    }

    function drawSparks() {
      sparks.forEach(s => {
        const twinkle = (Math.sin(t * s.speed + s.phase) + 1) / 2
        ctx.save()
        ctx.globalAlpha = twinkle * .85
        ctx.fillStyle   = '#fff'
        ctx.shadowBlur  = 4
        ctx.shadowColor = 'rgba(0,229,255,.8)'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * (.5 + twinkle*.8), 0, Math.PI*2)
        ctx.fill()
        ctx.restore()
      })
    }

    function drawStreaks() {
      streaks.forEach((s, i) => {
        s.timer--
        if (s.timer > 0) return
        s.life++

        const lifeRatio = s.life / s.maxLife
        const fade = lifeRatio < .2 ? lifeRatio/.2 : lifeRatio > .6 ? 1-(lifeRatio-.6)/.4 : 1

        const x2 = s.x1 + Math.cos(s.angle) * s.len
        const y2 = s.y1 + Math.sin(s.angle) * s.len

        const g = ctx.createLinearGradient(s.x1, s.y1, x2, y2)
        g.addColorStop(0,   `rgba(0,229,255,0)`)
        g.addColorStop(0.3, `rgba(0,229,255,${s.alpha * fade})`)
        g.addColorStop(0.7, `rgba(80,240,255,${s.alpha * fade * .7})`)
        g.addColorStop(1,   `rgba(0,229,255,0)`)

        ctx.save()
        ctx.strokeStyle = g
        ctx.lineWidth   = s.w
        ctx.shadowBlur  = 8
        ctx.shadowColor = 'rgba(0,229,255,.5)'
        ctx.lineCap     = 'round'
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.moveTo(s.x1, s.y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.restore()

        if (s.life >= s.maxLife) streaks[i] = { ...mkStreak(), timer: 30 + Math.random()*90 }
      })
    }

    function drawBall() {
      ballArc.t += ballArc.speed
      const arc = ballArc.t % 1
      // Parabolic arc across upper third of screen
      const bx = W * (.15 + arc * .7)
      const by = H * (.12 - Math.sin(arc * Math.PI) * .1 + .02)

      ballArc.trail.push({x: bx, y: by})
      if (ballArc.trail.length > 14) ballArc.trail.shift()

      // Trail
      ballArc.trail.forEach((pt, i) => {
        const a = (i / ballArc.trail.length) * .5
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3 * (i/ballArc.trail.length), 0, Math.PI*2)
        ctx.fillStyle = `rgba(200,255,0,${a})`
        ctx.fill()
      })

      // Ball
      ctx.save()
      ctx.shadowBlur  = 14
      ctx.shadowColor = 'rgba(200,255,0,.9)'
      ctx.fillStyle   = '#d4ff1a'
      ctx.beginPath()
      ctx.arc(bx, by, 5, 0, Math.PI*2)
      ctx.fill()
      ctx.restore()
    }

    function drawLensFlare() {
      const fx = W * FLARE_X
      const fy = H * FLARE_Y
      const pulse = .85 + Math.sin(t * .015) * .15

      // Sun core glow
      const sg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 120 * pulse)
      sg.addColorStop(0,   `rgba(255,190,80,${.22 * pulse})`)
      sg.addColorStop(0.4, `rgba(255,140,40,${.09 * pulse})`)
      sg.addColorStop(1,   'rgba(255,100,20,0)')
      ctx.fillStyle = sg
      ctx.beginPath()
      ctx.arc(fx, fy, 120 * pulse, 0, Math.PI*2)
      ctx.fill()

      // Anamorphic horizontal streak
      const ag = ctx.createLinearGradient(fx - W*.35, fy, fx + W*.35, fy)
      ag.addColorStop(0,    'rgba(255,200,100,0)')
      ag.addColorStop(0.38, `rgba(255,200,120,${.07 * pulse})`)
      ag.addColorStop(0.5,  `rgba(255,220,150,${.14 * pulse})`)
      ag.addColorStop(0.62, `rgba(255,200,120,${.07 * pulse})`)
      ag.addColorStop(1,    'rgba(255,200,100,0)')
      ctx.fillStyle = ag
      ctx.fillRect(fx - W*.35, fy - 2, W*.7, 4)

      // Flare ghosts (reflected along axis toward center)
      const ghosts = [-.22, -.45, -.7, .3, .55]
      ghosts.forEach((g, i) => {
        const gx = fx + (W*.5 - fx) * g * 2
        const gy = fy + (H*.5 - fy) * g * 2
        const gr = 10 + i * 7
        const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
        gg.addColorStop(0,  `rgba(255,210,80,${.08 * pulse})`)
        gg.addColorStop(1,   'rgba(255,210,80,0)')
        ctx.fillStyle = gg
        ctx.beginPath()
        ctx.arc(gx, gy, gr, 0, Math.PI*2)
        ctx.fill()
      })
    }

    function drawGroundGlow() {
      // Teal ground-court reflection glow
      const pulse = .8 + Math.sin(t * .02) * .2
      const gg = ctx.createRadialGradient(W*.5, H, 0, W*.5, H, W*.6)
      gg.addColorStop(0,   `rgba(0,180,150,${.08 * pulse})`)
      gg.addColorStop(0.5, `rgba(0,150,120,${.03 * pulse})`)
      gg.addColorStop(1,    'transparent')
      ctx.fillStyle = gg
      ctx.fillRect(0, H*.55, W, H*.45)
    }

    function draw() {
      t++
      ctx.clearRect(0, 0, W, H)

      drawGroundGlow()
      drawBokeh()
      drawSparks()
      drawLensFlare()
      drawStreaks()
      drawBall()

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const WORDS = (h.headline || 'DOMINATE THE COURT').trim().split(/\s+/).filter(Boolean)

  return (
    <section id="hero" ref={sectionRef} style={heroSection}>

      {/* ── Background video — scale on motion element directly, no wrapper ── */}
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={h.posterSrc || '/herosection.jpg'}
        style={{ ...videoStyle, scale: imgScale }}
      >
        <source src={h.videoSrc || '/herosection_video.mp4'} type="video/mp4" />
      </motion.video>

      {/* ── Canvas animation layer ── */}
      <canvas ref={canvasRef} style={canvasStyle} aria-hidden />

      {/* ── Gradient & vignette overlays ── */}
      <div style={gradientOverlay} />
      <div style={vignetteOverlay} />
      <div style={editorialOverlay} />

      {/* ── Text content (bottom-left editorial anchor) ── */}
      <motion.div className="hero-content" style={{ ...contentWrap, y: parallaxY, opacity }}>
        {/* Headline split reveal */}
        <h1 className="hero-headline" style={headline} aria-label={h.headline || 'Hero'}>
          {WORDS.map((word, i) => (
            <span key={word} style={wordOuter}>
              <motion.span
                initial={{ y: '115%', skewY: 7 }}
                animate={{ y: 0, skewY: 0 }}
                transition={{ duration: 1.05, delay: .6 + i * .18, ease: [.16,1,.3,1] }}
                style={{ display: 'block' }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: 1.42 }}
          className="hero-cta-row"
          style={ctaRow}
        >
          <MagneticButton onClick={onBook} style={ctaPrimary}>
            {h.primaryCta}
          </MagneticButton>
          <MagneticButton
            onClick={() => navigate(h.explorePath || '/about')}
            style={ctaSecondary}
          >
            {h.exploreCta}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll arrow (bottom-right corner) ── */}
      <motion.div
        className="hero-scroll"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={scrollInd}
        aria-hidden
      >
        <span style={scrollLabel}>{h.scrollLabel}</span>
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          style={arrow}
        />
      </motion.div>

      {/* ── Bottom stat bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: .9 }}
        className="hero-stat-row"
        style={statRow}
      >
        {(h.stats || []).map(({ value, label }) => (
          <motion.div key={label} className="hero-stat-item" style={statItem}>
            <span style={statVal}>{value}</span>
            <span style={statLabel}>{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ── STYLES ── */
const heroSection = {
  position: 'relative', width: '100%', height: '100vh',
  overflow: 'hidden',
  background: '#050a08',
}
const videoStyle = {
  position: 'absolute', inset: 0,
  width: '100%', height: '100%',
  objectFit: 'cover', objectPosition: 'center 40%',
  imageRendering: 'high-quality',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  transformOrigin: 'center center',
}
const canvasStyle = {
  position: 'absolute', inset: 0,
  width: '100%', height: '100%',
  zIndex: 1, pointerEvents: 'none',
}
const gradientOverlay = {
  /* Subtle top→bottom dark fade */
  position: 'absolute', inset: 0, zIndex: 2,
  background: `linear-gradient(to bottom,
    rgba(0,0,0,.15)   0%,
    rgba(0,0,0,.05)  30%,
    rgba(0,0,0,.05)  55%,
    rgba(5,5,5,.85)  100%
  )`,
}
const vignetteOverlay = {
  position: 'absolute', inset: 0, zIndex: 2,
  background: 'radial-gradient(ellipse at 60% 50%, transparent 45%, rgba(0,0,0,.55) 100%)',
}
/* Editorial bottom-left vignette so the text panel reads cleanly
   while keeping the right half of the video fully visible */
const editorialOverlay = {
  position: 'absolute', inset: 0, zIndex: 2,
  background: `linear-gradient(105deg,
    rgba(0,0,0,.72) 0%,
    rgba(0,0,0,.45) 25%,
    rgba(0,0,0,.15) 50%,
    rgba(0,0,0,0)   70%
  )`,
}
const grainLayer = {
  display: 'none',
}
const contentWrap = {
  position: 'absolute',
  left: 'clamp(28px,6vw,96px)',
  bottom: 'clamp(140px,18vh,200px)',
  zIndex: 4,
  textAlign: 'left',
  maxWidth: 760,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}
const headline = {
  fontSize: 'clamp(40px,6.4vw,84px)', lineHeight: .96,
  display: 'flex', flexWrap: 'nowrap',
  justifyContent: 'flex-start', gap: '0 .25em',
  letterSpacing: '-.01em',
  whiteSpace: 'nowrap',
}
const wordOuter = { display: 'inline-block', overflow: 'hidden' }
const ctaRow = {
  display: 'flex', gap: 14, flexWrap: 'wrap',
  justifyContent: 'flex-start', marginTop: 36,
}
const ctaPrimary = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 16, letterSpacing: '.2em',
  color: '#000', background: '#c8ff00',
  border: '2px solid #c8ff00',
  padding: '15px 44px', borderRadius: 2,
  transition: 'box-shadow .3s',
}
const ctaSecondary = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: 16, letterSpacing: '.2em',
  color: '#f0ede6', background: 'transparent',
  border: '1.5px solid rgba(240,237,230,.32)',
  padding: '15px 34px', borderRadius: 2,
  transition: 'border-color .3s, color .3s',
}
const scrollInd = {
  position: 'absolute',
  right: 'clamp(20px,4vw,48px)',
  bottom: 'clamp(100px,12vh,140px)',
  zIndex: 4,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 14,
}
const scrollLabel = {
  fontSize: 9, letterSpacing: '.4em', fontWeight: 600,
  color: 'rgba(240,237,230,.42)',
  writingMode: 'vertical-rl', transform: 'rotate(180deg)',
  fontFamily: "'DM Sans',sans-serif",
}
const arrow = {
  width: 14, height: 14,
  borderRight: '1.5px solid rgba(200,255,0,.7)',
  borderBottom: '1.5px solid rgba(200,255,0,.7)',
  transform: 'rotate(45deg)',
}
const statRow = {
  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
  display: 'flex', justifyContent: 'center',
  borderTop: '1px solid rgba(240,237,230,.06)',
  backdropFilter: 'blur(14px)',
  background: 'rgba(5,5,5,.52)',
}
const statItem = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '18px 52px',
  borderRight: '1px solid rgba(240,237,230,.06)',
}
const statVal   = { fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#c8ff00', lineHeight:1 }
const statLabel = { fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(240,237,230,.4)', marginTop:4 }
