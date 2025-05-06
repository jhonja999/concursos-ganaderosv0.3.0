"use client"

import { UserButton } from "@clerk/nextjs"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        <span className="sr-only">Cambiar tema</span>
      </Button>
      <UserButton afterSignOutUrl="/" />
    </div>
  )
}
