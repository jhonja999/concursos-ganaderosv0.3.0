import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { CategoriaConcursoForm } from "@/components/forms/categoria-concurso-form"

interface CategoriaPageProps {
  params: {
    slug: string
  }
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  if (!params.slug) {
    redirect("/dashboard/concursos")
  }

  // Obtener el concurso por slug
  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.slug,
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Nueva Categoría</h2>
      </div>
      <div className="grid gap-4">
        <CategoriaConcursoForm concursoId={concurso.id} concursoSlug={concurso.slug} />
      </div>
    </div>
  )
}
