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
    const { url, hash, ganadoId, principal } = body

    if (!url) {
      return new NextResponse("URL is required", { status: 400 })
    }

    if (!ganadoId) {
      return new NextResponse("Ganado ID is required", { status: 400 })
    }

    // Crear o encontrar la imagen
    let image = await prisma.image.findUnique({
      where: {
        url,
      },
    })

    if (!image) {
      image = await prisma.image.create({
        data: {
          url,
          hash,
        },
      })
    }

    // Si es principal, actualizar todas las imágenes del ganado para que no sean principales
    if (principal) {
      await prisma.ganadoImage.updateMany({
        where: {
          ganadoId,
        },
        data: {
          principal: false,
        },
      })
    }

    // Crear la relación entre ganado e imagen
    const ganadoImage = await prisma.ganadoImage.create({
      data: {
        ganadoId,
        imageId: image.id,
        principal: principal || false,
      },
      include: {
        image: true,
      },
    })

    return NextResponse.json(ganadoImage)
  } catch (error) {
    console.error("[UPLOAD_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
