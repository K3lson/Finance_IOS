'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const stats = [
  { value: 7, suffix: '', label: 'Features', sublabel: 'Fully built, ready to use' },
  { value: 100, suffix: '%', label: 'Private', sublabel: 'Your data stays yours' },
  { value: 0, suffix: '', label: 'Cost', sublabel: 'Free to use, always' },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])

  useGSAP(
    () => {
      counterRefs.current.forEach((el, i) => {
        if (!el) return
        const target = stats[i].value

        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              once: true,
            },
          }
        )
      })

      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="py-28 px-6 opacity-0"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-surface-border">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center px-8">
              <div className="flex items-end justify-center gap-1 mb-2">
                <span
                  ref={(el) => { counterRefs.current[i] = el }}
                  className="text-6xl font-black bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent tabular-nums"
                >
                  {stat.value === 0 ? '$' : stat.value}
                </span>
                <span className="text-3xl font-bold text-brand mb-1">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-xl font-semibold text-text-primary mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-text-muted">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
