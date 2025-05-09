import Link from "next/link"
import { Calendar, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "Concursos Ganaderos",
  description: "Explora todos los concursos ganaderos disponibles",
}

export default async function ConcursosPage() {
  const concursos = await prisma.concurso.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        fechaInicio: "desc",
      },
    ],
    include: {
      company: true,
      ganadoEnConcurso: {
        select: {
          id: true,
        },
      },
    },
  })

  // Agrupar concursos por año
  const concursosPorAnio = concursos.reduce(
    (acc, concurso) => {
      const anio = new Date(concurso.fechaInicio).getFullYear()
      if (!acc[anio]) {
        acc[anio] = []
      }
      acc[anio].push(concurso)
      return acc
    },
    {} as Record<number, typeof concursos>,
  )

  // Ordenar años de más reciente a más antiguo
  const aniosOrdenados = Object.keys(concursosPorAnio)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Todos los Concursos</h1>
        <p className="text-xl text-muted-foreground">Explora todos los concursos ganaderos disponibles</p>
      </div>

      {aniosOrdenados.map((anio) => (
        <div key={anio} className="mb-10">
          <h2 className="mb-6 text-2xl font-bold">{anio}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {concursosPorAnio[anio].map((concurso) => (
              <Link key={concurso.id} href={`/concursos/${concurso.slug}`}>
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{formatDate(concurso.fechaInicio).split(" de ")[1]}</Badge>
                        {concurso.isFeatured && <Badge>Destacado</Badge>}
                      </div>
                      <h3 className="text-xl font-bold">{concurso.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(concurso.fechaInicio)}</span>
                        {concurso.fechaFin && (
                          <>
                            <span className="text-sm text-muted-foreground">-</span>
                            <span className="text-sm text-muted-foreground">{formatDate(concurso.fechaFin)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{concurso.company.nombre}</span>
                      </div>
                      {concurso.descripcion && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{concurso.descripcion}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {concurso.ganadoEnConcurso.length} participantes
                        </span>
                        <Button variant="ghost" size="sm" className="font-medium">
                          Ver concurso
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {concursos.length === 0 && (
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium">No hay concursos disponibles en este momento.</h3>
          <p className="text-muted-foreground">Vuelve más tarde para ver los próximos concursos.</p>        
        </div>
      )}
    </div>
  )
}
