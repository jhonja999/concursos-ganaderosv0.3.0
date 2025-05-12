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
const puntajeSchema = z.object({
  puntaje: z.coerce.number().min(0, "El puntaje debe ser un número positivo").max(100, "El puntaje máximo es 100"),
})

type PuntajeFormValues = z.infer<typeof puntajeSchema>

interface GanadoPuntajeFormProps {
  ganadoId: string
  initialPuntaje: number | null
  onSubmit: (puntaje: number) => Promise<void>
  isLoading: boolean
}

export function GanadoPuntajeForm({ ganadoId, initialPuntaje, onSubmit, isLoading }: GanadoPuntajeFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Inicializar el formulario
  const form = useForm<PuntajeFormValues>({
    resolver: zodResolver(puntajeSchema),
    defaultValues: {
      puntaje: initialPuntaje || 0,
    },
  })

  // Manejar el envío del formulario
  const handleSubmit = async (values: PuntajeFormValues) => {
    try {
      await onSubmit(values.puntaje)
      setIsDialogOpen(false)  // Cierra el dialogo solo después de que se haya enviado el formulario correctamente
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar el puntaje")
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="w-full justify-center"
        disabled={isLoading}
      >
        {initialPuntaje !== null ? `${initialPuntaje} pts` : "Asignar"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar puntaje</DialogTitle>
            <DialogDescription>Asigna un puntaje para este ganado en el concurso.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="puntaje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puntaje</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={0.1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
    </>
  )
}
