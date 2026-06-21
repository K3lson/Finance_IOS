'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )
    },
    { scope: sectionRef }
  )

  // Pulsing glow animation via GSAP
  useEffect(() => {
    if (!glowRef.current) return
    gsap.to(glowRef.current, {
      opacity: 0.6,
      scale: 1.15,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-40 px-6 overflow-hidden"
    >
      {/* pulsing radial glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, #6366f140 0%, #4f46e520 40%, transparent 70%)',
        }}
      />

      <div ref={contentRef} className="relative z-10 text-center max-w-3xl mx-auto opacity-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">
          Start today
        </p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
          Ready to take control?
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
          Join and start building the financial clarity you deserve. Track
          everything, owe less, save more.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/signup"
            className="px-10 py-4 bg-brand hover:bg-brand-dark text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-brand/25 text-lg"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 border border-surface-border hover:border-brand/50 text-text-secondary hover:text-text-primary font-semibold rounded-2xl transition-all duration-200 text-lg"
          >
            Sign in
          </Link>
        </div>

        <p className="text-sm text-text-muted">
          No credit card required. No ads. No nonsense.
        </p>
      </div>
    </section>
  )
}
