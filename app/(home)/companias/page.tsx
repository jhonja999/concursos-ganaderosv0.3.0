import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Building2, MapPin, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function CompaniasPage() {
  const companies = await prisma.company.findMany({
    where: {
      isPublished: true,
    },
    include: {
      _count: {
        select: {
          concursos: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        nombre: "asc",
      },
    ],
  })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compañías Ganaderas</h1>
        <p className="mt-2 text-muted-foreground">
          Descubre las compañías y asociaciones ganaderas que organizan concursos y eventos en el sector.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2">{company.nombre}</CardTitle>
                {company.isFeatured && <Badge>Destacada</Badge>}
              </div>
              <CardDescription className="flex items-center">
                {company.ubicacion && (
                  <>
                    <MapPin className="mr-1 h-3 w-3" />
                    {company.ubicacion}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-center">
                {company.logo ? (
                  <Image
                    src={company.logo || "/placeholder.svg"}
                    alt={company.nombre}
                    width={150}
                    height={150}
                    className="h-32 w-32 rounded-lg border object-contain"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-muted">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              {company.descripcion && (
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{company.descripcion}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0">
              <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                <span>
                  <Users className="mr-1 inline-block h-4 w-4" />
                  {company._count.concursos} concursos
                </span>
                <span>Desde {formatDate(company.createdAt)}</span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/companias/${company.slug}`}>Ver detalles</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {companies.length === 0 && (
          <div className="col-span-full rounded-lg border bg-card p-6 text-center">
            <h3 className="text-lg font-medium">No hay compañías publicadas</h3>
            <p className="mt-2 text-muted-foreground">
              Actualmente no hay compañías ganaderas publicadas en el sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
