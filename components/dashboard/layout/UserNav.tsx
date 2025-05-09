"use client"

import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { MoonIcon, SunIcon, Home } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const { setTheme, theme } = useTheme()
  const { user } = useUser()

  const displayName = 
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || "Administrador"

  return (
    <div className="flex items-center gap-4">
      {/* Botón de cambio de tema */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="mr-2"
      >
        {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        <span className="sr-only">Cambiar tema</span>
      </Button>

      

      {/* Botón de usuario */}
      <div className="flex items-center gap-2">
        <UserButton afterSignOutUrl="/" />
        {/* Mostrar nombre solo en escritorio si se desea */}
        {/* <div className="hidden text-sm md:block">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">Panel de Control</p>          
        </div> */}
      </div>

      {/* Botón Home solo visible en escritorio */}
      <div className="hidden md:block">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-full">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
