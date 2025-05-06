import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TablaConcurso } from "@/components/concursos/tabla-concurso"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

interface TablasPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TablasPageProps) {
  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
  })

  if (!concurso) {
    return {
      title: "Tablas no encontradas",
      description: "Las tablas que buscas no existen o no están disponibles",
    }
  }

  return {
    title: `Tablas - ${concurso.nombre}`,
    description: `Tablas de resultados del concurso ${concurso.nombre}`,
  }
}

export default async function TablasPage({ params }: TablasPageProps) {
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
      },
    },
  })

  if (!concurso) {
    notFound()
  }

  // Agrupar ganado por categoría
  const ganadoPorCategoria = concurso.ganadoEnConcurso.reduce(
    (acc, item) => {
      const categoria = item.ganado.categoria || "Sin categoría"
      if (!acc[categoria]) {
        acc[categoria] = []
      }
      acc[categoria].push(item)
      return acc
    },
    {} as Record<string, typeof concurso.ganadoEnConcurso>,
  )

  // Agrupar ganado por sexo
  const ganadoPorSexo = {
    MACHO: concurso.ganadoEnConcurso.filter((item) => item.ganado.sexo === "MACHO"),
    HEMBRA: concurso.ganadoEnConcurso.filter((item) => item.ganado.sexo === "HEMBRA"),
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/concursos/${params.slug}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al concurso
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{concurso.nombre}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <p className="text-muted-foreground">{formatDate(concurso.fechaInicio)}</p>
          <Badge variant="outline">{concurso.company.nombre}</Badge>
          <Badge>{concurso.ganadoEnConcurso.length} participantes</Badge>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="machos">Machos</TabsTrigger>
          <TabsTrigger value="hembras">Hembras</TabsTrigger>
          <TabsTrigger value="categorias">Por Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos los participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <TablaConcurso participantes={concurso.ganadoEnConcurso} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="machos">
          <Card>
            <CardHeader>
              <CardTitle>Machos</CardTitle>
            </CardHeader>
            <CardContent>
              <TablaConcurso participantes={ganadoPorSexo.MACHO} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hembras">
          <Card>
            <CardHeader>
              <CardTitle>Hembras</CardTitle>
            </CardHeader>
            <CardContent>
              <TablaConcurso participantes={ganadoPorSexo.HEMBRA} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <div className="space-y-8">
            {Object.entries(ganadoPorCategoria).map(([categoria, participantes]) => (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle>{categoria}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TablaConcurso participantes={participantes} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
