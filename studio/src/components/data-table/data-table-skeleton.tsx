import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

// Helper component for skeleton cell with consistent height
const SkeletonCell = () => (
  <div className="flex items-center">
    <Skeleton className="h-4 w-full" />
  </div>
)

interface DataTableSkeletonProps {
  columns: number
  rows?: number
  enableRowSelection?: boolean
}

export function DataTableSkeleton({
  columns,
  rows = 10,
  enableRowSelection = false,
}: DataTableSkeletonProps) {
  // Adjust columns count based on row selection
  const columnCount = enableRowSelection ? columns + 1 : columns
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col overflow-hidden border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="border-b h-10">
                {enableRowSelection && (
                  <TableHead className="w-12 border">
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </TableHead>
                )}
                {Array.from({ length: columnCount }).map((_, i) => (
                  <TableHead key={i} className="border">
                    <Skeleton className="h-4 w-3/4" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className={rowIndex < rows - 1 ? "border-b h-10" : "border-b h-10"}>
                  {enableRowSelection && (
                    <TableCell className="w-12 border">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </TableCell>
                  )}
                  {Array.from({ length: columnCount }).map((_, cellIndex) => (
                    <TableCell 
                      key={cellIndex} 
                      className="border"
                    >
                      <SkeletonCell />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t bg-card h-12">
          <div className="flex items-center justify-between px-2 h-full">
            <div className="flex-1">
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-[70px]" />
              </div>
              <div className="flex w-[100px] items-center justify-center">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
