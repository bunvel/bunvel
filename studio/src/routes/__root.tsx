import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { DefaultCatchBoundary } from '@/components/error/DefaultCatchBoundary'
import { NotFound } from '@/components/error/NotFound'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Bunvel',
        description: 'Bunvel - True BaaS Platform for Modern Applications',
      },
      {
        property: 'og:title',
        content: 'Bunvel - True BaaS Platform',
      },
      {
        property: 'og:description',
        content: 'Bunvel - True BaaS Platform for Modern Applications',
      },
      {
        property: 'og:image',
        content: '/og-image.png',
      },
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        property: 'twitter:image',
        content: '/og-image.png',
      },
      {
        property: 'twitter:title',
        content: 'Bunvel - True BaaS Platform',
      },
      {
        property: 'twitter:description',
        content: 'Bunvel - True BaaS Platform for Modern Applications',
      },
      {
        property: 'twitter:site',
        content: '@bunvel',
      },
      {
        property: 'twitter:creator',
        content: '@bunvel',
      },
      {
        property: 'twitter:domain',
        content: 'bunvel.com',
      },
      {
        property: 'og:site_name',
        content: 'Bunvel - True BaaS Platform',
      },
      {
        property: 'og:url',
        content: 'https://bunvel.com',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:locale',
        content: 'en_US',
      },
      {
        property: 'og:locale:alternate',
        content: 'es_ES, fr_FR',
      },
      {
        property: 'article:author',
        content: 'Bunvel Team',
      },
      {
        property: 'article:published_time',
        content: new Date().toISOString(),
      },
      {
        property: 'article:modified_time',
        content: new Date().toISOString(),
      },
      {
        property: 'article:section',
        content: 'Technology',
      },
      {
        property: 'article:tag',
        content:
          'BaaS, Backend, Cloud, Technology, Startup, SaaS, Software, Development, Innovation, Tech, Startup Life, Software Development, Digital Transformation, Cloud Computing, API Development, Backend Services, Software Engineering, Application Development, Cloud Services, API Management, Software as a Service, Cloud Native, Microservices, API First, Developer Experience, Developer Tools, SaaS Platform, Cloud Infrastructure, Backend as a Service, Modern Applications, Digital Innovation, Tech Startup, Software Company, Cloud Solutions, API Gateway, Microservices Architecture, Cloud Native Applications, Developer Platform, SaaS Development, Cloud Computing Services, Backend Development, API Management Platform, Software Development Platform, Cloud Native Computing, Developer Experience Platform, SaaS Infrastructure, Cloud Application Platform, Backend Services Platform, API Development Platform, Software Engineering Platform',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

const queryClient = new QueryClient()

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
          <Toaster />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
