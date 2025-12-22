import type { ErrorComponentProps } from '@tanstack/react-router'
import {
    ErrorComponent,
    rootRouteId,
    useMatch,
    useRouter,
} from '@tanstack/react-router'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            An Error Occurred
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorComponent error={error} />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              router.invalidate()
            }}
            className="uppercase font-bold"
          >
            Try Again
          </Button>
          {isRoot ? (
            <Button
              onClick={() => router.navigate({ to: '/' })}
              className="uppercase font-bold"
            >
              Home
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
              className="uppercase font-bold"
            >
              Go Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
