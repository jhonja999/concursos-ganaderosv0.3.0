import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MilkIcon as Cow, Calendar, Tag, User, Award, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import { formatDate, calculateDaysFromBirth } from "@/lib/utils"

interface GanadoPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: GanadoPageProps) {
  const ganado = await prisma.ganado.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
  })

  if (!ganado) {
    return {
      title: "Ganado no encontrado",
      description: "El ganado que buscas no existe o no está disponible",
    }
  }

  return {
    title: ganado.nombre,
    description: ganado.descripcion || `Detalles de ${ganado.nombre}`,
  }
}

export default async function GanadoPage({ params }: GanadoPageProps) {
  const ganado = await prisma.ganado.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
    include: {
      ganadoEnConcurso: {
        include: {
          concurso: true,
        },
      },
      GanadoImage: {
        include: {
          image: true,
        },
        orderBy: {
          principal: "desc",
        },
      },
      criador: true,
    },
  })

  if (!ganado) {
    notFound()
  }

  const diasNacida = ganado.fechaNac ? calculateDaysFromBirth(ganado.fechaNac) : 0
  const edadAnios = Math.floor(diasNacida / 365)
  const edadMeses = Math.floor((diasNacida % 365) / 30)

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/ganado">
          <Button variant="outline" size="sm">
            ← Volver a Ganado
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={
                ganado.GanadoImage.length > 0
                  ? ganado.GanadoImage[0].image.url
                  : "/placeholder.svg?height=600&width=600"
              }
              alt={ganado.nombre}
              fill
              className="object-cover"
              priority
            />
          </div>

          {ganado.GanadoImage.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {ganado.GanadoImage.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border">
                  <Image src={img.image.url || "/placeholder.svg"} alt={ganado.nombre} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del ganado */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{ganado.nombre}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={ganado.sexo === "MACHO" ? "default" : "secondary"}>
                {ganado.sexo === "MACHO" ? "Macho" : "Hembra"}
              </Badge>
              {ganado.isFeatured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  <Award className="mr-1 h-3 w-3" /> Destacado
                </Badge>
              )}
              {ganado.remate && (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  Disponible para remate
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Cow className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Raza</p>
                <p className="font-medium">{ganado.raza || "No especificada"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Categoría</p>
                <p className="font-medium">
                  {ganado.categoria || "No especificada"}
                  {ganado.subcategoria && ` - ${ganado.subcategoria}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                <p className="font-medium">
                  {ganado.fechaNac ? formatDate(ganado.fechaNac) : "No especificada"}
                  {ganado.fechaNac && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      ({edadAnios > 0 ? `${edadAnios} años` : ""} {edadMeses > 0 ? `${edadMeses} meses` : ""})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Propietario</p>
                <p className="font-medium">
                  {ganado.criador
                    ? `${ganado.criador.nombre} ${ganado.criador.apellido || ""}`
                    : ganado.propietario || "No especificado"}
                </p>
              </div>
            </div>

            {ganado.establo && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-muted-foreground"
                >
                  <path d="M3 21V8l9-6 9 6v13" />
                  <path d="M9 21v-8h6v8" />
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">Establo</p>
                  <p className="font-medium">{ganado.establo}</p>
                </div>
              </div>
            )}

            {ganado.numRegistro && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-muted-foreground"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">Número de registro</p>
                  <p className="font-medium">{ganado.numRegistro}</p>
                </div>
              </div>
            )}

            {ganado.puntaje && (
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Puntaje</p>
                  <p className="font-medium">{ganado.puntaje} pts</p>
                </div>
              </div>
            )}
          </div>

          {ganado.descripcion && (
            <>
              <Separator />
              <div>
                <h2 className="mb-2 text-xl font-semibold">Descripción</h2>
                <p className="text-muted-foreground">{ganado.descripcion}</p>
              </div>
            </>
          )}

          {ganado.ganadoEnConcurso.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="mb-4 text-xl font-semibold">Concursos</h2>
                <div className="space-y-3">
                  {ganado.ganadoEnConcurso.map((participacion) => (
                    <Link key={participacion.id} href={`/concursos/${participacion.concurso.slug}`} className="block">
                      <Card className="transition-colors hover:bg-accent/50">
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{participacion.concurso.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(participacion.concurso.fechaInicio)}
                            </p>
                          </div>
                          {participacion.posicion && (
                            <Badge variant="secondary">Posición: {participacion.posicion}</Badge>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {ganado.premios && ganado.premios.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="mb-4 text-xl font-semibold">Premios</h2>
                <div className="flex flex-wrap gap-2">
                  {ganado.premios.map((premio, index) => (
                    <Badge key={index} variant="outline" className="border-yellow-500 text-yellow-500">
                      <Award className="mr-1 h-3 w-3" /> {premio}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
