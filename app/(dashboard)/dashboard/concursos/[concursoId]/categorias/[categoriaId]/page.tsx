import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CategoriaConcursoForm } from "@/components/forms/categoria-concurso-form"
import { prisma } from "@/lib/prisma"

interface EditarCategoriaPageProps {
  params: {
    concursoId: string
    categoriaId: string
  }
}

export default async function EditarCategoriaPage({ params }: EditarCategoriaPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Verificar que el concurso existe
  const concurso = await prisma.concurso.findUnique({
    where: {
      id: params.concursoId,
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

  // Obtener la categoría
  const categoria = await prisma.concursoCategoria.findUnique({
    where: {
      id: params.categoriaId,
    },
  })

  if (!categoria || categoria.concursoId !== params.concursoId) {
    redirect(`/dashboard/concursos/${params.concursoId}/categorias`)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Editar Categoría - ${concurso.nombre}`}
        text="Actualiza la información de la categoría."
      />

      <CategoriaConcursoForm
        concursoId={params.concursoId}
        initialData={{
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || "",
          orden: categoria.orden,
          sexo: categoria.sexo,
          edadMinima: categoria.edadMinima,
          edadMaxima: categoria.edadMaxima,
        }}
      />
    </DashboardShell>
  )
}
