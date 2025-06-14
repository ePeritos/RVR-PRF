import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-8 w-32" />
    </div>

    <div className="text-center mb-8 space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
      <Skeleton className="h-4 w-80 mx-auto" />
    </div>

    <Card className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96 w-full" />
      </CardContent>
    </Card>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-full" />
    </CardHeader>
    <CardContent className="p-0">
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const FilterSkeleton = () => (
  <Card className="p-6 w-full">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="flex justify-end mt-4">
      <Skeleton className="h-10 w-24" />
    </div>
  </Card>
);