import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || reduceMotion) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.09,
    })

    let raf
    const tick = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    /* Expose so other components (e.g. scroll-to-top) can use it */
    window.__lenis = lenis

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  return children
}
