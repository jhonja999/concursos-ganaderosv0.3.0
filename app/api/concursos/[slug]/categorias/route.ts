import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    // Nota: Removemos la verificación de auth para permitir acceso público a las categorías
    // Esto es útil para la carga de categorías en el formulario de ganado

    // Primero obtenemos el concurso por su slug
    const concurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!concurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    // Luego obtenemos las categorías de ese concurso
    const categorias = await prisma.concursoCategoria.findMany({
      where: {
        concursoId: concurso.id,
      },
      orderBy: {
        orden: "asc",
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("[CATEGORIAS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()

    const { nombre, descripcion, orden, sexo, edadMinima, edadMaxima } = body

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    // Primero obtenemos el concurso por su slug
    const concurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!concurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    // Crear la categoría
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
    console.error("[CATEGORIAS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
