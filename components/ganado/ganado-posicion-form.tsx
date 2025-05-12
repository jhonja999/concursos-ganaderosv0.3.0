"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Definir el esquema de validación
const posicionSchema = z.object({
  posicion: z.coerce.number().int().min(1, "La posición debe ser un número entero positivo"),
})

type PosicionFormValues = z.infer<typeof posicionSchema>

interface GanadoEnConcurso {
  id: string
  ganadoId: string
  concursoId: string
  posicion: number | null
  ganado: {
    id: string
    nombre: string
    // Otros campos del ganado...
  }
}

interface GanadoPosicionFormProps {
  ganadoEnConcurso: GanadoEnConcurso
  onClose: () => void
  onSuccess: () => void
}

export function GanadoPosicionForm({ ganadoEnConcurso, onClose, onSuccess }: GanadoPosicionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar el formulario
  const form = useForm<PosicionFormValues>({
    resolver: zodResolver(posicionSchema),
    defaultValues: {
      posicion: ganadoEnConcurso.posicion || 1,
    },
  })

  // Manejar el envío del formulario
  const onSubmit = async (values: PosicionFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/ganado/concurso/${ganadoEnConcurso.concursoId}/posicion`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ganadoEnConcursoId: ganadoEnConcurso.id,
          posicion: values.posicion,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la posición")
      }

      toast.success("Posición actualizada correctamente")
      onSuccess()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar la posición")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar posición</DialogTitle>
          <DialogDescription>
            Asigna una posición para {ganadoEnConcurso.ganado.nombre} en este concurso.
          </DialogDescription>
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
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
