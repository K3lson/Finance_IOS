'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP)

const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0a0a0f]" />,
})

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.4 })

      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          '-=0.1'
        )

      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'power1.inOut',
        delay: 1.5,
      })
    },
    { scope: containerRef }
  )

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.3
      setScrolled(past)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Scene3D />
      </div>

      {/* gradient vignette so text is readable over the 3D scene */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0f]/30 via-transparent to-[#0a0a0f]/80" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p
          ref={taglineRef}
          className="text-sm font-semibold uppercase tracking-widest text-brand-light mb-4 opacity-0"
        >
          Personal Finance, Reimagined
        </p>

        <h1
          ref={headingRef}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-text-primary leading-tight mb-6 opacity-0"
        >
          Your finances,{' '}
          <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
            beautifully tracked.
          </span>
        </h1>

        <p
          ref={subRef}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 opacity-0"
        >
          Take control of your money with premium budgeting, debt tracking, and
          savings goal tools built for real life — not spreadsheets.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0"
        >
          <Link
            href="/signup"
            className="px-8 py-4 bg-brand hover:bg-brand-dark text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-brand/20"
          >
            Get started — free
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 border border-surface-border hover:border-brand/50 text-text-secondary hover:text-text-primary font-semibold rounded-2xl transition-all duration-200"
          >
            See how it works
          </a>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-500 ${
          scrolled ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        <span className="text-xs text-text-muted uppercase tracking-widest">scroll</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-text-muted"
        >
          <path
            d="M10 4v12M4 10l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
