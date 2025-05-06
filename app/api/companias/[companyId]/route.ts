import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  try {
    if (!params.companyId) {
      return new NextResponse("Company ID is required", { status: 400 })
    }

    const company = await prisma.company.findUnique({
      where: {
        id: params.companyId,
      },
      include: {
        concursos: {
          where: {
            isPublished: true,
          },
          orderBy: {
            fechaInicio: "desc",
          },
        },
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error("[COMPANY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { nombre, slug, descripcion, logo, isFeatured, isPublished } = body

    if (!params.companyId) {
      return new NextResponse("Company ID is required", { status: 400 })
    }

    const company = await prisma.company.update({
      where: {
        id: params.companyId,
      },
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
    console.error("[COMPANY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.companyId) {
      return new NextResponse("Company ID is required", { status: 400 })
    }

    const company = await prisma.company.delete({
      where: {
        id: params.companyId,
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error("[COMPANY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
