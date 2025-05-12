import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GanadoForm } from "@/components/forms/ganado-form"
import { prisma } from "@/lib/prisma"
import { ConcursoCategoria, GanadoFormData } from "@/types/ganado"

interface GanadoPageProps {
  params: {
    slug: string
  }
}

export default async function GanadoEditarPage({ params }: GanadoPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Extraer el slug para evitar errores de parámetros dinámicos
  const ganadoSlug = params.slug

  // Obtener el ganado por su slug
  const ganado = await prisma.ganado.findUnique({
    where: {
      slug: ganadoSlug,
    },
    include: {
      criador: true,
      GanadoImage: {
        include: {
          image: true,
        },
      },
      ganadoEnConcurso: {
        include: {
          concurso: true,
        },
      },
      categoriaConcurso: true, // Incluir la relación con ConcursoCategoria
    },
  })

  if (!ganado) {
    notFound()
  }

  // Obtener concursos para el selector con sus slugs
  const concursos = await prisma.concurso.findMany({
    select: {
      id: true,
      nombre: true,
      slug: true, // Incluir el slug para evitar consultas adicionales
    },
    orderBy: {
      nombre: "asc",
    },
  })

  // Obtener el concurso actual si existe
  const concursoActual = ganado.ganadoEnConcurso.length > 0 ? ganado.ganadoEnConcurso[0].concurso : null

  // Preparar los datos iniciales para el formulario
  const initialData: Partial<GanadoFormData> = {
    nombre: ganado.nombre,
    slug: ganado.slug,
    numRegistro: ganado.numRegistro || "",
    fechaNac: ganado.fechaNac || undefined,
    diasNacida: undefined, // Calculado en el cliente
    sexo: ganado.sexo,
    raza: ganado.raza || "",
    establo: ganado.establo || "",
    propietario: ganado.propietario || "",
    criadorId: ganado.criadorId || "",
    categoria: ganado.categoria || "",
    subcategoria: ganado.subcategoria || "",
    categoriaConcursoId: ganado.categoriaConcursoId || "",
    remate: ganado.remate || false,
    puntaje: ganado.puntaje || undefined,
    descripcion: ganado.descripcion || "",
    concursoId: concursoActual?.id || "",
    isFeatured: ganado.isFeatured,
    isPublished: ganado.isPublished,
  }

  // Si hay un concurso actual, obtener sus categorías
  let categoriasConcurso: ConcursoCategoria[] = []
  if (concursoActual) {
    // Corregido - Usamos concursoCategoria (el nombre del modelo en Prisma)
    categoriasConcurso = await prisma.concursoCategoria.findMany({
      where: {
        concursoId: concursoActual.id,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        sexo: true,
        edadMinima: true,
        edadMaxima: true,
        orden: true,
        createdAt: true,
        updatedAt: true,
        concursoId: true,
      },
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Editar Ganado"
        text="Actualiza la información del ganado"
      />
      <div className="grid gap-10">
        <GanadoForm 
          initialData={initialData}
          concursos={concursos}
          categoriasConcurso={categoriasConcurso}
          ganadoId={ganado.id}
        />
      </div>
    </DashboardShell>
  )
}