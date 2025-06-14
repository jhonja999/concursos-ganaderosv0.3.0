import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

// Define the schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  weight: z.number().min(0.1).max(10),
  maxScore: z.number().int().min(1),
  order: z.number().int().min(0),
  categoryId: z.string().optional(),
});

// Infer TypeScript type from Zod schema
type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface CriteriaFormProps {
  contestId: string;
  categories: Category[];
  initialData?: FormValues & { id: string };
  criteriaId?: string;
}

export function CriteriaForm({
  contestId,
  categories,
  initialData,
  criteriaId,
}: CriteriaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      weight: initialData?.weight || 1.0,
      maxScore: initialData?.maxScore || 100,
      order: initialData?.order || 0,
      categoryId: initialData?.categoryId || undefined,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      let url = `/api/contests/${contestId}/criteria`;
      let method = "POST";

      if (criteriaId) {
        url = `/api/contests/${contestId}/criteria/${criteriaId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al procesar el criterio");
      }

      toast.success(
        `Criterio ${criteriaId ? "actualizado" : "creado"} correctamente`
      );
      router.push(`/dashboard/contests/${contestId}/criteria`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al procesar el criterio");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del criterio" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre del criterio de evaluación (ej. "Presentación", "Sabor", "Conformación")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del criterio"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción detallada de cómo evaluar este criterio
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0.1}
                        max={10}
                        step={0.1}
                        placeholder="1.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Importancia relativa de este criterio (1.0 = normal)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puntuación máxima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                      />
                    </FormControl>
                    <FormDescription>
                      Puntuación máxima posible para este criterio
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Orden de visualización
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aplicar a todo el concurso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Aplicar a todo el concurso</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Si se selecciona una categoría, este criterio solo se aplicará a esa categoría.
                    De lo contrario, se aplicará a todas las categorías del concurso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : criteriaId
                ? "Actualizar criterio"
                : "Crear criterio"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}