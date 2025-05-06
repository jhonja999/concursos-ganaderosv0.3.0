import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GanadoForm } from "@/components/forms/ganado-form"
import { prisma } from "@/lib/prisma"

export default async function NuevoGanadoPage() {
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

  return (
    <DashboardShell>
      <DashboardHeader heading="Nuevo Ganado" text="Registra un nuevo ganado para los concursos." />

      <GanadoForm concursos={concursos} />
    </DashboardShell>
  )
}
