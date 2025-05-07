"use client"

import { useUser } from "@clerk/nextjs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

export function WelcomeBanner() {
  const { user, isLoaded } = useUser()

  const hour = new Date().getHours()
  let greeting = "Buenos días"
  
  if (hour >= 12 && hour < 18) {
    greeting = "Buenas tardes"
  } else if (hour >= 18 || hour < 5) {
    greeting = "Buenas noches"
  }

  const displayName = 
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || "Administrador"

  const fullUserId = isLoaded && user ? user.id : ""
  const truncatedUserId = fullUserId ? `${fullUserId.slice(0, 10)}...` : ""

  const copyUserId = () => {
    if (fullUserId) {
      navigator.clipboard.writeText(fullUserId)
      toast.success("ID de usuario copiado al portapapeles")
    }
  }

  return (
    <Card className="
      bg-gradient-to-br 
      from-[hsl(var(--background))] 
      to-[hsl(var(--muted))] 
      text-foreground 
      shadow-lg 
      overflow-hidden 
      transition-all duration-300
      border border-border/50
    ">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-grid-muted/[0.02] bg-[size:50px_50px] pointer-events-none"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2">
          <span>{greeting},</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium sm:text-base ">
              {isLoaded && user ? displayName : (
                <span className="w-[100px] animate-pulse bg-muted rounded h-6 inline-block" />
              )}
            </span>
            
            {isLoaded && user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-primary p-1.5"
                onClick={copyUserId}
                aria-label="Copiar ID de usuario"
                title="Copiar ID de usuario"
              >
                <span className="font-mono text-xs mr-1">{truncatedUserId}</span>
                <CopyIcon className="h-3 w-3" />
              </Button>
            )}
          </span>
        </CardTitle>

        <CardDescription className="text-muted-foreground mt-2 max-w-xl">
          Bienvenido al panel de administración de Concursos Ganaderos 📊
        </CardDescription>
      </CardHeader>

      {/* <CardContent className="relative z-10 space-y-4">
        <ul className="space-y-2 text-sm sm:text-sm">
          <li className="flex items-start">
            <span className="text-primary mr-2">✅</span>
            <span>Gestiona compañías, concursos y categorías desde un solo lugar.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">📅</span>
            <span>Organiza y programa eventos con fechas y horarios precisos.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">🐄</span>
            <span>Administra registros de ganado y sus categorías de competición.</span>
          </li>
        </ul>
      </CardContent> */}
    </Card>
  )
}