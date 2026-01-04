// src/components/error/error-layout.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

type ErrorLayoutProps = {
  title: string
  description: string
  icon: ReactNode
  children?: ReactNode
  actions?: ReactNode
  variant?: 'default' | 'destructive'
}

export function ErrorLayout({
  title,
  description,
  icon,
  children,
  actions,
  variant = 'default',
}: ErrorLayoutProps) {
  const bgColor = variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
  const textColor = variant === 'destructive' ? 'text-destructive/20' : 'text-primary/20'
  
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-linear-to-r from-background to-muted/20 p-4">
      <div className="w-full max-w-2xl">
        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${bgColor}`} />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-secondary/20" />
          
          <CardHeader className="relative z-10 text-center pt-12">
            <div className={`text-9xl font-black mb-2 ${textColor}`}>
              {icon}
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {title}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {description}
            </p>
          </CardHeader>
          
          <CardContent className="relative z-10 text-center">
            <div className="text-muted-foreground">
              {children}
            </div>
          </CardContent>
          
          {actions && (
            <CardFooter className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 mt-6 pb-12 px-8">
              {actions}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}