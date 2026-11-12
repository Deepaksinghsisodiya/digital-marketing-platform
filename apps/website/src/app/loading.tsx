import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-6xl mx-auto space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between py-4 border-b border-slate-900">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <div className="hidden md:flex gap-4">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>

      {/* Hero Skeleton */}
      <div className="py-16 text-center space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-6 w-32 rounded-full mx-auto" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4 rounded-xl mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
