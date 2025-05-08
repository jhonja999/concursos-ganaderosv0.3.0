import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { categoriaId: string } }) {
  try {
    if (!params.categoriaId) {
      return new NextResponse("Categoria ID is required", { status: 400 })
    }

    const categoria = await prisma.concursoCategoria.findUnique({
      where: {
        id: params.categoriaId,
      },
      include: {
        concurso: true,
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
    })

    if (!categoria) {
      return new NextResponse("Categoría no encontrada", { status: 404 })
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIA_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { categoriaId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { nombre, descripcion, orden, sexo, edadMinima, edadMaxima } = body

    if (!params.categoriaId) {
      return new NextResponse("Categoria ID is required", { status: 400 })
    }

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    const categoria = await prisma.concursoCategoria.update({
      where: {
        id: params.categoriaId,
      },
      data: {
        nombre,
        descripcion,
        orden,
        sexo,
        edadMinima,
        edadMaxima,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIA_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { categoriaId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.categoriaId) {
      return new NextResponse("Categoria ID is required", { status: 400 })
    }

    // Verificar si hay ganado asociado a esta categoría
    const ganadoCount = await prisma.ganado.count({
      where: {
        categoriaConcursoId: params.categoriaId,
      },
    })

    if (ganadoCount > 0) {
      return new NextResponse(
        "No se puede eliminar esta categoría porque hay ganado asociado a ella. Reasigne el ganado primero.",
        { status: 400 },
      )
    }

    const categoria = await prisma.concursoCategoria.delete({
      where: {
        id: params.categoriaId,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIA_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
