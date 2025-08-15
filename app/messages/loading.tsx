export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="h-6 w-28 bg-muted rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="h-10 w-full bg-muted rounded mb-3" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 w-full bg-muted rounded mb-2" />
          ))}
        </div>
        <div className="md:col-span-2">
          <div className="h-10 w-full bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 w-full bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


