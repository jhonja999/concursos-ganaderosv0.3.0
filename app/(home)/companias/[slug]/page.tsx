import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CompanyPageProps {
  params: {
    slug: string
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  if (!params.slug) {
    notFound()
  }

  const company = await prisma.company.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      concursos: {
        where: {
          isPublished: true,
        },
        orderBy: {
          fechaInicio: "desc",
        },
      },
    },
  })

  if (!company) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {company.logo ? (
            <Image
              src={company.logo || "/placeholder.svg"}
              alt={company.nombre}
              width={80}
              height={80}
              className="rounded-lg border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
              <UsersIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{company.nombre}</h1>
            <p className="text-muted-foreground">
              Desde {formatDate(company.createdAt)}
              {company.ubicacion && (
                <>
                  {" • "}
                  <MapPinIcon className="mb-0.5 inline h-4 w-4" /> {company.ubicacion}
                </>
              )}
            </p>
          </div>
        </div>
        {company.website && (
          <Button asChild>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              Visitar sitio web
            </a>
          </Button>
        )}
      </div>

      {company.descripcion && (
        <div className="mb-10 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Acerca de {company.nombre}</h2>
          <div className="prose max-w-none dark:prose-invert">
            <a>{company.descripcion}</a>
          </div>
        </div>
      )}

      <h2 className="mb-6 text-2xl font-bold">Concursos organizados</h2>

      {company.concursos.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center">
          <h3 className="text-lg font-medium">No hay concursos publicados</h3>
          <p className="mt-2 text-muted-foreground">
            Esta compañía aún no tiene concursos publicados o están en proceso de preparación.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {company.concursos.map((concurso) => (
            <Card key={concurso.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2">{concurso.nombre}</CardTitle>
                  {concurso.isFeatured && <Badge>Destacado</Badge>}
                </div>
                <CardDescription className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {formatDate(concurso.fechaInicio)}
                  {concurso.fechaFin && ` - ${formatDate(concurso.fechaFin)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {concurso.descripcion && (
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{concurso.descripcion}</p>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/concursos/${concurso.slug}`}>Ver detalles</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
