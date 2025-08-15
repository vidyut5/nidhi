export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-4" />
      <div className="h-10 w-full bg-muted rounded mb-6" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-muted rounded-md" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-muted rounded mb-2" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


