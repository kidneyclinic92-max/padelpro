import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Wraps any element with a magnetic attraction effect.
 * The content shifts toward the cursor when hovering nearby.
 */
export default function MagneticButton({ children, strength = 0.38, className, style, onClick, type }) {
  const ref = useRef(null)
  const x   = useMotionValue(0)
  const y   = useMotionValue(0)
  const sx  = useSpring(x, { stiffness: 220, damping: 18 })
  const sy  = useSpring(y, { stiffness: 220, damping: 18 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }

  const handleLeave = () => {
    x.set(0); y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={className}
      style={{ ...style, x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      data-hover
    >
      {children}
    </motion.button>
  )
}
