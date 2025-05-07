import { CalendarDays, ListChecks, Store, Award } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { prisma } from "@/lib/prisma"

export async function DashboardOverview() {
  // Fetch summary data
  const concursosCount = await prisma.concurso.count()
  const companiesCount = await prisma.company.count()
  const ganadoCount = await prisma.ganado.count()

  // Contar ganado por sexo
  const machos = await prisma.ganado.count({
    where: {
      sexo: "MACHO",
    },
  })

  const hembras = await prisma.ganado.count({
    where: {
      sexo: "HEMBRA",
    },
  })

  // Calcular porcentajes
  const machosPct = ganadoCount > 0 ? Math.round((machos / ganadoCount) * 100) : 0
  const hembrasPct = ganadoCount > 0 ? Math.round((hembras / ganadoCount) * 100) : 0

  // Contar concursos activos (con fecha de inicio posterior a hoy)
  const concursosActivos = await prisma.concurso.count({
    where: {
      fechaInicio: {
        gte: new Date(),
      },
      isPublished: true,
    },
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Concursos"
        value={concursosCount}
        description={`${concursosActivos} concursos activos`}
        icon={<CalendarDays className="h-4 w-4" />}
      />

      <StatsCard
        title="Total Compañías"
        value={companiesCount}
        description="Compañías registradas"
        icon={<Store className="h-4 w-4" />}
      />

      <StatsCard
        title="Total Ganado"
        value={ganadoCount}
        description={`${machosPct}% machos, ${hembrasPct}% hembras`}
        icon={<ListChecks className="h-4 w-4" />}
      />

      <StatsCard
        title="Participantes"
        value={await prisma.ganadoEnConcurso.count()}
        description="Inscripciones en concursos"
        icon={<Award className="h-4 w-4" />}
      />
    </div>
  )
}

