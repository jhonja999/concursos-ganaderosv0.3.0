import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConcursoForm } from "@/components/forms/concurso-form"
import { prisma } from "@/lib/prisma"

export default async function NuevoConcursoPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
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
      <DashboardHeader heading="Nuevo Concurso" text="Crea un nuevo concurso ganadero." />

      <ConcursoForm companies={companies} />
    </DashboardShell>
  )
}
