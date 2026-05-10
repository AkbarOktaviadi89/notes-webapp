function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-paper-200 rounded-md animate-pulse ${className}`} />
}

export default function NoteLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-paper-300 bg-paper-50 px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Skeleton className="h-3 w-48 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
