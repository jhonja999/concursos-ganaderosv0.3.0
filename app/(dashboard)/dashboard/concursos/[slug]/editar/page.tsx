import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

import { ConcursoForm } from "@/components/forms/concurso-form"

interface ConcursoEditPageProps {
  params: {
    slug: string
  }
}

export default async function ConcursoEditPage({ params }: ConcursoEditPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  if (!params.slug) {
    redirect("/dashboard/concursos")
  }

  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.slug,
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Editar Concurso</h3>
        <p className="text-sm text-muted-foreground">Actualiza la información del concurso {concurso.nombre}</p>
      </div>
      <ConcursoForm
        companies={companies}
        initialData={{
          nombre: concurso.nombre,
          slug: concurso.slug,
          descripcion: concurso.descripcion || "",
          fechaInicio: concurso.fechaInicio,
          fechaFin: concurso.fechaFin || undefined,
          companyId: concurso.companyId,
          isFeatured: concurso.isFeatured,
          isPublished: concurso.isPublished,
        }}
        concursoId={concurso.id}
        slug={concurso.slug}
      />
    </div>
  )
}
