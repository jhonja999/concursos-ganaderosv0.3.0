import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { criadorId: string } }) {
  try {
    if (!params.criadorId) {
      return new NextResponse("Criador ID is required", { status: 400 })
    }

    const criador = await prisma.criador.findUnique({
      where: {
        id: params.criadorId,
      },
      include: {
        ganado: true,
      },
    })

    return NextResponse.json(criador)
  } catch (error) {
    console.error("[CRIADOR_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { criadorId: string } }) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { nombre, apellido, empresa, telefono, email, direccion } = body

    if (!params.criadorId) {
      return new NextResponse("Criador ID is required", { status: 400 })
    }

    const criador = await prisma.criador.update({
      where: {
        id: params.criadorId,
      },
      data: {
        nombre,
        apellido,
        empresa,
        telefono,
        email,
        direccion,
      },
    })

    return NextResponse.json(criador)
  } catch (error) {
    console.error("[CRIADOR_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { criadorId: string } }) {
  try {
    const { userId } =await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.criadorId) {
      return new NextResponse("Criador ID is required", { status: 400 })
    }

    const criador = await prisma.criador.delete({
      where: {
        id: params.criadorId,
      },
    })

    return NextResponse.json(criador)
  } catch (error) {
    console.error("[CRIADOR_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
