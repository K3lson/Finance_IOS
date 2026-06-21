import { getSavingsGoals } from '@/lib/data/goals'
import { GoalsPageClient } from './_components/GoalsPageClient'

export default async function GoalsPage() {
  const goals = await getSavingsGoals()
  return <GoalsPageClient initialGoals={goals} />
}
