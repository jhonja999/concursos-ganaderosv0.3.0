import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { ContestType, Sexo } from "@prisma/client"

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
  order: z.number().int().min(0),
  
  // Livestock-specific fields
  ageMin: z.number().int().min(0).optional().nullable(),
  ageMax: z.number().int().min(0).optional().nullable(),
  sexo: z.nativeEnum(Sexo).optional().nullable(),
  
  // Product-specific fields
  productType: z.string().optional().nullable(),
  weightMin: z.number().min(0).optional().nullable(),
  weightMax: z.number().min(0).optional().nullable(),
  
  // Common fields
  maxEntries: z.number().int().min(0).optional().nullable(),
});

// Infer TypeScript type from Zod schema
type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  contestId: string;
  contestType: ContestType;
  initialData?: FormValues & { id: string };
  categoryId?: string;
}

export function CategoryForm({
  contestId,
  contestType,
  initialData,
  categoryId,
}: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      order: initialData?.order || 0,
      
      // Livestock-specific fields
      ageMin: initialData?.ageMin || null,
      ageMax: initialData?.ageMax || null,
      sexo: initialData?.sexo || null,
      
      // Product-specific fields
      productType: initialData?.productType || null,
      weightMin: initialData?.weightMin || null,
      weightMax: initialData?.weightMax || null,
      
      // Common fields
      maxEntries: initialData?.maxEntries || null,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      let url = `/api/contests/${contestId}/categories`;
      let method = "POST";

      if (categoryId) {
        url = `/api/contests/${contestId}/categories/${categoryId}`;
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
        throw new Error(errorData?.message || "Error al procesar la categoría");
      }

      toast.success(
        `Categoría ${categoryId ? "actualizada" : "creada"} correctamente`
      );
      router.push(`/dashboard/contests/${contestId}/categories`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al procesar la categoría");
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
                    <Input placeholder="Nombre de la categoría" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre de la categoría (ej. "Terneras", "Vacas Adultas", "Café de Especialidad")
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
                      placeholder="Descripción de la categoría"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción detallada de la categoría (opcional)
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

            {/* Livestock-specific fields */}
            {contestType === ContestType.LIVESTOCK && (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
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
                        <FormDescription>
                          Restricción de sexo para esta categoría (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ageMin"
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
                              const value = e.target.value === "" ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Edad mínima en días (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ageMax"
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
                              const value = e.target.value === "" ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Edad máxima en días (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Product-specific fields */}
            {(contestType === ContestType.COFFEE_PRODUCTS || contestType === ContestType.GENERAL_PRODUCTS) && (
              <>
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de producto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tipo de producto (ej. Café de especialidad, Queso artesanal)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Tipo específico de producto para esta categoría
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="weightMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Mínimo (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Peso mínimo en kg"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Peso mínimo en kg (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Máximo (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Peso máximo en kg"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Peso máximo en kg (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Common fields */}
            <FormField
              control={form.control}
              name="maxEntries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de entradas por participante</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Sin límite"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Número máximo de entradas por participante en esta categoría (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : categoryId
                ? "Actualizar categoría"
                : "Crear categoría"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}