import { getRecurringPayments } from '@/lib/data/recurring'
import { RecurringPageClient } from './_components/RecurringPageClient'

export default async function RecurringPage() {
  const payments = await getRecurringPayments()
  return <RecurringPageClient initialPayments={payments} />
}
