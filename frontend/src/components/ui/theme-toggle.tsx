import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"

import { Button } from "./button"
import { Dropdown } from "./dropdown"
import { useTheme } from "../../lib/theme"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="icon" className="h-9 w-9 relative border border-gray-200 dark:border-gray-700">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
      align="end"
      width={180}
    >
      <div className="p-2 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          Light
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setTheme("dark")}
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          Dark
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setTheme("system")}
        >
          <Laptop className="mr-2 h-4 w-4" />
          System
        </Button>
      </div>
    </Dropdown>
  )
} 