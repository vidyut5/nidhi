export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-pulse">
      <div className="h-6 w-40 bg-muted rounded mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 w-full bg-muted rounded" />
          <div className="h-80 w-full bg-muted rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-40 w-full bg-muted rounded" />
          <div className="h-56 w-full bg-muted rounded" />
          <div className="h-32 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}


