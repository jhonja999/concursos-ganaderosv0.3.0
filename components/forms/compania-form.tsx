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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { generateSlug } from "@/lib/utils"

const formSchema = z.object({
  nombre: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  slug: z.string().min(3, {
    message: "El slug debe tener al menos 3 caracteres.",
  }),
  descripcion: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
})


type FormValues = z.infer<typeof formSchema>

interface CompaniaFormProps {
  initialData?: FormValues
  companyId?: string
}

export function CompaniaForm({ initialData, companyId }: CompaniaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nombre: "",
      slug: "",
      descripcion: "",
      logo: "",
      isFeatured: false,
      isPublished: false,
    },
  })

  // Generar slug automáticamente al cambiar el nombre
  const watchNombre = form.watch("nombre")
  if (watchNombre && !form.getValues("slug")) {
    const slug = generateSlug(watchNombre)
    form.setValue("slug", slug)
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    try {
      const url = companyId ? `/api/companias/${companyId}` : "/api/companias"

      const method = companyId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Error al ${companyId ? "actualizar" : "crear"} la compañía`)
      }

      toast.success(`Compañía ${companyId ? "actualizada" : "creada"} correctamente`)
      router.push("/dashboard/companias")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(`Error al ${companyId ? "actualizar" : "crear"} la compañía`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la compañía" {...field} />
                    </FormControl>
                    <FormDescription>Este es el nombre público de la compañía.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="slug-de-la-compania" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este es el identificador único para URLs. Se genera automáticamente a partir del nombre.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción de la compañía" className="min-h-32" {...field} />
                  </FormControl>
                  <FormDescription>Breve descripción de la compañía.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>URL de la imagen del logo de la compañía.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Destacada</FormLabel>
                      <FormDescription>Mostrar esta compañía en secciones destacadas.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publicada</FormLabel>
                      <FormDescription>Hacer visible esta compañía en el sitio.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? companyId
                  ? "Actualizando..."
                  : "Creando..."
                : companyId
                  ? "Actualizar compañía"
                  : "Crear compañía"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
