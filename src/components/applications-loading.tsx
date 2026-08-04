const Skeleton = ({ className }: { className: string }) => (
  <span
    aria-hidden="true"
    className={`block animate-pulse rounded-xs bg-neutral-100 motion-reduce:animate-none ${className}`}
  />
)

export const ApplicationsLoading = () => {
  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-205 px-5 pt-9.5 pb-20 md:px-7"
    >
      <h1 className="sr-only">Your applications</h1>
      <p role="status" className="sr-only">
        Loading your applications…
      </p>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div className="flex-1">
          <Skeleton className="mb-3 h-2.75 w-30" />
          <Skeleton className="mb-3 h-9 w-70 max-w-full" />
          <Skeleton className="h-4.25 w-105 max-w-full" />
        </div>
        <Skeleton className="h-11 w-47" />
      </div>

      <div className="mb-4.5 flex flex-wrap items-center gap-3.5">
        <Skeleton className="h-11 w-85 max-w-full" />
        <Skeleton className="ml-auto h-10 w-25" />
        <Skeleton className="h-10 w-75 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="rounded-lg border border-border bg-card p-5.5 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <Skeleton className="h-7 w-22" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="mb-2 h-5 w-55 max-w-full" />
            <Skeleton className="mb-5 h-3.5 w-40 max-w-full" />
            <div className="mb-4 flex gap-1.25">
              {Array.from({ length: 4 }, (_, segment) => (
                <Skeleton key={segment} className="h-1.25 flex-1" />
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-3.5 w-48 max-w-full" />
              <Skeleton className="h-3.5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
