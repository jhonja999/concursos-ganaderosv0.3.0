import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    const concurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        company: true,
        ganadoEnConcurso: {
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
              },
            },
          },
        },
      },
    })

    if (!concurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("[CONCURSO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { userId } =  await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { nombre, slug, descripcion, fechaInicio, fechaFin, companyId, isFeatured, isPublished } = body

    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    // Verificar que el concurso existe
    const existingConcurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!existingConcurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    // Verificar si el nuevo slug ya existe (si se está cambiando)
    if (slug !== params.slug) {
      const slugExists = await prisma.concurso.findUnique({
        where: {
          slug,
        },
      })

      if (slugExists) {
        return new NextResponse("El slug ya está en uso", { status: 400 })
      }
    }

    const concurso = await prisma.concurso.update({
      where: {
        id: existingConcurso.id,
      },
      data: {
        nombre,
        slug,
        descripcion,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        companyId,
        isFeatured,
        isPublished,
      },
    })

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("[CONCURSO_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    // Verificar que el concurso existe
    const existingConcurso = await prisma.concurso.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!existingConcurso) {
      return new NextResponse("Concurso no encontrado", { status: 404 })
    }

    const concurso = await prisma.concurso.delete({
      where: {
        id: existingConcurso.id,
      },
    })

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("[CONCURSO_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
