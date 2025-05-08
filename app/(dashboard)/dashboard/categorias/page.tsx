import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoriasGeneralTable } from "@/components/tables/categorias-general-table"
import { prisma } from "@/lib/prisma"

interface CategoriasPageProps {
  searchParams: {
    search?: string
    concursoId?: string
  }
}

export default async function CategoriasPage({ searchParams }: CategoriasPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const search = searchParams.search || ""
  const concursoId = searchParams.concursoId || "all";

  // Obtener todos los concursos para el filtro
  const concursos = await prisma.concurso.findMany({
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  // Construir la consulta para las categorías
  let where = {}

  if (search) {
    where = {
      ...where,
      OR: [
        {
          nombre: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          descripcion: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }
  }

  if (concursoId && concursoId !== "all") {
    where = {
      ...where,
      concursoId,
    };
  }

  // Obtener las categorías
  const categorias = await prisma.concursoCategoria.findMany({
    where,
    orderBy: [
      {
        concurso: {
          nombre: "asc",
        },
      },
      {
        orden: "asc",
      },
      {
        nombre: "asc",
      },
    ],
    include: {
      concurso: {
        select: {
          nombre: true,
          slug: true,
        },
      },
      _count: {
        select: {
          ganado: true,
        },
      },
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Categorías" text="Gestiona todas las categorías de los concursos." />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar categorías..."
              className="pl-8"
              name="search"
              defaultValue={search}
            />
          </form>
          <Select name="concursoId" defaultValue={concursoId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por concurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los concursos</SelectItem>
              {concursos.map((concurso) => (
                <SelectItem key={concurso.id} value={concurso.id}>
                  {concurso.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" className="h-9">
            Filtrar
          </Button>
          {(search || concursoId) && (
            <Link href="/dashboard/categorias">
              <Button variant="ghost" size="sm" className="h-9">
                Limpiar
              </Button>
            </Link>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {categorias.length} categoría{categorias.length !== 1 ? "s" : ""} encontrada
          {categorias.length !== 1 ? "s" : ""}
        </div>
      </div>

      <CategoriasGeneralTable data={categorias} />
    </DashboardShell>
  )
}
