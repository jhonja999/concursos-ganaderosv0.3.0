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
    const { nombre, apellido, empresa, telefono, email, direccion } = body

    if (!nombre) {
      return new NextResponse("Nombre es requerido", { status: 400 })
    }

    const criador = await prisma.criador.create({
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
    console.error("[CRIADORES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const criadores = await prisma.criador.findMany({
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json(criadores)
  } catch (error) {
    console.error("[CRIADORES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
