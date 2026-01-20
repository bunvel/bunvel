import { Button } from '@/components/ui/button'
import { DESCRIPTIONS, TITLES } from '@/utils/constant'
import { ErrorComponent, Link } from '@tanstack/react-router'
import { ErrorLayout } from './error-layout'

export function DefaultCatchBoundary({ error }: { error: Error }) {
  return (
    <ErrorLayout
      title={TITLES.AN_ERROR_OCCURRED}
      description={DESCRIPTIONS.ERROR_OCCURRED}
      icon="!"
      variant="destructive"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold transition-all hover:shadow-md hover:bg-accent/50"
            size="lg"
          >
            Try Again
          </Button>
          <Button
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold transition-all hover:shadow-md hover:bg-primary/90"
            size="lg"
            render={
              <Link to="/" className="hover:no-underline">
                Back to Home →
              </Link>
            }
          ></Button>
        </>
      }
    >
      <ErrorComponent error={error} />
    </ErrorLayout>
  )
}
