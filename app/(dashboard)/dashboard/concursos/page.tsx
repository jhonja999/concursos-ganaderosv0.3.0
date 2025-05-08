import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { ConcursosTable } from "@/components/tables/concursos-table"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/prisma"

interface ConcursosPageProps {
  searchParams: {
    search?: string
  }
}

export default async function ConcursosPage({ searchParams }: ConcursosPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const search = searchParams.search || ""

  const concursos = await prisma.concurso.findMany({
    where: {
      OR: [
        {
          nombre: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          slug: {
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
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      company: {
        select: {
          nombre: true,
        },
      },
      _count: {
        select: {
          ganadoEnConcurso: true,
          categorias: true,
        },
      },
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Concursos" text="Gestiona los concursos ganaderos.">
        <Link href="/dashboard/concursos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Concurso
          </Button>
        </Link>
      </DashboardHeader>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <form className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar concursos..."
              className="pl-8"
              name="search"
              defaultValue={search}
            />
          </form>
          <Button type="submit" size="sm" className="h-9">
            Buscar
          </Button>
          {search && (
            <Link href="/dashboard/concursos">
              <Button variant="ghost" size="sm" className="h-9">
                Limpiar
              </Button>
            </Link>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {concursos.length} concurso{concursos.length !== 1 ? "s" : ""} encontrado{concursos.length !== 1 ? "s" : ""}
        </div>
      </div>

      <ConcursosTable data={concursos} />
    </DashboardShell>
  )
}
