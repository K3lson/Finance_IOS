import { LandingNav } from './_landing/LandingNav'
import { HeroSection } from './_landing/HeroSection'
import { FeaturesSection } from './_landing/FeaturesSection'
import { HowItWorksSection } from './_landing/HowItWorksSection'
import { StatsSection } from './_landing/StatsSection'
import { CTASection } from './_landing/CTASection'

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0f] overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
    </main>
  )
}
