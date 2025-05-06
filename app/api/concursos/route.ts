import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { nombre, slug, descripcion, fechaInicio, fechaFin, companyId, isFeatured, isPublished } = body

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug es requerido", { status: 400 })
    }

    if (!fechaInicio) {
      return new NextResponse("Fecha de inicio es requerida", { status: 400 })
    }

    if (!companyId) {
      return new NextResponse("Compañía es requerida", { status: 400 })
    }

    const concurso = await prisma.concurso.create({
      data: {
        nombre,
        slug,
        descripcion,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        companyId,
        isFeatured,
        isPublished,
      },
    })

    return NextResponse.json(concurso)
  } catch (error) {
    console.error("[CONCURSOS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("companyId")
    const isFeatured = searchParams.get("isFeatured")
    const isPublished = searchParams.get("isPublished")

    let where = {}

    if (companyId) {
      where = {
        ...where,
        companyId,
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

    const concursos = await prisma.concurso.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        company: {
          select: {
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(concursos)
  } catch (error) {
    console.error("[CONCURSOS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
