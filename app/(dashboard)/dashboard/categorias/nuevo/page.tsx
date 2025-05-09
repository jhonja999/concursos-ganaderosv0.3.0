import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CategoriaNuevaForm } from "@/components/forms/categoria-nueva-form"
import { prisma } from "@/lib/prisma"

export default async function NuevaCategoriaPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Obtener todos los concursos para seleccionar a cuál asociar la categoría
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

  if (concursos.length === 0) {
    // Si no hay concursos, redirigir a la página de creación de concursos
    redirect("/dashboard/concursos/nuevo")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Nueva Categoría" text="Crea una nueva categoría y asóciala a un concurso." />
      <div className="grid gap-8">
        <CategoriaNuevaForm concursos={concursos} />
      </div>
    </DashboardShell>
  )
}
