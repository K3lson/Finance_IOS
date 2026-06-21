'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const steps = [
  {
    number: '01',
    title: 'Set up your profile',
    description:
      'Add your income sources, household type, and monthly budget targets in minutes. No bank connection required.',
  },
  {
    number: '02',
    title: 'Track what matters',
    description:
      'Log expenses, debts, and savings goals. The app calculates your financial health score automatically from your data.',
  },
  {
    number: '03',
    title: 'Watch progress happen',
    description:
      'Monthly summaries, trend charts, and goal completion celebrations keep you motivated and in control.',
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      // Pin the section and reveal steps one-by-one as user scrolls
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 0.8,
        },
      })

      // Step 1 starts visible
      tl.set(stepsRef.current[0], { opacity: 1, y: 0 })

      // Fade in step 2, dim step 1
      tl.to(stepsRef.current[0], { opacity: 0.25, duration: 0.3 }, 0.3)
      tl.fromTo(
        stepsRef.current[1],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.3
      )

      // Fade in step 3, dim step 2
      tl.to(stepsRef.current[1], { opacity: 0.25, duration: 0.3 }, 0.7)
      tl.fromTo(
        stepsRef.current[2],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4 },
        0.7
      )
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative h-screen flex items-center overflow-hidden bg-[#0a0a0f]"
    >
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: heading */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
              How it works
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
              From zero to clarity in three steps.
            </h2>
          </div>

          {/* Right: steps */}
          <div className="relative space-y-10">
            {steps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => { stepsRef.current[i] = el }}
                className={`flex gap-6 ${i === 0 ? 'opacity-100' : 'opacity-0'}`}
              >
                <span
                  className="text-7xl font-black leading-none select-none shrink-0"
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '1px #6366f1',
                    opacity: 0.4,
                  }}
                >
                  {step.number}
                </span>
                <div className="pt-2">
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
