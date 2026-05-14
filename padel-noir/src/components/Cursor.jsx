import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function Cursor() {
  const { pathname } = useLocation()
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const state   = useRef({ mx: -200, my: -200, rx: -200, ry: -200, hover: false, raf: null })

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add('touch')
      return
    }

    const move = (e) => {
      const s = state.current
      s.mx = e.clientX; s.my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top  = e.clientY + 'px'
      }
    }

    const over = (e) => {
      const hov = !!e.target.closest('a,button,[data-hover]')
      state.current.hover = hov
      document.body.classList.toggle('cur-hover', hov)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)

    const animate = () => {
      const s = state.current
      const speed = s.hover ? 0.14 : 0.1
      s.rx += (s.mx - s.rx) * speed
      s.ry += (s.my - s.ry) * speed
      if (ringRef.current) {
        ringRef.current.style.left = s.rx + 'px'
        ringRef.current.style.top  = s.ry + 'px'
      }
      s.raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      if (state.current.raf) cancelAnimationFrame(state.current.raf)
    }
  }, [pathname])

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      <div ref={dotRef} id="cur-dot" style={dotStyle} />
      <div ref={ringRef} id="cur-ring" style={ringStyle} />
      <style>{`
        #cur-dot  { transition: width .18s, height .18s, background .18s; }
        #cur-ring { transition: width .28s, height .28s, border-color .28s, opacity .28s; }
        .cur-hover #cur-dot  { width:14px !important; height:14px !important; }
        .cur-hover #cur-ring { width:56px !important; height:56px !important; opacity:.6 !important; }
        .touch #cur-dot, .touch #cur-ring { display:none !important; }
        @media(max-width:768px) { #cur-dot, #cur-ring { display:none !important; } body { cursor:auto !important; } }
      `}</style>
    </>
  )
}

const dotStyle = {
  position: 'fixed', width: 8, height: 8,
  background: '#c8ff00', borderRadius: '50%',
  pointerEvents: 'none', zIndex: 9998,
  transform: 'translate(-50%,-50%)',
  mixBlendMode: 'difference',
}
const ringStyle = {
  position: 'fixed', width: 38, height: 38,
  border: '1px solid #c8ff00', borderRadius: '50%',
  pointerEvents: 'none', zIndex: 9997,
  transform: 'translate(-50%,-50%)',
  opacity: .75,
}
