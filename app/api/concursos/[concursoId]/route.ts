import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { concursoId: string } }) {
  try {
    if (!params.concursoId) {
      return new NextResponse("Concurso ID is required", { status: 400 })
    }

    const concurso = await prisma.concurso.findUnique({
      where: {
        id: params.concursoId,
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

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("[CONCURSO_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { concursoId: string } }) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { nombre, slug, descripcion, fechaInicio, fechaFin, companyId, isFeatured, isPublished } = body

    if (!params.concursoId) {
      return new NextResponse("Concurso ID is required", { status: 400 })
    }

    const concurso = await prisma.concurso.update({
      where: {
        id: params.concursoId,
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

export async function DELETE(req: Request, { params }: { params: { concursoId: string } }) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.concursoId) {
      return new NextResponse("Concurso ID is required", { status: 400 })
    }

    const concurso = await prisma.concurso.delete({
      where: {
        id: params.concursoId,
      },
    })

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("[CONCURSO_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
