import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema de validación para actualizar categoría
const updateCategoriaSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  orden: z.number().int().optional(),
  sexo: z.enum(["MACHO", "HEMBRA", "SIN_RESTRICCION"]).optional().nullable(),
  edadMinima: z.number().int().optional().nullable(),
  edadMaxima: z.number().int().optional().nullable(),
})

type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>

export async function GET(
  request: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const { categoriaId } = params

    if (!categoriaId) {
      return new Response("Categoria ID is required", { status: 400 })
    }

    const categoria = await prisma.concursoCategoria.findUnique({
      where: { id: categoriaId },
      include: { concurso: true },
    })

    if (!categoria) {
      return new Response("Categoría no encontrada", { status: 404 })
    }

    return Response.json(categoria)
  } catch (error) {
    console.error("[CATEGORIA_GET]", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return new Response("Unauthorized", { status: 401 })

    const body = await request.json()

    // Validar datos de entrada
    const data = updateCategoriaSchema.parse(body)

await prisma.concursoCategoria.update({
  where: { id: params.categoriaId },
  data: {
    nombre: data.nombre,
    sexo: data.sexo === "SIN_RESTRICCION" ? null : data.sexo,
    edadMinima: data.edadMinima ?? null,
    edadMaxima: data.edadMaxima ?? null,
  },
})

    const { categoriaId } = params
    if (!categoriaId) {
      return new Response("Categoria ID is required", { status: 400 })
    }

    // Verificar que la categoría exista
    const categoriaExistente = await prisma.concursoCategoria.findUnique({
      where: { id: categoriaId },
    })

    if (!categoriaExistente) {
      return new Response("Categoría no encontrada", { status: 404 })
    }

    // Actualizar categoría
    const categoriaActualizada = await prisma.concursoCategoria.update({
      where: { id: categoriaId },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? undefined,
        orden: data.orden ?? 0,
        sexo: data.sexo,
        edadMinima: data.edadMinima ?? null,
        edadMaxima: data.edadMaxima ?? null,
      },
    })

    return Response.json(categoriaActualizada)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation error", issues: error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.error("[CATEGORIA_PATCH]", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return new Response("Unauthorized", { status: 401 })

    const { categoriaId } = params
    if (!categoriaId) {
      return new Response("Categoria ID is required", { status: 400 })
    }

    // Verificar que la categoría existe antes de eliminarla
    const categoriaExistente = await prisma.concursoCategoria.findUnique({
      where: { id: categoriaId },
    })

    if (!categoriaExistente) {
      return new Response("Categoría no encontrada", { status: 404 })
    }

    // Eliminar la categoría
    await prisma.concursoCategoria.delete({
      where: { id: categoriaId },
    })

    return new Response(null, { status: 204 }) // No Content
  } catch (error) {
    console.error("[CATEGORIA_DELETE]", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}