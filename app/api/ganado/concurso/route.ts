import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Añadir un ganado a un concurso
export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { ganadoId, concursoId, posicion } = body

    if (!ganadoId) {
      return new NextResponse("Ganado ID is required", { status: 400 })
    }

    if (!concursoId) {
      return new NextResponse("Concurso ID is required", { status: 400 })
    }

    // Verificar si ya existe la relación
    const existingRelation = await prisma.ganadoEnConcurso.findUnique({
      where: {
        ganadoId_concursoId: {
          ganadoId,
          concursoId,
        },
      },
    })

    if (existingRelation) {
      return new NextResponse("El ganado ya está registrado en este concurso", { status: 400 })
    }

    // Crear la relación
    const ganadoEnConcurso = await prisma.ganadoEnConcurso.create({
      data: {
        ganadoId,
        concursoId,
        posicion: posicion ? Number.parseInt(posicion) : null,
      },
    })

    return NextResponse.json(ganadoEnConcurso)
  } catch (error) {
    console.error("[GANADO_CONCURSO_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// Obtener todos los ganados en concursos
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const concursoId = searchParams.get("concursoId")
    const ganadoId = searchParams.get("ganadoId")

    let where = {}

    if (concursoId) {
      where = {
        ...where,
        concursoId,
      }
    }

    if (ganadoId) {
      where = {
        ...where,
        ganadoId,
      }
    }

    const ganadoEnConcurso = await prisma.ganadoEnConcurso.findMany({
      where,
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
        concurso: true,
      },
      orderBy: {
        posicion: "asc",
      },
    })

    return NextResponse.json(ganadoEnConcurso)
  } catch (error) {
    console.error("[GANADO_CONCURSO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
