import { Skeleton } from '@/components/ui'

export default function DebtsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  )
}
