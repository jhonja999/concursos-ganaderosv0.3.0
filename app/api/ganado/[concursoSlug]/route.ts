import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Obtener todo el ganado de un concurso específico
export async function GET(req: Request, { params }: { params: { concursoSlug: string } }) {
  try {
    if (!params.concursoSlug) {
      return new NextResponse("Concurso slug is required", { status: 400 })
    }

    // Obtener el concurso por slug
    const concurso = await prisma.concurso.findUnique({
      where: {
        slug: params.concursoSlug,
      },
    })

    if (!concurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    // Obtener los parámetros de búsqueda y filtrado
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const raza = searchParams.get("raza") || ""
    const establo = searchParams.get("establo") || ""
    const orderBy = searchParams.get("orderBy") || "posicion"
    const orderDir = (searchParams.get("orderDir") || "asc") as "asc" | "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")

    // Construir la consulta
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

    return NextResponse.json({
      data: ganado,
      pagination: {
        total: totalGanado,
        page,
        pageSize,
        totalPages: Math.ceil(totalGanado / pageSize),
      },
    })
  } catch (error) {
    console.error("[GANADO_CONCURSO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
