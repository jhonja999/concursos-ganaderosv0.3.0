import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConcursoForm } from "@/components/forms/concurso-form"
import { prisma } from "@/lib/prisma"

interface EditarConcursoPageProps {
  params: {
    slug: string
  }
}

export default async function EditarConcursoPage({ params }: EditarConcursoPageProps) {
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

  // Obtener todas las compañías para el selector
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Editar Concurso" text="Actualiza la información del concurso." />

      <ConcursoForm
        initialData={{
          nombre: concurso.nombre,
          slug: concurso.slug,
          descripcion: concurso.descripcion || "",
          fechaInicio: concurso.fechaInicio,
          fechaFin: concurso.fechaFin || undefined,
          companyId: concurso.companyId,
          isFeatured: concurso.isFeatured,
          isPublished: concurso.isPublished,
        }}
        concursoId={concurso.id}
        companies={companies}
      />
    </DashboardShell>
  )
}
