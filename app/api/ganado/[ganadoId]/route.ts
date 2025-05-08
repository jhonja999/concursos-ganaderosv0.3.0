import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { ganadoId: string } }) {
  try {
    if (!params.ganadoId) {
      return new NextResponse("Ganado ID is required", { status: 400 })
    }

    const ganado = await prisma.ganado.findUnique({
      where: {
        id: params.ganadoId,
      },
      include: {
        ganadoEnConcurso: {
          include: {
            concurso: true,
          },
        },
        categoriaConcurso: {
          include: {
            concurso: true,
          },
        },
        criador: true,
        GanadoImage: {
          include: {
            image: true,
          },
        },
      },
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("[GANADO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { ganadoId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const {
      nombre,
      slug,
      numRegistro,
      fechaNac,
      sexo,
      raza,
      establo,
      propietario,
      criadorId,
      categoria,
      subcategoria,
      categoriaConcursoId,
      remate,
      puntaje,
      descripcion,
      concursoId,
      isFeatured,
      isPublished,
    } = body

    if (!params.ganadoId) {
      return new NextResponse("Ganado ID is required", { status: 400 })
    }

    // Verificar que la categoría de concurso pertenece al concurso seleccionado
    if (categoriaConcursoId && concursoId) {
      const categoriaExiste = await prisma.concursoCategoria.findFirst({
        where: {
          id: categoriaConcursoId,
          concursoId: concursoId,
        },
      })

      if (!categoriaExiste) {
        return new NextResponse("La categoría seleccionada no pertenece al concurso", { status: 400 })
      }
    }

    // Actualizar el ganado
    const ganado = await prisma.ganado.update({
      where: {
        id: params.ganadoId,
      },
      data: {
        nombre,
        slug,
        numRegistro,
        fechaNac: fechaNac ? new Date(fechaNac) : null,
        sexo,
        raza,
        establo,
        propietario,
        criadorId,
        categoria,
        subcategoria,
        categoriaConcursoId,
        remate,
        puntaje,
        descripcion,
        isFeatured,
        isPublished,
      },
    })

    // Si se proporciona un concursoId, actualizar la relación
    if (concursoId) {
      // Verificar si ya existe la relación
      const existingRelation = await prisma.ganadoEnConcurso.findUnique({
        where: {
          ganadoId_concursoId: {
            ganadoId: params.ganadoId,
            concursoId,
          },
        },
      })

      // Si no existe, crearla
      if (!existingRelation) {
        await prisma.ganadoEnConcurso.create({
          data: {
            ganadoId: params.ganadoId,
            concursoId,
          },
        })
      }
    }

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("[GANADO_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { ganadoId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.ganadoId) {
      return new NextResponse("Ganado ID is required", { status: 400 })
    }

    const ganado = await prisma.ganado.delete({
      where: {
        id: params.ganadoId,
      },
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("[GANADO_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
