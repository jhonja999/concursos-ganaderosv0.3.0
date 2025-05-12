"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
  orden: z.coerce.number().int().min(0),
  sexo: z.enum(["MACHO", "HEMBRA", "SIN_RESTRICCION"]).optional().nullable(),
  edadMinima: z.coerce.number().int().min(0).optional().nullable(),
  edadMaxima: z.coerce.number().int().min(0).optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoriaConcursoFormProps {
  concursoId: string
  concursoSlug: string
  initialData?: FormValues & { id: string }
}

export function CategoriaConcursoForm({ concursoId, concursoSlug, initialData }: CategoriaConcursoFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      orden: 0,
      sexo: null,
      edadMinima: null,
      edadMaxima: null,
      ...initialData // Mezclar valores iniciales de forma segura
    },
  })
    // Resetear el formulario solo cuando initialData cambia
    useEffect(() => {
      if (initialData) {
        form.reset({
          ...form.getValues(),
          ...initialData
        })
      }
    }, [form, JSON.stringify(initialData)]) // Comparación por contenido
  

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    try {
      console.log("Enviando datos:", data) // Añadir para depuración

      let url: string
      let method: string

      if (initialData) {
        url = `/api/concursos/categorias/${initialData.id}`
        method = "PATCH"
      } else {
        // Intentamos primero con el slug
        url = `/api/concursos/${concursoSlug}/categorias`
        method = "POST"
      }

      console.log("URL de la API:", url) // Añadir para depuración

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Si falla con el slug, intentamos con el ID
        if (!initialData && response.status === 404) {
          url = `/api/concursos/${concursoId}/categorias`
          console.log("Intentando URL alternativa:", url)

          const secondResponse = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })

          if (!secondResponse.ok) {
            const errorText = await secondResponse.text()
            console.error("Error en segunda respuesta:", secondResponse.status, errorText)
            throw new Error(`Error al ${initialData ? "actualizar" : "crear"} la categoría: ${errorText}`)
          }
        } else {
          const errorText = await response.text()
          console.error("Error de respuesta:", response.status, errorText)
          throw new Error(`Error al ${initialData ? "actualizar" : "crear"} la categoría: ${errorText}`)
        }
      }

      toast.success(`Categoría ${initialData ? "actualizada" : "creada"} correctamente`)
      router.push(`/dashboard/concursos/${concursoSlug}/categorias`)
      router.refresh()
    } catch (error) {
      console.error("Error completo:", error)
      toast.error(
        error instanceof Error ? error.message : `Error al ${initialData ? "actualizar" : "crear"} la categoría`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Añadir key al formulario para forzar reinicio */}
            <div key={JSON.stringify(initialData)}></div>
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
                  <FormDescription>Nombre de la categoría (ej. "Terneras", "Vacas Adultas")</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción de la categoría" className="min-h-20" {...field} />
                  </FormControl>
                  <FormDescription>Descripción detallada de la categoría (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Orden de visualización</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar sexo (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SIN_RESTRICCION">Sin restricción</SelectItem>
                        <SelectItem value="MACHO">Macho</SelectItem>
                        <SelectItem value="HEMBRA">Hembra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Restricción de sexo para esta categoría (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="edadMinima"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad Mínima (días)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Edad mínima en días"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Edad mínima en días (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="edadMaxima"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad Máxima (días)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Edad máxima en días"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Edad máxima en días (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? initialData
                  ? "Actualizando..."
                  : "Creando..."
                : initialData
                  ? "Actualizar categoría"
                  : "Crear categoría"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
