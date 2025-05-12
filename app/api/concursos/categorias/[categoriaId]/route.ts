import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { categoriaId: string } }) {
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
      },
    })

    if (!categoria) {
      return new NextResponse("Categoria no encontrada", { status: 404 })
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("[CATEGORIA_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { categoriaId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { nombre, descripcion, orden, sexo, edadMinima, edadMaxima } = body

    if (!params.categoriaId) {
      return new NextResponse("Categoria ID is required", { status: 400 })
    }

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    // Verificar que la categoría existe
    const categoriaExistente = await prisma.concursoCategoria.findUnique({
      where: {
        id: params.categoriaId,
      },
    })

    if (!categoriaExistente) {
      return new NextResponse("Categoria no encontrada", { status: 404 })
    }

    const categoria = await prisma.concursoCategoria.update({
      where: {
        id: params.categoriaId,
      },
      data: {
        nombre,
        descripcion,
        orden: orden || 0,
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

export async function DELETE(request: Request, { params }: { params: { categoriaId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.categoriaId) {
      return new NextResponse("Categoria ID is required", { status: 400 })
    }

    // Verificar que la categoría existe
    const categoriaExistente = await prisma.concursoCategoria.findUnique({
      where: {
        id: params.categoriaId,
      },
    })

    if (!categoriaExistente) {
      return new NextResponse("Categoria no encontrada", { status: 404 })
    }

    // Eliminar la categoría
    await prisma.concursoCategoria.delete({
      where: {
        id: params.categoriaId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CATEGORIA_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
