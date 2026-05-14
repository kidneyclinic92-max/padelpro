import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Center, ContactShadows, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const widthAt = (theta) => {
  const t = (Math.sin(theta) + 1) / 2
  return 0.82 + t * 0.18
}

/* ─────────────────────────────────────────────
   PADEL RACKET — vibrant multi-colour (static model)
───────────────────────────────────────────── */
function RacketModel() {

  /* ─── FACE: dark teal-green → warm orange smoky gradient ─── */
  const faceTextureFront = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 1024
    const x = c.getContext('2d')

    // 1) Near-black base
    x.fillStyle = '#020608'
    x.fillRect(0, 0, 1024, 1024)

    // 2) Dark green/teal radial glow — upper-left quadrant
    const teal = x.createRadialGradient(310, 280, 0, 310, 280, 780)
    teal.addColorStop(0,    '#0d5740')
    teal.addColorStop(0.35, '#063a2c')
    teal.addColorStop(0.7,  '#021c1a')
    teal.addColorStop(1,    'rgba(0,0,0,0)')
    x.fillStyle = teal
    x.fillRect(0, 0, 1024, 1024)

    // 3) Warm orange/copper radial glow — lower-right quadrant
    const ora = x.createRadialGradient(780, 820, 0, 780, 820, 640)
    ora.addColorStop(0,    'rgba(255,135,40,.95)')
    ora.addColorStop(0.4,  'rgba(220,80,25,.55)')
    ora.addColorStop(0.8,  'rgba(110,40,15,.18)')
    ora.addColorStop(1,    'rgba(0,0,0,0)')
    x.fillStyle = ora
    x.fillRect(0, 0, 1024, 1024)

    // 4) Faint cyan rim mist — top edge
    const mist = x.createRadialGradient(512, 80, 0, 512, 80, 460)
    mist.addColorStop(0, 'rgba(80,220,200,.22)')
    mist.addColorStop(1, 'rgba(80,220,200,0)')
    x.fillStyle = mist
    x.fillRect(0, 0, 1024, 1024)

    // 5) Subtle organic noise streaks (simulate carbon weave)
    x.strokeStyle = 'rgba(255,255,255,.04)'
    x.lineWidth = 1
    for (let i = 0; i < 14; i++) {
      const y = 80 + i * 64 + Math.random() * 20
      x.beginPath()
      x.moveTo(40, y)
      x.bezierCurveTo(300, y - 18, 700, y + 22, 990, y - 12)
      x.stroke()
    }

    // 6) Vignette
    const vig = x.createRadialGradient(512, 512, 280, 512, 512, 600)
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(1, 'rgba(0,0,0,0.55)')
    x.fillStyle = vig
    x.fillRect(0, 0, 1024, 1024)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])

  /* ─── GRIP TEXTURE: white X-tape diagonal weave on dark base ─── */
  const gripTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 512
    const x = c.getContext('2d')

    // Dark base
    const bg = x.createLinearGradient(0, 0, 0, 512)
    bg.addColorStop(0, '#1a1a1a')
    bg.addColorStop(0.5, '#0a0a0a')
    bg.addColorStop(1, '#080808')
    x.fillStyle = bg
    x.fillRect(0, 0, 1024, 512)

    // Helper to draw diagonal silver-white tape stripes
    const drawStripes = (angle, spacing, width, alpha) => {
      x.save()
      x.translate(512, 256)
      x.rotate(angle)
      for (let i = -1500; i < 1500; i += spacing) {
        const grad = x.createLinearGradient(i, 0, i + width, 0)
        grad.addColorStop(0,    'rgba(255,255,255,0)')
        grad.addColorStop(0.25, `rgba(245,245,240,${alpha})`)
        grad.addColorStop(0.5,  `rgba(255,255,255,${alpha})`)
        grad.addColorStop(0.75, `rgba(220,220,215,${alpha})`)
        grad.addColorStop(1,    'rgba(255,255,255,0)')
        x.fillStyle = grad
        x.fillRect(i, -1200, width, 2400)
      }
      x.restore()
    }

    // X-pattern: two opposite diagonals
    drawStripes( Math.PI / 4.2, 88, 38, 1.0)
    drawStripes(-Math.PI / 4.2, 88, 32, 0.85)

    // Subtle horizontal stitch lines for tape edges
    x.strokeStyle = 'rgba(255,255,255,.12)'
    x.lineWidth = 1.2
    for (let y = 30; y < 512; y += 90) {
      x.beginPath()
      x.moveTo(0, y)
      x.lineTo(1024, y)
      x.stroke()
    }

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.repeat.set(2, 1)
    return tex
  }, [])

  /* ─── HEAD FACE GEOMETRY: rounded teardrop with circular holes ─── */
  const faceGeo = useMemo(() => {
    const shape = new THREE.Shape()
    const RX = 1.0, RY = 1.20
    const SEG = 128

    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2 + Math.PI / 2
      const x = Math.cos(a) * RX * widthAt(a)
      const y = Math.sin(a) * RY
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
    }

    // Tighter, smaller circular hole pattern (denser, more authentic padel look)
    const HOLE_R  = 0.058
    const SPACE_X = 0.195
    const SPACE_Y = SPACE_X * 0.866
    const INSET   = 0.16

    let row = 0
    for (let py = -RY + INSET; py <= RY - INSET; py += SPACE_Y) {
      const offset = (row % 2) * (SPACE_X / 2)
      for (let px = -RX + INSET; px <= RX - INSET; px += SPACE_X) {
        const x = px + offset
        const ny = py / (RY - 0.06)
        if (Math.abs(ny) >= 1) continue
        const wF = 0.82 + ((Math.sign(ny) * Math.abs(ny) + 1) / 2) * 0.18
        const maxX = (RX - 0.06) * Math.sqrt(1 - ny * ny) * wF
        if (Math.abs(x) > maxX - HOLE_R * 1.6) continue
        const hole = new THREE.Path()
        hole.absarc(x, py, HOLE_R, 0, Math.PI * 2, true)
        shape.holes.push(hole)
      }
      row++
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.03,
      bevelThickness: 0.024,
      curveSegments: 32,
      UVGenerator: customUVGen(RX, RY),
    })
  }, [])

  /* ─── MINT RIM: chunky luminous frame around face ─── */
  const rimGeo = useMemo(() => {
    const outer = new THREE.Shape()
    const inner = new THREE.Path()
    const RX = 1.0, RY = 1.20, T = 0.062
    const SEG = 128
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2 + Math.PI / 2
      const x = Math.cos(a) * RX * widthAt(a)
      const y = Math.sin(a) * RY
      i === 0 ? outer.moveTo(x, y) : outer.lineTo(x, y)
    }
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2 + Math.PI / 2
      const x = Math.cos(a) * (RX - T) * widthAt(a)
      const y = Math.sin(a) * (RY - T)
      i === 0 ? inner.moveTo(x, y) : inner.lineTo(x, y)
    }
    outer.holes.push(inner)
    return new THREE.ExtrudeGeometry(outer, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.014,
      bevelThickness: 0.012,
      curveSegments: 32,
    })
  }, [])

  /* ─── THROAT: trapezoid with two triangular cutouts (Y-strut) ─── */
  const throatGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.36, 0.22)
    s.lineTo( 0.36, 0.22)
    s.lineTo( 0.17, -0.55)
    s.lineTo(-0.17, -0.55)
    s.closePath()

    // Left triangular hole
    const leftHole = new THREE.Path()
    leftHole.moveTo(-0.05, 0.12)
    leftHole.lineTo(-0.28, 0.12)
    leftHole.lineTo(-0.13, -0.44)
    leftHole.closePath()
    s.holes.push(leftHole)

    // Right triangular hole
    const rightHole = new THREE.Path()
    rightHole.moveTo( 0.05, 0.12)
    rightHole.lineTo( 0.28, 0.12)
    rightHole.lineTo( 0.13, -0.44)
    rightHole.closePath()
    s.holes.push(rightHole)

    return new THREE.ExtrudeGeometry(s, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.02,
      bevelThickness: 0.016,
    })
  }, [])

  /* ─── MATERIALS ─── */
  const faceMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: faceTextureFront,
    roughness: 0.34,
    metalness: 0.55,
    clearcoat: 0.95,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.4,
  }), [faceTextureFront])

  // Bright luminous mint — frame, throat, accents
  const mintMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#86f3c8',
    roughness: 0.18,
    metalness: 0.55,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    emissive: '#3fcfa0',
    emissiveIntensity: 0.4,
    envMapIntensity: 1.6,
  }), [])

  const handleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080808',
    roughness: 0.85,
    metalness: 0.1,
  }), [])

  // White-tape grip — uses canvas texture
  const gripMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: gripTexture,
    color: '#ffffff',
    roughness: 0.55,
    metalness: 0.18,
  }), [gripTexture])

  const blackMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080808',
    roughness: 0.5,
    metalness: 0.5,
  }), [])

  return (
    <group rotation={[0.16, 0, 0]}>

      {/* HEAD FACE — dark gradient with circular holes */}
      <mesh geometry={faceGeo} position={[0, 1.0, -0.08]} castShadow receiveShadow>
        <primitive object={faceMat} attach="material" />
      </mesh>

      {/* MINT FRAME — luminous teal-green rim around face */}
      <mesh geometry={rimGeo} position={[0, 1.0, -0.10]} castShadow>
        <primitive object={mintMat} attach="material" />
      </mesh>

      {/* THROAT — Y-strut with twin triangular cutouts (mint) */}
      <mesh geometry={throatGeo} position={[0, 0.05, -0.06]} castShadow>
        <primitive object={mintMat} attach="material" />
      </mesh>

      {/* HANDLE CORE — black */}
      <mesh position={[0, -0.66, 0]} castShadow>
        <cylinderGeometry args={[0.118, 0.128, 0.86, 32]} />
        <primitive object={handleMat} attach="material" />
      </mesh>

      {/* GRIP WRAP — white X-tape sleeve over handle */}
      <mesh position={[0, -0.66, 0]} castShadow>
        <cylinderGeometry args={[0.132, 0.142, 0.84, 32]} />
        <primitive object={gripMat} attach="material" />
      </mesh>

      {/* Top mint collar (where grip meets throat) */}
      <mesh position={[0, -0.235, 0]}>
        <torusGeometry args={[0.144, 0.014, 12, 40]} />
        <primitive object={mintMat} attach="material" />
      </mesh>

      {/* Butt cap */}
      <mesh position={[0, -1.115, 0]}>
        <cylinderGeometry args={[0.150, 0.132, 0.05, 32]} />
        <primitive object={blackMat} attach="material" />
      </mesh>

      {/* Wrist strap loop — mint accent */}
      <mesh position={[0, -1.20, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.062, 0.012, 10, 28]} />
        <primitive object={mintMat} attach="material" />
      </mesh>

    </group>
  )
}

/* ─────────────────────────────────────────────
   V-PAIR — GSAP-animated cinematic entrance + idle loop
───────────────────────────────────────────── */
const SPLAY       = Math.PI / 6.4   // ≈ 28°  outward tilt
const PIVOT_LIFT  = 1.22             // shift racket up so butt sits at origin

function CrossedRackets({ mouseX, mouseY, inView }) {
  const root        = useRef()
  const racketAGrp  = useRef()       // outer rotation group (left racket)
  const racketBGrp  = useRef()       // outer rotation group (right racket)
  const limeLight   = useRef()
  const cyanLight   = useRef()
  const orangeLight = useRef()
  const tlRef       = useRef(null)

  /* Mouse-driven tilt on parent root (kept smooth, runs every frame) */
  useFrame(() => {
    const g = root.current
    if (!g) return
    const tx = (mouseY?.current ?? 0) * 0.22
    const ty = (mouseX?.current ?? 0) * 0.30
    g.rotation.x += (tx - g.rotation.x) * 0.06
    g.rotation.y += (ty - g.rotation.y) * 0.06
  })

  /* GSAP cinematic entrance + idle loop */
  useEffect(() => {
    if (!inView) return
    if (!racketAGrp.current || !racketBGrp.current) return

    const A    = racketAGrp.current
    const B    = racketBGrp.current
    const lime = limeLight.current
    const cyan = cyanLight.current
    const ora  = orangeLight.current

    /* INITIAL STATE — rackets begin small, far apart, vertical, lights dim */
    gsap.set(A.scale,    { x: 0.001, y: 0.001, z: 0.001 })
    gsap.set(B.scale,    { x: 0.001, y: 0.001, z: 0.001 })
    gsap.set(A.position, { x: -3.5, y: 1.5, z: 0.9 })
    gsap.set(B.position, { x:  3.5, y: 1.5, z: -0.9 })
    gsap.set(A.rotation, { x: 0.6, y: -1.2, z: 0 })
    gsap.set(B.rotation, { x: 0.6, y:  1.2, z: 0 })
    if (lime) gsap.set(lime, { intensity: 0 })
    if (cyan) gsap.set(cyan, { intensity: 0 })
    if (ora)  gsap.set(ora,  { intensity: 0 })

    /* MAIN TIMELINE */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    /* 1) Materialise — rackets pop into existence */
    tl.to([A.scale, B.scale], {
      x: 1, y: 1, z: 1,
      duration: 1.1,
      ease: 'back.out(1.6)',
      stagger: 0.08,
    }, 0)

    /* 2) Fly toward V vertex */
    tl.to(A.position, {
      x: -0.06, y: 0, z: 0.18,
      duration: 1.0, ease: 'power4.inOut',
    }, 0.15)
    tl.to(B.position, {
      x:  0.06, y: 0, z: -0.18,
      duration: 1.0, ease: 'power4.inOut',
    }, 0.15)

    /* 3) Spin into final orientation with elastic snap */
    tl.to(A.rotation, {
      x: 0, y: 0, z: SPLAY,
      duration: 1.2, ease: 'elastic.out(1, 0.55)',
    }, 0.4)
    tl.to(B.rotation, {
      x: 0, y: 0, z: -SPLAY,
      duration: 1.2, ease: 'elastic.out(1, 0.55)',
    }, 0.4)

    /* 4) Impact flash — light burst at moment rackets meet */
    tl.to([lime, cyan, ora], {
      intensity: (i) => [3.2, 2.0, 2.0][i],
      duration: 0.25,
      ease: 'power2.in',
    }, 1.05)

    /* 5) Settle — lights ease down to ambient levels */
    tl.to(lime, { intensity: 0.85, duration: 0.9, ease: 'power2.out' }, 1.3)
    tl.to(cyan, { intensity: 0.45, duration: 0.9, ease: 'power2.out' }, 1.3)
    tl.to(ora,  { intensity: 0.45, duration: 0.9, ease: 'power2.out' }, 1.3)

    /* 6) IDLE LOOP — start once entrance has finished */
    tl.add(() => {
      /* CONSTANT ROTATION — both rackets spin around their long axis
         continuously. Linear ease + repeat:-1 + relative '+=' = seamless. */
      gsap.to(A.rotation, {
        y: '+=' + (Math.PI * 2),
        duration: 9,
        ease: 'none',
        repeat: -1,
      })
      gsap.to(B.rotation, {
        y: '+=' + (Math.PI * 2),
        duration: 9,
        ease: 'none',
        repeat: -1,
      })

      /* V-splay breath — frame opens & closes ±6% */
      gsap.to(A.rotation, {
        z: SPLAY * 1.06,
        duration: 4.5,
        ease: 'sine.inOut',
        repeat: -1, yoyo: true,
      })
      gsap.to(B.rotation, {
        z: -SPLAY * 1.06,
        duration: 4.5,
        ease: 'sine.inOut',
        repeat: -1, yoyo: true,
      })

      /* Light pulses — three offset frequencies for organic shimmer */
      gsap.to(lime, { intensity: 1.5,  duration: 3.0, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to(cyan, { intensity: 0.95, duration: 3.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to(ora,  { intensity: 0.95, duration: 4.4, ease: 'sine.inOut', repeat: -1, yoyo: true })
    }, '+=0.05')

    tlRef.current = tl

    return () => {
      tl.kill()
      gsap.killTweensOf([A.rotation, B.rotation, A.position, B.position, A.scale, B.scale])
      if (lime) gsap.killTweensOf(lime)
      if (cyan) gsap.killTweensOf(cyan)
      if (ora)  gsap.killTweensOf(ora)
    }
  }, [inView])

  return (
    <Center>
      <Float speed={1.0} rotationIntensity={0.04} floatIntensity={0.28}>
        <group ref={root}>

          {/* ── LEFT RACKET ── */}
          <group ref={racketAGrp}>
            <group position={[0, PIVOT_LIFT, 0]}>
              <RacketModel />
            </group>
          </group>

          {/* ── RIGHT RACKET ── */}
          <group ref={racketBGrp}>
            <group position={[0, PIVOT_LIFT, 0]}>
              <RacketModel />
            </group>
          </group>

          {/* ── GLOW LIGHTS — cyan mist atmosphere (matches reference photo) ── */}
          <pointLight ref={limeLight}   position={[0,  -0.4, 0.6]} color="#86f3c8" intensity={0} distance={2.8} />
          <pointLight ref={cyanLight}   position={[-0.7, 0.8, 0.5]} color="#3fb8ff" intensity={0} distance={2.6} />
          <pointLight ref={orangeLight} position={[ 0.7, -0.4, 0.5]} color="#ff7a3d" intensity={0} distance={2.4} />
        </group>
      </Float>
    </Center>
  )
}

/* Custom UV generator that maps the front-face based on the head bounding box
   so the painted texture sits cleanly on the racket face */
function customUVGen(RX, RY) {
  const W = RX * 2, H = RY * 2
  return {
    generateTopUV(geometry, vertices, indexA, indexB, indexC) {
      const ax = vertices[indexA*3],     ay = vertices[indexA*3 + 1]
      const bx = vertices[indexB*3],     by = vertices[indexB*3 + 1]
      const cx = vertices[indexC*3],     cy = vertices[indexC*3 + 1]
      return [
        new THREE.Vector2((ax + RX) / W, (ay + RY) / H),
        new THREE.Vector2((bx + RX) / W, (by + RY) / H),
        new THREE.Vector2((cx + RX) / W, (cy + RY) / H),
      ]
    },
    generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD) {
      return [
        new THREE.Vector2(0, 0), new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 0), new THREE.Vector2(0, 0),
      ]
    },
  }
}

/* ─────────────────────────────────────────────
   SCENE
───────────────────────────────────────────── */
function Scene({ mouseX, mouseY, inView }) {
  return (
    <>
      <Environment preset="studio" environmentIntensity={0.7} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]}  intensity={1.4} color="#ffffff" castShadow />
      <directionalLight position={[-5, 2, -2]} intensity={0.8} color="#5ec8ff" />
      <directionalLight position={[3, -4, 2]} intensity={0.5} color="#ff8a4a" />

      {/* Cyan/mint sparkle mist matching reference photo's blue smoke */}
      <Sparkles count={36} scale={4.2} size={2.2} speed={0.3} opacity={0.7} color="#86f3c8" position={[0, 0.3, 0.5]} />
      <Sparkles count={28} scale={4.5} size={1.8} speed={0.25} opacity={0.55} color="#3fb8ff" position={[0, 0.5, 0.2]} />
      <Sparkles count={16} scale={3.5} size={1.4} speed={0.2}  opacity={0.45} color="#ff7a3d" position={[0.5, -0.3, 0.3]} />

      <CrossedRackets mouseX={mouseX} mouseY={mouseY} inView={inView} />

      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.45}
        scale={4}
        blur={2.2}
        far={2}
        color="#000000"
      />
    </>
  )
}

/* ─────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────── */
export default function PadelRacket3D() {
  const wrap   = useRef(null)
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      mouseX.current = ((e.clientX - r.left) / r.width  - 0.5) * 2
      mouseY.current = ((e.clientY - r.top)  / r.height - 0.5) * 2
    }
    const leave = () => { mouseX.current = 0; mouseY.current = 0 }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(el)

    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={wrap} style={wrapStyle}>
      <Canvas
        camera={{ position: [0, 0, 12.5], fov: 22 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        shadows={{ type: THREE.PCFShadowMap }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene mouseX={mouseX} mouseY={mouseY} inView={inView} />
      </Canvas>
    </div>
  )
}

const wrapStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  pointerEvents: 'auto',
}
