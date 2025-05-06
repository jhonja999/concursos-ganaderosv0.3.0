import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { CompaniasTable } from "@/components/tables/companias-table"
import { prisma } from "@/lib/prisma"

export default async function CompaniasPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const companies = await prisma.company.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Compañías" text="Gestiona las compañías organizadoras de concursos.">
        <Link href="/dashboard/companias/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compañía
          </Button>
        </Link>
      </DashboardHeader>

      <CompaniasTable data={companies} />
    </DashboardShell>
  )
}
