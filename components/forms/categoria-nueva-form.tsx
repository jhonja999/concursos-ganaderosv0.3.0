"use client"

import { useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  concursoId: z.string({
    required_error: "Debes seleccionar un concurso.",
  }),
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
  orden: z.coerce.number().int().min(0).default(0),
  sexo: z.enum(["MACHO", "HEMBRA", "SIN_RESTRICCION"]).optional(),
  edadMinima: z.coerce.number().int().min(0).optional().nullable(),
  edadMaxima: z.coerce.number().int().min(0).optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface Concurso {
  id: string
  nombre: string
  slug: string
}

interface CategoriaNuevaFormProps {
  concursos: Concurso[]
}

export function CategoriaNuevaForm({ concursos }: CategoriaNuevaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConcursoSlug, setSelectedConcursoSlug] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concursoId: "",
      nombre: "",
      descripcion: "",
      orden: 0,
      sexo: "SIN_RESTRICCION",
      edadMinima: null,
      edadMaxima: null,
    },
  })

  // Cuando cambia el concurso seleccionado, actualizar el slug
  const handleConcursoChange = (concursoId: string) => {
    const concurso = concursos.find((c) => c.id === concursoId)
    if (concurso) {
      setSelectedConcursoSlug(concurso.slug)
    }
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/concursos/${data.concursoId}/categorias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al crear la categoría")
      }

      toast.success("Categoría creada correctamente")

      // Redirigir a la página de categorías del concurso seleccionado
      if (selectedConcursoSlug) {
        router.push(`/dashboard/concursos/${selectedConcursoSlug}/categorias`)
      } else {
        router.push(`/dashboard/categorias`)
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al crear la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la categoría</CardTitle>
        <CardDescription>Completa la información para crear una nueva categoría para un concurso.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="concursoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concurso</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleConcursoChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar concurso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {concursos.map((concurso) => (
                        <SelectItem key={concurso.id} value={concurso.id}>
                          {concurso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Selecciona el concurso al que pertenecerá esta categoría</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SIN_RESTRICCION">Sin restricción</SelectItem>
                        <SelectItem value="MACHO">Macho</SelectItem>
                        <SelectItem value="HEMBRA">Hembra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Restricción de sexo para esta categoría</FormDescription>
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

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/categorias")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creando..." : "Crear categoría"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
