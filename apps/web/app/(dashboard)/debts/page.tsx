import { getDebts } from '@/lib/data/debts'
import { DebtsPageClient } from './_components/DebtsPageClient'

export default async function DebtsPage() {
  const debts = await getDebts()
  return <DebtsPageClient initialDebts={debts} />
}
