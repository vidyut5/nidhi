export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded mb-6" />
      <div className="h-10 w-full bg-muted rounded mb-4" />
      <div className="border rounded-xl">
        <div className="h-10 w-full bg-muted/60 rounded-t-xl" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}


