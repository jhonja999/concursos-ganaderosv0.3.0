"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
  posicion: z.coerce
    .number()
    .int()
    .min(1, {
      message: "La posición debe ser un número entero positivo",
    })
    .optional()
    .nullable(),
  puntaje: z.coerce
    .number()
    .min(0, {
      message: "El puntaje debe ser un número positivo",
    })
    .optional()
    .nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface GanadoPosicionFormProps {
  ganadoEnConcurso: {
    id: string
    posicion: number | null
    ganado: {
      id: string
      nombre: string
      puntaje: number | null
    }
  }
  onClose: () => void
  onSuccess: () => void
}

export function GanadoPosicionForm({ ganadoEnConcurso, onClose, onSuccess }: GanadoPosicionFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posicion: ganadoEnConcurso.posicion,
      puntaje: ganadoEnConcurso.ganado.puntaje,
    },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)

    try {
      // Actualizar la posición en GanadoEnConcurso
      const posicionResponse = await fetch(`/api/ganado/concurso/${ganadoEnConcurso.id}/posicion`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posicion: data.posicion,
        }),
      })

      if (!posicionResponse.ok) {
        throw new Error("Error al actualizar la posición")
      }

      // Actualizar el puntaje en Ganado
      if (data.puntaje !== undefined && data.puntaje !== null) {
        const puntajeResponse = await fetch(`/api/ganado/${ganadoEnConcurso.ganado.id}/puntaje`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            puntaje: data.puntaje,
          }),
        })

        if (!puntajeResponse.ok) {
          throw new Error("Error al actualizar el puntaje")
        }
      }

      toast.success("Posición y puntaje actualizados correctamente")
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Error al actualizar la posición y puntaje")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar posición y puntaje</DialogTitle>
          <DialogDescription>Actualiza la posición y puntaje para {ganadoEnConcurso.ganado.nombre}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="posicion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posición</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Posición (1, 2, 3, etc.)"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>Posición obtenida en el concurso (1º, 2º, 3º, etc.)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="puntaje"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntaje</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="Puntaje (0-100)"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : Number.parseFloat(e.target.value)
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>Puntaje obtenido en el concurso</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
