export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="h-14 w-14 bg-muted rounded" />
        <div className="flex-1">
          <div className="h-6 w-64 bg-muted rounded mb-2" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 h-48 bg-muted rounded" />
        <div className="h-48 bg-muted rounded" />
      </div>
    </div>
  )
}


