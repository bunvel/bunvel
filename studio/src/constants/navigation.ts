import {
  Database,
  Home01Icon,
  SqlIcon,
  TableIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

export interface MenuItem {
  title: string
  to: string
  activeOptions?: { exact?: boolean }
}

export interface MenuItemWithIcon extends MenuItem {
  icon: IconSvgElement
}

export const NAV_MAIN_ITEMS: Array<MenuItemWithIcon> = [
  {
    title: 'Dashboard',
    to: '/',
    icon: Home01Icon,
  },
  {
    title: 'SQL Editor',
    to: '/sql',
    icon: SqlIcon,
  },
  {
    title: 'Table Editor',
    to: '/editor',
    icon: TableIcon,
  },
  {
    title: 'Database',
    to: '/database/schemas',
    icon: Database,
  },
]

export const DATABASE_MENU_ITEMS: Array<MenuItem> = [
  {
    title: 'Schema Diagram',
    to: '/database/schemas',
  },
  {
    title: 'Tables',
    to: '/database/tables',
  },
  {
    title: 'Indexes',
    to: '/database/indexes',
  },
  {
    title: 'Functions',
    to: '/database/functions',
  },
  {
    title: 'Triggers',
    to: '/database/triggers',
  },
  {
    title: 'Enumerated Types',
    to: '/database/types',
  },
]
