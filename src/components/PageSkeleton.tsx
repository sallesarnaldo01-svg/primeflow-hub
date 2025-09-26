import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  showHeader?: boolean;
  showCards?: boolean;
  cardsCount?: number;
  showTable?: boolean;
  tableRows?: number;
}

export function PageSkeleton({ 
  showHeader = true, 
  showCards = true, 
  cardsCount = 4,
  showTable = true,
  tableRows = 5
}: PageSkeletonProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Cards Grid */}
      {showCards && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cardsCount, 4)} gap-4`}>
          {Array.from({ length: cardsCount }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table/List */}
      {showTable && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: tableRows }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border rounded">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Specific skeleton components
export function DashboardSkeleton() {
  return <PageSkeleton showCards={true} cardsCount={4} showTable={true} tableRows={6} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return <PageSkeleton showHeader={false} showCards={false} showTable={true} tableRows={rows} />;
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return <PageSkeleton showHeader={false} showTable={false} showCards={true} cardsCount={count} />;
}