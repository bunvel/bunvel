import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ErrorLayout } from './error-layout'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <ErrorLayout
      title="Oops! Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      icon="404"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold transition-all hover:shadow-md hover:bg-accent/50"
            size="lg"
          >
            ← Go Back
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
      {children || (
        <p className="max-w-md mx-auto">
          Don't worry, you can find your way back home or go back to the
          previous page.
        </p>
      )}
    </ErrorLayout>
  )
}
