import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Eliminar un ganado de un concurso
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("ID is required", { status: 400 })
    }

    // Verificar que la relación existe
    const ganadoEnConcurso = await prisma.ganadoEnConcurso.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!ganadoEnConcurso) {
      return new NextResponse("Ganado en concurso no encontrado", { status: 404 })
    }

    // Eliminar la relación
    await prisma.ganadoEnConcurso.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[GANADO_CONCURSO_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
