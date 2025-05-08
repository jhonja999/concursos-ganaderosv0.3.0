import Link from "next/link"
import { Building, Calendar, Tag, ArrowRight, MilkIcon as Cow } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function QuickActions() {
  const actions = [
    {
      title: "Nueva Compañía",
      description: "Registra una nueva compañía organizadora",
      href: "/dashboard/companias/nuevo",
      icon: Building,
      color: "bg-blue-500",
    },
    {
      title: "Nuevo Concurso",
      description: "Crea un nuevo concurso ganadero",
      href: "/dashboard/concursos/nuevo",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Nueva Categoría",
      description: "Añade una nueva categoría para el ganado",
      href: "/dashboard/categorias/nuevo",
      icon: Tag,
      color: "bg-purple-500",
    },
    {
      title: "Nuevo Ganado",
      description: "Registra un nuevo ganado para concursos",
      href: "/dashboard/ganado/nuevo",
      icon: Cow,
      color: "bg-orange-500",
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group h-full transition-colors hover:bg-accent/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 transform group-hover:translate-x-1" />
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
