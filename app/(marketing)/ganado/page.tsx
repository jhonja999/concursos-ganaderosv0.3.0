import Link from "next/link"
import Image from "next/image"
import { MilkIcon as Cow, Tag, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Ganado Disponible",
  description: "Explora todo el ganado disponible en nuestros concursos",
}

export default async function GanadoPage() {
  const ganado = await prisma.ganado.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
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
  })

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Ganado Disponible</h1>
        <p className="text-xl text-muted-foreground">Explora todo el ganado disponible</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <p className="text-sm text-muted-foreground">{ganado.length} resultados</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {ganado.map((animal) => (
          <Link key={animal.id} href={`/ganado/${animal.slug}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={
                    animal.GanadoImage.length > 0
                      ? animal.GanadoImage[0].image.url
                      : "/placeholder.svg?height=300&width=300"
                  }
                  alt={animal.nombre}
                  fill
                  className="object-cover"
                />
                {animal.isFeatured && (
                  <Badge className="absolute right-2 top-2 bg-yellow-500 text-white">Destacado</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold">{animal.nombre}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Cow className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{animal.raza || "Raza no especificada"}</p>
                  </div>
                  {animal.categoria && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{animal.categoria}</p>
                    </div>
                  )}
                  {(animal.criador || animal.propietario) && (
                    <p className="text-sm text-muted-foreground">
                      Propietario:{" "}
                      {animal.criador
                        ? `${animal.criador.nombre} ${animal.criador.apellido || ""}`
                        : animal.propietario}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {ganado.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-lg text-muted-foreground">No hay ganado disponible en este momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
