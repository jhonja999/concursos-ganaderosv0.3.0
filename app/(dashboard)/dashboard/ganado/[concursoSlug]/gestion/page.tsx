import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GanadoPorCategoria } from "@/components/dashboard/ganado-por-categoria"
import { prisma } from "@/lib/prisma"
import { Ganado, Sexo } from "@/types/ganado"

interface GestionPageProps {
  params: {
    concursoSlug: string
  }
}

export default async function GestionPage({ params }: GestionPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const concursoSlug = params.concursoSlug
  
  // Obtener el concurso por slug
  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: concursoSlug,
    },
    include: {
      categorias: true, // Incluir las categorías del concurso
    }
  })

  if (!concurso) {
    notFound()
  }

  // Obtener todo el ganado en este concurso
  const ganadoEnConcurso = await prisma.ganadoEnConcurso.findMany({
    where: {
      concursoId: concurso.id,
    },
    include: {
      ganado: {
        include: {
          categoriaConcurso: true,
          GanadoImage: {
            include: {
              image: true,
            },
            where: {
              principal: true,
            },
            take: 1,
          },
        },
      },
    },
  })

  // Organizar el ganado por categoría y sexo
  const ganadoPorCategoriaMap = new Map()
  const ganadoSinCategoria: {
    machos: Ganado[],
    hembras: Ganado[],
  } = {
    machos: [],
    hembras: [],
  }

  for (const item of ganadoEnConcurso) {
    const ganado = item.ganado as unknown as Ganado
    const categoria = ganado.categoriaConcurso

    if (categoria) {
      if (!ganadoPorCategoriaMap.has(categoria.id)) {
        ganadoPorCategoriaMap.set(categoria.id, {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          machos: [],
          hembras: [],
        })
      }

      const categoriaData = ganadoPorCategoriaMap.get(categoria.id)
      
      if (ganado.sexo === "MACHO") {
        categoriaData.machos.push(ganado)
      } else {
        categoriaData.hembras.push(ganado)
      }
    } else {
      // Ganado sin categoría asignada
      if (ganado.sexo === "MACHO") {
        ganadoSinCategoria.machos.push(ganado)
      } else {
        ganadoSinCategoria.hembras.push(ganado)
      }
    }
  }

  // Convertir el mapa a un array
  const ganadoPorCategoria = Array.from(ganadoPorCategoriaMap.values())

  // Contar el total de ganado por sexo
  const totalMachos = ganadoEnConcurso.filter(item => item.ganado.sexo === "MACHO").length
  const totalHembras = ganadoEnConcurso.filter(item => item.ganado.sexo === "HEMBRA").length
  const totalGeneral = ganadoEnConcurso.length

  // Obtener las categorías disponibles para este concurso
  const categoriasConcurso = await prisma.concursoCategoria.findMany({
    where: {
      concursoId: concurso.id,
    },
    orderBy: {
      orden: 'asc',
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Gestión de Ganado - ${concurso.nombre}`}
        text="Administra el ganado inscrito en este concurso"
      />
      
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Total Machos</h3>
            <p className="text-2xl font-bold text-blue-600">{totalMachos}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Total Hembras</h3>
            <p className="text-2xl font-bold text-pink-600">{totalHembras}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Total General</h3>
            <p className="text-2xl font-bold text-green-600">{totalGeneral}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Mostrar ganado por categoría */}
        {categoriasConcurso.map((categoria) => {
          const categoriaData = ganadoPorCategoriaMap.get(categoria.id) || { machos: [], hembras: [] }
          
          return (
            <GanadoPorCategoria
              key={categoria.id}
              categoria={categoria}
              machos={categoriaData.machos || []}
              hembras={categoriaData.hembras || []}
              concursoId={concurso.id}
              concursoSlug={concursoSlug}
            />
          )
        })}
        
        {/* Mostrar ganado sin categoría asignada */}
        {(ganadoSinCategoria.machos.length > 0 || ganadoSinCategoria.hembras.length > 0) && (
          <GanadoPorCategoria
            categoria={{ 
              id: "sin-categoria", 
              nombre: "Sin Categoría Asignada", 
              descripcion: "Ganado que no tiene categoría asignada" 
            }}
            machos={ganadoSinCategoria.machos}
            hembras={ganadoSinCategoria.hembras}
            concursoId={concurso.id}
            concursoSlug={concursoSlug}
          />
        )}
      </div>
    </DashboardShell>
  )
}