export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="h-8 w-56 bg-muted rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-xl">
            <div className="h-6 w-24 bg-muted rounded mb-4" />
            <div className="h-8 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="h-[300px] w-full bg-muted rounded" />
        </div>
        <div className="h-[300px] w-full bg-muted rounded" />
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="h-[260px] w-full bg-muted rounded" />
        <div className="h-[260px] w-full bg-muted rounded" />
      </div>
    </div>
  )
}


