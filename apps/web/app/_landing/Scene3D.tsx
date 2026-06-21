'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

function CentralSphere() {
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh>
        <sphereGeometry args={[1.4, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
        <MeshDistortMaterial
          color="#4f46e5"
          distort={0.4}
          speed={2}
          metalness={0.6}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  )
}

function OrbitalRings() {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.3
    if (ring2.current) ring2.current.rotation.x += delta * 0.2
    if (ring3.current) {
      ring3.current.rotation.z -= delta * 0.15
      ring3.current.rotation.y += delta * 0.1
    }
  })

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.018, 16, 100]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.8, 0.012, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 5, Math.PI / 4, Math.PI / 8]}>
        <torusGeometry args={[3.4, 0.009, 16, 100]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.15} />
      </mesh>
    </>
  )
}

function CameraRig() {
  const { camera } = useThree()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    gsap.to(camera.position, {
      z: 12,
      y: -2,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '30% top',
        scrub: 1.5,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [camera])

  return null
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      dpr={[1, 1.5]}
      className="absolute inset-0"
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 15, 30]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} color="#6366f1" intensity={3} />
      <pointLight position={[3, 2, 2]} color="#818cf8" intensity={1} />

      <CameraRig />
      <CentralSphere />
      <OrbitalRings />

      {!isMobile && (
        <Stars
          radius={50}
          depth={30}
          count={800}
          factor={3}
          fade
          speed={0.5}
        />
      )}
      {isMobile && (
        <Stars radius={30} depth={20} count={300} factor={2} fade speed={0.3} />
      )}
    </Canvas>
  )
}
