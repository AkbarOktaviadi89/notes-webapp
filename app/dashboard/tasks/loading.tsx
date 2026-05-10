function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-paper-200 rounded-md animate-pulse ${className}`} />
}

export default function TasksLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-paper-300 px-6 py-5 bg-paper-50">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        {/* Filter tabs */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="paper-card-plain p-4 flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-1.5" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
