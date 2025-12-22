import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            {children || <p>The page you are looking for does not exist.</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="uppercase font-bold"
          >
            Go back
          </Button>
          <Button
            render={<Link to="/">Start Over</Link>}
            className="uppercase font-bold"
          ></Button>
        </CardFooter>
      </Card>
    </div>
  )
}
