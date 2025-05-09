import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { CategoriasTable } from "@/components/tables/categorias-table"
import { prisma } from "@/lib/prisma"

interface CategoriasPageProps {
  params: {
    slug: string
  }
}

export default async function CategoriasPage({ params }: CategoriasPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.slug,
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

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
    include: {
      _count: {
        select: {
          ganado: true,
        },
      },
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading={`Categorías - ${concurso.nombre}`} text="Gestiona las categorías del concurso.">
        <div className="flex gap-2">
          <Link href={`/dashboard/concursos/${params.slug}`}>
            <Button variant="outline">Volver al concurso</Button>
          </Link>
          <Link href={`/dashboard/concursos/${params.slug}/categorias/nueva`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <CategoriasTable data={categorias} concursoSlug={params.slug} concursoId={concurso.id} />
    </DashboardShell>
  )
}
