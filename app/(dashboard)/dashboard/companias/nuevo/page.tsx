import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CompaniaForm } from "@/components/forms/compania-form"

export default async function NuevaCompaniaPage() {
  const { userId } =  await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Nueva Compañía" text="Crea una nueva compañía organizadora de concursos." />

      <CompaniaForm />
    </DashboardShell>
  )
}
