import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Tag, Plus, MilkIcon as Cow } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

interface ConcursoPageProps {
  params: {
    slug: string
  }
}

export default async function ConcursoPage({ params }: ConcursoPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Extraer el slug al inicio para evitar accesos asíncronos en JSX
  const concursoSlug = params.slug

  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: concursoSlug,
    },
    include: {
      company: true,
      _count: {
        select: {
          ganadoEnConcurso: true,
          categorias: true,
        },
      },
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

  // Obtener las categorías del concurso
  const categorias = await prisma.concursoCategoria.findMany({
    where: {
      concursoId: concurso.id,
    },
    orderBy: [
      {
        orden: "asc",
      },
      {
        nombre: "asc",
      },
    ],
    take: 5, // Solo mostrar las primeras 5 categorías
  })

  // Obtener el ganado del concurso con sus detalles
  const ganadoEnConcurso = await prisma.ganadoEnConcurso.findMany({
    where: {
      concursoId: concurso.id,
    },
    include: {
      ganado: {
        include: {
          criador: true,
          categoriaConcurso: true,
          GanadoImage: {
            include: {
              image: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      ganado: {
        nombre: "asc",
      },
    },
    take: 5, // Solo mostrar los primeros 5 ganados
  })

  return (
    <DashboardShell>
      <DashboardHeader heading={concurso.nombre} text="Gestiona los detalles del concurso.">
        <div className="flex gap-2">
          <Link href="/dashboard/concursos">
            <Button variant="outline">Volver a concursos</Button>
          </Link>
          <Link href={`/dashboard/concursos/${concursoSlug}/editar`}>
            <Button variant="outline">Editar concurso</Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Concurso</CardTitle>
            <CardDescription>Detalles generales del concurso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="font-medium">{concurso.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="font-medium">{concurso.slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compañía</p>
                <p className="font-medium">{concurso.company.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
                <p className="font-medium">{formatDate(concurso.fechaInicio)}</p>
              </div>
              {concurso.fechaFin && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de finalización</p>
                  <p className="font-medium">{formatDate(concurso.fechaFin)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="font-medium">{concurso.isPublished ? "Publicado" : "Borrador"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Destacado</p>
                <p className="font-medium">{concurso.isFeatured ? "Sí" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Resumen de participación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de ganado</p>
                <p className="text-2xl font-bold">{concurso._count.ganadoEnConcurso}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de categorías</p>
                <p className="text-2xl font-bold">{concurso._count.categorias}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categorías</CardTitle>
            <CardDescription>Categorías definidas para este concurso</CardDescription>
          </div>
          <Link href={`/dashboard/concursos/${concursoSlug}/categorias`}>
            <Button>
              <Tag className="mr-2 h-4 w-4" />
              Gestionar Categorías
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {categorias.length > 0 ? (
            <div className="space-y-4">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{categoria.nombre}</p>
                    {categoria.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{categoria.descripcion}</p>
                    )}
                  </div>
                  <Link href={`/dashboard/concursos/${concursoSlug}/categorias/${categoria.id}`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              ))}
              {concurso._count.categorias > 5 && (
                <div className="text-center">
                  <Link href={`/dashboard/concursos/${concursoSlug}/categorias`}>
                    <Button variant="link">Ver todas las categorías ({concurso._count.categorias})</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tag className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">No hay categorías</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Este concurso no tiene categorías definidas. Añade categorías para organizar el ganado.
              </p>
              <Link href={`/dashboard/concursos/${concursoSlug}/categorias/nueva`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Categoría
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ganado Participante</CardTitle>
            <CardDescription>Ganado registrado en este concurso</CardDescription>
          </div>
          <Link href={`/dashboard/ganado/nuevo?concursoId=${concurso.id}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Ganado
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {ganadoEnConcurso.length > 0 ? (
            <div className="space-y-4">
              {ganadoEnConcurso.map((participacion) => (
                <div key={participacion.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <img
                        src={
                          participacion.ganado.GanadoImage.length > 0
                            ? participacion.ganado.GanadoImage[0].image.url
                            : "/placeholder.svg?height=40&width=40"
                        }
                        alt={participacion.ganado.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{participacion.ganado.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {participacion.ganado.raza || "Sin raza"} -{" "}
                        {participacion.ganado.sexo === "MACHO" ? "Macho" : "Hembra"}
                        {participacion.ganado.categoriaConcurso &&
                          ` - ${participacion.ganado.categoriaConcurso.nombre}`}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/ganado/${participacion.ganado.slug}`}>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </Link>
                </div>
              ))}
              {concurso._count.ganadoEnConcurso > 5 && (
                <div className="text-center">
                  <Link href={`/dashboard/ganado/${concursoSlug}/gestion`}>
                    <Button variant="link">Ver todo el ganado ({concurso._count.ganadoEnConcurso})</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Cow className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">No hay ganado</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Este concurso no tiene ganado registrado. Añade ganado para comenzar.
              </p>
              <Link href={`/dashboard/ganado/nuevo?concursoId=${concurso.id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Ganado
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
