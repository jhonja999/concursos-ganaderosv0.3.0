import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Actualizar el puntaje de un ganado
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("ID is required", { status: 400 })
    }

    const body = await req.json()
    const { puntaje } = body

    // Verificar que el ganado existe
    const ganado = await prisma.ganado.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!ganado) {
      return new NextResponse("Ganado no encontrado", { status: 404 })
    }

    // Actualizar el puntaje
    const updated = await prisma.ganado.update({
      where: {
        id: params.id,
      },
      data: {
        puntaje: puntaje === null ? null : Number.parseFloat(puntaje),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[GANADO_PUNTAJE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
