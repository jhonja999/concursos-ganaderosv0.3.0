import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Actualizar la posición de un ganado en un concurso
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
    const { posicion } = body

    // Verificar que la relación existe
    const ganadoEnConcurso = await prisma.ganadoEnConcurso.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!ganadoEnConcurso) {
      return new NextResponse("Ganado en concurso no encontrado", { status: 404 })
    }

    // Actualizar la posición
    const updated = await prisma.ganadoEnConcurso.update({
      where: {
        id: params.id,
      },
      data: {
        posicion: posicion === null ? null : Number.parseInt(posicion),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[GANADO_CONCURSO_POSICION_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
