export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-pulse">
      <div className="h-6 w-24 bg-muted rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-9 w-20 bg-muted rounded" />
        <div className="h-9 w-24 bg-muted rounded" />
        <div className="h-9 w-24 bg-muted rounded" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-40 bg-muted rounded" />
              </div>
              <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="space-y-2">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-md" />
                    <div className="h-3 w-40 bg-muted rounded" />
                  </div>
                  <div className="h-3 w-10 bg-muted rounded" />
                </div>
              ))}
              <div className="pt-2 border-t flex items-center justify-between">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-14 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


