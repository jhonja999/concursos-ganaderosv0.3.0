import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { concursoId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { nombre, descripcion, orden, sexo, edadMinima, edadMaxima } = body

    if (!params.concursoId) {
      return new NextResponse("Concurso ID is required", { status: 400 })
    }

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    // Verificar que el concurso existe
    const concurso = await prisma.concurso.findUnique({
      where: {
        id: params.concursoId,
      },
    })

    if (!concurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    const categoria = await prisma.concursoCategoria.create({
      data: {
        nombre,
        descripcion,
        orden: orden || 0,
        sexo,
        edadMinima,
        edadMaxima,
        concursoId: params.concursoId,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIAS_CONCURSO_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { concursoId: string } }) {
  try {
    if (!params.concursoId) {
      return new NextResponse("Concurso ID is required", { status: 400 })
    }

    const categorias = await prisma.concursoCategoria.findMany({
      where: {
        concursoId: params.concursoId,
      },
      orderBy: [
        {
          orden: "asc",
        },
        {
          nombre: "asc",
        },
      ],
      include: {
        _count: {
          select: {
            ganado: true,
          },
        },
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("[CATEGORIAS_CONCURSO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
