// NuevoGanadoPage.tsx
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
  if (!userId) redirect("/sign-in")

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

  const defaultConcursoId = searchParams.concursoId

  const categoriasConcurso = defaultConcursoId
  ? await prisma.concursoCategoria.findMany({ // ✅ Correcto si el modelo es "ConcursoCategoria"
      where: { concursoId: defaultConcursoId },
    })
  : []

  return (
    <DashboardShell>
      <DashboardHeader heading="Nuevo Ganado" text="Crea un nuevo registro de ganado." />
      <GanadoForm
        concursos={concursos}
        defaultConcursoId={defaultConcursoId} />
    </DashboardShell>
  )
}