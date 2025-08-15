export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="h-10 w-full bg-muted rounded mb-4" />
      <div className="flex gap-2 mb-6">
        <div className="h-9 w-40 bg-muted rounded" />
        <div className="h-9 w-40 bg-muted rounded" />
        <div className="h-9 w-40 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-4 border rounded-xl">
            <div className="aspect-square bg-muted rounded-lg mb-3" />
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded mb-4" />
            <div className="h-5 w-1/3 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}


