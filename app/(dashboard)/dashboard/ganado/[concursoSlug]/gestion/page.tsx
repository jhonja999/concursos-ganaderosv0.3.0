import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GanadoGestionHeader } from "@/components/ganado/ganado-gestion-header"
import { GanadoStats } from "@/components/ganado/ganado-stats"
import { GanadoTable } from "@/components/ganado/ganado-table"
import { prisma } from "@/lib/prisma"

interface GanadoGestionPageProps {
  params: {
    concursoSlug: string
  }
  searchParams: {
    search?: string
    raza?: string
    establo?: string
    orderBy?: string
    orderDir?: "asc" | "desc"
    page?: string
  }
}

export default async function GanadoGestionPage({ params, searchParams }: GanadoGestionPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Obtener el concurso por slug
  const concurso = await prisma.concurso.findUnique({
    where: {
      slug: params.concursoSlug,
    },
    include: {
      company: true,
    },
  })

  if (!concurso) {
    redirect("/dashboard/concursos")
  }

  // Parámetros de búsqueda y filtrado
  const search = searchParams.search || ""
  const raza = searchParams.raza || ""
  const establo = searchParams.establo || ""
  const orderBy = searchParams.orderBy || "posicion"
  const orderDir = searchParams.orderDir || "asc"
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10

  // Construir la consulta para el ganado
  let where: any = {
    concursoId: concurso.id,
}

  if (search) {
    where = {
      ...where,
      ganado: {
        OR: [
          {
            nombre: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            numRegistro: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
    }
  }

  if (raza) {
    where = {
      ...where,
      ganado: {
        ...where.ganado,
        raza,
      },
    }
  }

  if (establo) {
    where = {
      ...where,
      ganado: {
        ...where.ganado,
        establo,
      },
    }
  }

  // Obtener el total de registros para la paginación
  const totalGanado = await prisma.ganadoEnConcurso.count({
    where,
  })

  // Obtener el ganado con paginación y ordenación
  const ganado = await prisma.ganadoEnConcurso.findMany({
    where,
    orderBy: {
      [orderBy === "nombre" || orderBy === "raza" || orderBy === "establo" || orderBy === "puntaje"
        ? "ganado"
        : orderBy]: {
        [orderBy === "nombre" || orderBy === "raza" || orderBy === "establo" || orderBy === "puntaje"
          ? orderBy
          : "posicion"]: orderDir,
      },
    },
    include: {
      ganado: {
        include: {
          GanadoImage: {
            include: {
              image: true,
            },
            where: {
              principal: true,
            },
            take: 1,
          },
          criador: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  // Obtener las razas y establos disponibles para los filtros
  const razas = await prisma.ganado.findMany({
    where: {
      ganadoEnConcurso: {
        some: {
          concursoId: concurso.id,
        },
      },
      raza: {
        not: null,
      },
    },
    select: {
      raza: true,
    },
    distinct: ["raza"],
  })

  const establos = await prisma.ganado.findMany({
    where: {
      ganadoEnConcurso: {
        some: {
          concursoId: concurso.id,
        },
      },
      establo: {
        not: null,
      },
    },
    select: {
      establo: true,
    },
    distinct: ["establo"],
  })

  // Obtener estadísticas para los gráficos
  const estadisticasRaza = await prisma.ganado.groupBy({
    by: ["raza"],
    where: {
      ganadoEnConcurso: {
        some: {
          concursoId: concurso.id,
        },
      },
      raza: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
  })

  const estadisticasEstablo = await prisma.ganado.groupBy({
    by: ["establo"],
    where: {
      ganadoEnConcurso: {
        some: {
          concursoId: concurso.id,
        },
      },
      establo: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
  })

  // Calcular el total de ganado para las estadísticas
  const totalGanadoStats = estadisticasRaza.reduce((acc, curr) => acc + curr._count.id, 0)

  // Preparar datos para los gráficos
  const datosRaza = estadisticasRaza.map((item) => ({
    name: item.raza || "Sin raza",
    value: item._count.id,
    porcentaje: Math.round((item._count.id / totalGanadoStats) * 100),
  }))

  const datosEstablo = estadisticasEstablo.map((item) => ({
    name: item.establo || "Sin establo",
    value: item._count.id,
    porcentaje: Math.round((item._count.id / totalGanadoStats) * 100),
  }))

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Gestión de Ganado - ${concurso.nombre}`}
        text="Administra el ganado participante en este concurso."
      />

      <GanadoGestionHeader
        concurso={concurso}
        razas={razas.map((r) => r.raza || "")}
        establos={establos.map((e) => e.establo || "")}
        searchParams={searchParams}
      />

      <GanadoStats
        totalGanado={totalGanadoStats}
        datosRaza={datosRaza}
        datosEstablo={datosEstablo}
        concursoNombre={concurso.nombre}
      />

      <GanadoTable
        data={ganado}
        concursoSlug={params.concursoSlug}
        concursoId={concurso.id}
        totalItems={totalGanado}
        currentPage={page}
        pageSize={pageSize}
        searchParams={searchParams}
      />
    </DashboardShell>
  )
}
