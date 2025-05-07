import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ConcursosPorMes } from "@/components/dashboard/concursos-por-mes"
import { GanadoPorSexo } from "@/components/dashboard/ganado-por-sexo"
import { GanadoPorCategoria } from "@/components/dashboard/ganado-por-categoria"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { RecentConcursos } from "@/components/dashboard/recent-concursos"
import { TopCompanies } from "@/components/dashboard/top-companies"

import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const ganadoPorSexo = await prisma.ganado.groupBy({
    by: ["sexo"],
    _count: { id: true },
  })

  const totalAnimales = ganadoPorSexo.reduce((acc, curr) => acc + curr._count.id, 0)
  const porcentajePorSexo = ganadoPorSexo.map((item) => ({
    sexo: item.sexo,
    porcentaje: Math.round((item._count.id / totalAnimales) * 100),
  }))

  return (
    <DashboardShell>
      {/* <DashboardHeader
        heading=""
        text=""
      /> */}

      <WelcomeBanner />
      <QuickActions />

      <Tabs defaultValue="stats" className="space-y-4 mt-6">
        <TabsList>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="recent">Concursos Recientes</TabsTrigger>
          <TabsTrigger value="companies">Compañías Top</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <DashboardOverview />

          <div className="grid gap-4 md:grid-cols-2">
            <ConcursosPorMes />
            <GanadoPorSexo data={porcentajePorSexo} />
          </div>

          <GanadoPorCategoria />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <RecentConcursos />
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <TopCompanies />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}


