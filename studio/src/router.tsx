import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { DefaultCatchBoundary } from './components/error/DefaultCatchBoundary'
import { NotFound } from './components/error/NotFound'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}
