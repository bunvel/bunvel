import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Laptop, Moon01Icon, Sun01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function ModeToggle() {
  const { setTheme } = useTheme()

  const { theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon">
            <HugeiconsIcon
              icon={Sun01Icon}
              className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'light' ? 'scale-100' : 'scale-0'}`}
            />
            <HugeiconsIcon
              icon={Moon01Icon}
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === 'dark' ? 'scale-100' : 'scale-0'}`}
            />
            <HugeiconsIcon
              icon={Laptop}
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === 'system' ? 'scale-100' : 'scale-0'}`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
        title="Theme Mode"
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <HugeiconsIcon icon={Sun01Icon} /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <HugeiconsIcon icon={Moon01Icon} /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <HugeiconsIcon icon={Laptop} /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
