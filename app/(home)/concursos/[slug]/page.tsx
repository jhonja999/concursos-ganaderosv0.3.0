import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Building, MilkIcon as Cow, Tag, User, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

interface ConcursoPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ConcursoPageProps) {
  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
    include: {
      company: true,
    },
  })

  if (!concurso) {
    return {
      title: "Concurso no encontrado",
      description: "El concurso que buscas no existe o no está disponible",
    }
  }

  return {
    title: concurso.nombre,
    description: concurso.descripcion || `Concurso organizado por ${concurso.company.nombre}`,
  }
}

export default async function ConcursoPage({ params }: ConcursoPageProps) {
  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
    include: {
      company: true,
      ganadoEnConcurso: {
        include: {
          ganado: {
            include: {
              GanadoImage: {
                include: {
                  image: true,
                },
                where: {
                  principal: true,
                },
                take: 1,
              },
              criador: true,
            },
          },
        },
        orderBy: {
          posicion: "asc",
        },
      },
    },
  })

  if (!concurso) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/concursos">
          <Button variant="outline" size="sm">
            ← Volver a Concursos
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{concurso.nombre}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{formatDate(concurso.fechaInicio)}</span>
                  {concurso.fechaFin && (
                    <>
                      <span>-</span>
                      <span>{formatDate(concurso.fechaFin)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span>{concurso.company.nombre}</span>
                </div>
              </div>
            </div>

            <Separator />

            {concurso.descripcion && (
              <div>
                <h2 className="mb-2 text-xl font-semibold">Descripción</h2>
                <p className="text-muted-foreground">{concurso.descripcion}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ganado Participante</h2>
              <Link href={`/concursos/${params.slug}/tablas`}>
                <Button variant="outline" size="sm">
                  <Table className="mr-2 h-4 w-4" /> Ver tablas completas
                </Button>
              </Link>
            </div>

            <div>
              {concurso.ganadoEnConcurso.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {concurso.ganadoEnConcurso.map((participacion) => (
                    <Link key={participacion.id} href={`/ganado/${participacion.ganado.slug}`}>
                      <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                        <div className="relative aspect-video">
                          <Image
                            src={
                              participacion.ganado.GanadoImage.length > 0
                                ? participacion.ganado.GanadoImage[0].image.url
                                : "/placeholder.svg?height=200&width=300"
                            }
                            alt={participacion.ganado.nombre}
                            fill
                            className="object-cover"
                          />
                          {participacion.posicion && (
                            <Badge className="absolute left-2 top-2">Posición: {participacion.posicion}</Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold">{participacion.ganado.nombre}</h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <Cow className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {participacion.ganado.raza || "Raza no especificada"}
                              </p>
                            </div>
                            {participacion.ganado.categoria && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">{participacion.ganado.categoria}</p>
                              </div>
                            )}
                            {(participacion.ganado.criador || participacion.ganado.propietario) && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {participacion.ganado.criador
                                    ? `${participacion.ganado.criador.nombre} ${
                                        participacion.ganado.criador.apellido || ""
                                      }`
                                    : participacion.ganado.propietario}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay ganado registrado en este concurso.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">Información del Concurso</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organizado por</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                  <p className="font-medium">{concurso.ganadoEnConcurso.length}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <Link href={`/concursos/${params.slug}/tablas`}>
                  <Button className="w-full">
                    <Table className="mr-2 h-4 w-4" /> Ver tablas completas
                  </Button>
                </Link>
                <Link href={`/dashboard/concursos/${concurso.id}`}>
                  <Button variant="outline" className="w-full">
                    Inscribir Ganado
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
