import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ConcursosPorMes } from "@/components/dashboard/concursos-por-mes"
import { GanadoPorSexo } from "@/components/dashboard/ganado-por-sexo"
import { GanadoPorCategoria } from "@/components/dashboard/ganado-por-categoria"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Obtener estadísticas
  const totalConcursos = await prisma.concurso.count()
  const totalCompanias = await prisma.company.count()
  const totalGanado = await prisma.ganado.count()

  // Obtener distribución de ganado por sexo
  const ganadoPorSexo = await prisma.ganado.groupBy({
    by: ["sexo"],
    _count: {
      id: true,
    },
  })

  // Calcular porcentajes
  const totalAnimales = ganadoPorSexo.reduce((acc, curr) => acc + curr._count.id, 0)
  const porcentajePorSexo = ganadoPorSexo.map((item) => ({
    sexo: item.sexo,
    porcentaje: Math.round((item._count.id / totalAnimales) * 100),
  }))

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Panel de Administración"
        text="Bienvenido al panel de administración de Concursos Ganaderos"
      />

      <QuickActions />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats title="Total Concursos" value={totalConcursos} description="Concursos activos" />
        <DashboardStats title="Total Compañías" value={totalCompanias} description="Compañías registradas" />
        <DashboardStats title="Total Ganado" value={totalGanado} description="Ganado registrado" />
        <DashboardStats title="Participantes" value={0} description="Inscritos en concursos" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConcursosPorMes />
        <GanadoPorSexo data={porcentajePorSexo} />
      </div>

      <GanadoPorCategoria />
    </DashboardShell>
  )
}
