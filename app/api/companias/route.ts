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

    const { nombre, slug, descripcion, logo, isFeatured, isPublished } = body

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug es requerido", { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        nombre,
        slug,
        descripcion,
        logo,
        isFeatured,
        isPublished,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error("[COMPANIAS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const isFeatured = searchParams.get("isFeatured")
    const isPublished = searchParams.get("isPublished")

    let where = {}

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

    const companies = await prisma.company.findMany({
      where,
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("[COMPANIAS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
