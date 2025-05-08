import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CategoriaConcursoForm } from "@/components/forms/categoria-concurso-form"
import { prisma } from "@/lib/prisma"

interface NuevaCategoriaPageProps {
  params: {
    concursoId: string
  }
}

export default async function NuevaCategoriaPage({ params }: NuevaCategoriaPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Verificar que el concurso existe
  const concurso = await prisma.concurso.findUnique({
    where: {
      id: params.concursoId,
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Nueva Categoría - ${concurso.nombre}`}
        text="Crea una nueva categoría para el concurso."
      />

      <CategoriaConcursoForm concursoId={params.concursoId} />
    </DashboardShell>
  )
}
