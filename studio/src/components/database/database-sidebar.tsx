import { Link, useMatches } from '@tanstack/react-router'
import { useCallback } from 'react'
import { Button } from '../ui/button'

const menuItems = [
  {
    id: 'tables',
    label: 'Tables',
    to: '/database/tables',
  },
  {
    id: 'indexes',
    label: 'Indexes',
    to: '/database/indexes',
  },
] as const

export function DatabaseSidebar() {
  const matches = useMatches()

  const isActive = useCallback(
    (to: string) => {
      return matches.some((match) => match.pathname.startsWith(to))
    },
    [matches],
  )

  return (
    <div className="flex flex-col h-full w-full gap-2 p-4">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={isActive(item.to) ? 'default' : 'ghost'}
          className="justify-start"
          render={<Link to={item.to}>{item.label}</Link>}
        ></Button>
      ))}
    </div>
  )
}
