import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GanadoForm } from "@/components/forms/ganado-form"
import { prisma } from "@/lib/prisma"

interface NuevoGanadoPageProps {
  searchParams: {
    concursoId?: string
  }
}

export default async function NuevoGanadoPage({ searchParams }: NuevoGanadoPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Obtener concursos para el selector
  const concursos = await prisma.concurso.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  // Obtener el concurso predeterminado de los parámetros de búsqueda
  const defaultConcursoId = searchParams.concursoId

  return (
    <DashboardShell>
      <DashboardHeader heading="Nuevo Ganado" text="Crea un nuevo registro de ganado." />

      <GanadoForm concursos={concursos} defaultConcursoId={defaultConcursoId} />
    </DashboardShell>
  )
}
