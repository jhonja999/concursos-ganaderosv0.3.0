import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { GanadoOverviewHeader } from "@/components/ganado/ganado-overview-header"
import { GanadoOverviewStats } from "@/components/ganado/ganado-overview-stats"
import { GanadoOverviewTable } from "@/components/ganado/ganado-overview-table"

interface GanadoPageProps {
  searchParams: {
    search?: string
    concursoId?: string
    raza?: string
    establo?: string
    sexo?: string
    orderBy?: string
    orderDir?: "asc" | "desc"
    page?: string
  }
}

export default async function GanadoPage({ searchParams }: GanadoPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  // Parámetros de búsqueda y filtrado
  const search = searchParams.search || ""
  const concursoId = searchParams.concursoId || ""
  const raza = searchParams.raza || ""
  const establo = searchParams.establo || ""
  const sexo = searchParams.sexo || ""
  const orderBy = searchParams.orderBy || "nombre"
  const orderDir = searchParams.orderDir || "asc"
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10

  // Construir la consulta para el ganado
  let where: any = {}

  if (search) {
    where = {
      ...where,
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
    }
  }

  if (raza) {
    where.raza = raza
  }

  if (establo) {
    where.establo = establo
  }

  if (sexo) {
    where.sexo = sexo
  }

  // Modificación para manejar correctamente el filtrado por concurso
  if (concursoId) {
    where.ganadoEnConcurso = {
      some: {
        concursoId,
      },
    }
  }

  // Obtener el total de registros para la paginación
  const totalGanado = await prisma.ganado.count({
    where,
  })

  // Obtener el ganado con paginación y ordenación
  const ganado = await prisma.ganado.findMany({
    where,
    orderBy: {
      [orderBy]: orderDir,
    },
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
      ganadoEnConcurso: {
        include: {
          concurso: true,
          // Remove or comment out the posicion field if it doesn't exist in your schema
          // posicion: true,
        },
        orderBy: {
          concurso: {
            fechaInicio: "desc",
          },
        },
      },
      categoriaConcurso: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  // Obtener las razas y establos disponibles para los filtros
  const razas = await prisma.ganado.findMany({
    where: {
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
      establo: {
        not: null,
      },
    },
    select: {
      establo: true,
    },
    distinct: ["establo"],
  })

  // Obtener los concursos para el filtro
  const concursos = await prisma.concurso.findMany({
    orderBy: {
      fechaInicio: "desc",
    },
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
  })

  // Obtener estadísticas para los gráficos
  const estadisticasSexo = await prisma.ganado.groupBy({
    by: ["sexo"],
    _count: {
      id: true,
    },
  })

  const estadisticasRaza = await prisma.ganado.groupBy({
    by: ["raza"],
    where: {
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
      establo: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
  })

  // Calcular el total de ganado para las estadísticas
  const totalGanadoStats = await prisma.ganado.count()

  // Preparar datos para los gráficos
  const datosSexo = estadisticasSexo.map((item) => ({
    name: item.sexo === "MACHO" ? "Machos" : "Hembras",
    value: item._count.id,
    porcentaje: Math.round((item._count.id / totalGanadoStats) * 100),
  }))

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

  // Obtener estadísticas de participación en concursos
  const participacionConcursos = await prisma.ganadoEnConcurso.groupBy({
    by: ["concursoId"],
    _count: {
      ganadoId: true,
    },
  })

  const datosConcursos = await Promise.all(
    participacionConcursos.map(async (item) => {
      const concurso = await prisma.concurso.findUnique({
        where: {
          id: item.concursoId,
        },
        select: {
          nombre: true,
        },
      })
      return {
        name: concurso?.nombre || "Concurso desconocido",
        value: item._count.ganadoId,
        porcentaje: Math.round((item._count.ganadoId / totalGanadoStats) * 100),
      }
    }),
  )

  return (
    <DashboardShell>
      <DashboardHeader heading="Ganado" text="Gestiona tu ganado registrado.">
        <Link href="/dashboard/ganado/nuevo">
          <Button>Registrar Ganado</Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4">
        <GanadoOverviewStats
          totalGanado={totalGanadoStats}
          datosSexo={datosSexo}
          datosRaza={datosRaza}
          datosEstablo={datosEstablo}
          datosConcursos={datosConcursos}
        />

        <GanadoOverviewHeader
          concursos={concursos}
          razas={razas.map((r) => r.raza || "")}
          establos={establos.map((e) => e.establo || "")}
          searchParams={searchParams}
        />

        <GanadoOverviewTable
          ganado={ganado}
          totalItems={totalGanado}
          currentPage={page}
          pageSize={pageSize}
          searchParams={searchParams}
        />
      </div>
    </DashboardShell>
  )
}