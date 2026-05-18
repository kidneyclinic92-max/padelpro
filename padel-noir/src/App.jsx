import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import Cursor       from './components/Cursor'
import Nav          from './components/Nav'
import Footer       from './components/Footer'
import Modal        from './components/Modal'
import ScrollToTop  from './components/ScrollToTop'
import SmoothScroll from './components/SmoothScroll'
import ScrollMeter  from './components/ScrollMeter'

import Home           from './pages/Home'
import AboutPage      from './pages/AboutPage'
import CourtsPage     from './pages/CourtsPage'
import CoachesPage    from './pages/CoachesPage'
import MembershipPage from './pages/MembershipPage'
import AdminRoutes    from './admin/AdminRoutes'

function AnimatedRoutes({ onBook }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: .5, ease: [.16,1,.3,1] }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/"           element={<Home           onBook={onBook} />} />
          <Route path="/about"      element={<AboutPage      onBook={onBook} />} />
          <Route path="/courts"     element={<CourtsPage     onBook={onBook} />} />
          <Route path="/coaches"    element={<CoachesPage    onBook={onBook} />} />
          <Route path="/membership" element={<MembershipPage onBook={onBook} />} />
          <Route path="*"           element={<Home           onBook={onBook} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function PublicApp() {
  const [modalOpen, setModalOpen] = useState(false)
  const [wipeDone,  setWipeDone]  = useState(false)
  const open  = () => setModalOpen(true)
  const close = () => setModalOpen(false)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) document.body.classList.add('touch')
    return () => document.body.classList.remove('touch')
  }, [])

  return (
    <SmoothScroll>
      <AnimatePresence>
        {!wipeDone && (
          <motion.div
            key="wipe"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{}}
            transition={{ duration: .85, delay: .2, ease: [.76,0,.24,1] }}
            style={wipeStyle}
            onAnimationComplete={() => setWipeDone(true)}
          />
        )}
      </AnimatePresence>

      <ScrollToTop />
      <Cursor />
      <ScrollMeter />

      <Nav onBook={open} />

      <main>
        <AnimatedRoutes onBook={open} />
      </main>

      <Footer />

      <Modal open={modalOpen} onClose={close} />

      <style>{`
        a:hover, button:hover { color: inherit; }
        ::selection { background: #c8ff00; color: #000; }
      `}</style>
    </SmoothScroll>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<PublicApp />} />
    </Routes>
  )
}

const wipeStyle = {
  position: 'fixed', inset: 0,
  background: '#000',
  zIndex: 9999,
  transformOrigin: 'top',
  pointerEvents: 'none',
}
