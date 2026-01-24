import { ModeToggle } from '@/components/theme/mode-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjectContext } from '@/contexts/project-context'
import { Image } from '@unpic/react'

export function SiteHeader() {
  const { project, isLoading, error } = useProjectContext()

  const getOrganizationName = () => {
    if (isLoading) return <Skeleton className="h-4 w-24" />
    if (error || !project)
      return <span className="text-destructive">Error</span>
    return project.organization.name
  }

  const getProjectName = () => {
    if (isLoading) return <Skeleton className="h-4 w-32" />
    if (error || !project)
      return <span className="text-destructive">Error</span>
    return project.name
  }

  return (
    <header className="bg-sidebar sticky top-0 z-50 flex w-full items-center border-b px-4">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2">
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <Image src="/logo.svg" alt="Logo" width={20} height={20} />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{getOrganizationName()}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getProjectName()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ModeToggle />
      </div>
    </header>
  )
}
