import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CompaniaForm } from "@/components/forms/compania-form"
import { prisma } from "@/lib/prisma"

interface CompanyPageProps {
  params: {
    companyId: string
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const company = await prisma.company.findUnique({
    where: {
      id: params.companyId,
    },
  })

  if (!company) {
    redirect("/dashboard/companias")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Editar Compañía" text="Actualiza la información de la compañía." />

      <CompaniaForm
        initialData={{
          nombre: company.nombre,
          slug: company.slug,
          descripcion: company.descripcion || "",
          logo: company.logo || "",
          isFeatured: company.isFeatured,
          isPublished: company.isPublished,
        }}
        companyId={params.companyId}
      />
    </DashboardShell>
  )
}
