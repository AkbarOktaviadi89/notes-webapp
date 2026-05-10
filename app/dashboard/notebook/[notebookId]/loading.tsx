function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-paper-200 rounded-md animate-pulse ${className}`} />
}

export default function NotebookLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-paper-300 px-6 py-5 bg-paper-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div>
              <Skeleton className="h-7 w-48 mb-1.5" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <Skeleton className="h-9 w-full mt-4 rounded-md" />
      </div>

      {/* Notes grid */}
      <div className="flex-1 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="paper-card-plain p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1.5" />
              <Skeleton className="h-3 w-5/6 mb-1.5" />
              <Skeleton className="h-3 w-4/6 mb-4" />
              <div className="border-t border-paper-200 pt-3">
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
