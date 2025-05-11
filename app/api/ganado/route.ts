import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    console.log("Datos recibidos en API:", body)

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

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug es requerido", { status: 400 })
    }

    if (!sexo) {
      return new NextResponse("Sexo es requerido", { status: 400 })
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

    // Crear el ganado
    const ganado = await prisma.ganado.create({
      data: {
        nombre,
        slug,
        numRegistro,
        fechaNac: fechaNac ? new Date(fechaNac) : null,
        sexo,
        raza,
        establo,
        propietario,
        criadorId: criadorId || null,
        categoria,
        subcategoria,
        categoriaConcursoId: categoriaConcursoId || null,
        remate,
        puntaje,
        descripcion,
        isFeatured,
        isPublished,
      },
    })

    // Si se proporciona un concursoId, crear la relación
    if (concursoId) {
      await prisma.ganadoEnConcurso.create({
        data: {
          ganadoId: ganado.id,
          concursoId,
          // Eliminamos categoriaId ya que no existe en el modelo
        },
      })
    }

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("[GANADO_POST]", error)
    return new NextResponse(`Error interno: ${error instanceof Error ? error.message : "Error desconocido"}`, {
      status: 500,
    })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const concursoId = searchParams.get("concursoId")
    const sexo = searchParams.get("sexo")
    const categoria = searchParams.get("categoria")
    const categoriaConcursoId = searchParams.get("categoriaConcursoId")
    const isFeatured = searchParams.get("isFeatured")
    const isPublished = searchParams.get("isPublished")

    let where: any = {}

    if (sexo) {
      where = {
        ...where,
        sexo,
      }
    }

    if (categoria) {
      where = {
        ...where,
        categoria,
      }
    }

    if (categoriaConcursoId) {
      where = {
        ...where,
        categoriaConcursoId,
      }
    }

    if (isFeatured) {
      where = {
        ...where,
        isFeatured: isFeatured === "true",
      }
    }

    if (isPublished) {
      where = {
        ...where,
        isPublished: isPublished === "true",
      }
    }

    if (concursoId) {
      where = {
        ...where,
        ganadoEnConcurso: {
          some: {
            concursoId,
          },
        },
      }
    }

    const ganado = await prisma.ganado.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ganadoEnConcurso: {
          include: {
            concurso: {
              select: {
                id: true,
                nombre: true,
                slug: true,
              },
            },
            // Eliminamos categoria ya que no existe en el modelo
          },
        },
        categoriaConcurso: true,
        criador: true,
        GanadoImage: {
          include: {
            image: true,
          },
          where: {
            principal: true,
          },
          take: 1,
        },
      },
    })

    return NextResponse.json(ganado)
  } catch (error) {
    console.error("[GANADO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
