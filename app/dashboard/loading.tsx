function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-paper-200 rounded-md animate-pulse ${className}`} />
}

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="paper-card-plain p-4">
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Recent notes */}
      <div className="mb-8">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="paper-card-plain p-4 flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-20 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
