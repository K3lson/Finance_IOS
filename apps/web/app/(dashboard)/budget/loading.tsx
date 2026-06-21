import { Skeleton, Card } from '@/components/ui'

export default function BudgetLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <Card key={i}>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton lines={3} />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton lines={4} />
        </Card>
      </div>

      <Card>
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-[260px] w-full" />
      </Card>
    </div>
  )
}
