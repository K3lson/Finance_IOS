'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const features = [
  {
    icon: '📊',
    title: 'Smart Budgeting',
    description:
      'Track income and expenses by category. See exactly where your money goes each month with animated breakdowns.',
    color: 'from-brand/20 to-transparent',
  },
  {
    icon: '🏦',
    title: 'Debt Payoff Planner',
    description:
      'Model avalanche vs snowball strategies. See how extra payments shorten your timeline and save you interest.',
    color: 'from-danger/20 to-transparent',
  },
  {
    icon: '🎯',
    title: 'Savings Goals',
    description:
      'Set targets, track contributions, and feel the satisfaction of watching your progress ring fill up.',
    color: 'from-success/20 to-transparent',
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
          },
        }
      )

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
            },
          }
        )
      }
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} className="py-32 px-6 max-w-6xl mx-auto">
      <div ref={headingRef} className="text-center mb-16 opacity-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
          Everything you need
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
          Built for your real financial life
        </h2>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Seven fully-built features that work together to give you a complete
          picture of your money.
        </p>
      </div>

      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative bg-surface-card border border-surface-border rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300 overflow-hidden opacity-0"
          >
            {/* gradient top accent */}
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${f.color}`}
            />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b opacity-40 ${f.color}" />

            <div className="relative z-10">
              <span className="text-4xl mb-5 block">{f.icon}</span>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {f.title}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                {f.description}
              </p>
              <Link
                href="/signup"
                className="text-sm text-brand hover:text-brand-light font-medium transition-colors"
              >
                Get started →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
