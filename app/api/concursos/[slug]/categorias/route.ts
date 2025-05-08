import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { nombre, descripcion, orden, sexo, edadMinima, edadMaxima } = body

    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    // Verificar que el concurso existe
    const concurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
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
        concursoId: concurso.id,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIAS_CONCURSO_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    // Verificar que el concurso existe
    const concurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!concurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    const categorias = await prisma.concursoCategoria.findMany({
      where: {
        concursoId: concurso.id,
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
