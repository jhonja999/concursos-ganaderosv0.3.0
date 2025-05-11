"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";

// Define the schema for form validation
const formSchema = z.object({
  nombre: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  slug: z.string().min(3, {
    message: "El slug debe tener al menos 3 caracteres.",
  }),
  descripcion: z.string().optional(),
  fechaInicio: z.date({
    required_error: "La fecha de inicio es requerida.",
  }),
  fechaFin: z.date().optional(),
  companyId: z.string({
    required_error: "La compañía organizadora es requerida.",
  }),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
});

// Infer TypeScript type from Zod schema
type FormValues = z.infer<typeof formSchema>;

interface ConcursoFormProps {
  companies: {
    id: string;
    nombre: string;
  }[];
  initialData?: FormValues;
  concursoId?: string;
  slug?: string;
}

export function ConcursoForm({
  companies,
  initialData,
  concursoId,
  slug,
}: ConcursoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      slug: initialData?.slug || "",
      descripcion: initialData?.descripcion || "",
      fechaInicio: initialData?.fechaInicio || undefined,
      fechaFin: initialData?.fechaFin || undefined,
      companyId: initialData?.companyId || "",
      isFeatured: initialData?.isFeatured || false,
      isPublished: initialData?.isPublished || false,
    },
  });

  // Generar slug automáticamente al cambiar el nombre
  const watchNombre = form.watch("nombre");
  if (watchNombre && !form.getValues("slug")) {
    const slug = generateSlug(watchNombre);
    form.setValue("slug", slug);
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      let url = "/api/concursos";
      let method = "POST";

      if (concursoId) {
        // Si estamos editando y tenemos el slug, usamos la API basada en slug
        if (slug) {
          url = `/api/concursos/${slug}`;
        } else {
          // Fallback al endpoint basado en ID si no hay slug
          url = `/api/concursos/${concursoId}`;
        }
        method = "PATCH";
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
        throw new Error(errorData?.message || "Error al procesar el concurso");
      }

      const concurso = await response.json();

      toast.success(
        `Concurso ${concursoId ? "actualizado" : "creado"} correctamente`
      );
      router.push(`/dashboard/concursos/${concurso.slug}`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al procesar el concurso");
    } finally {
      setIsLoading(false);
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
                      <Input placeholder="Nombre del concurso" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre público del concurso
                    </FormDescription>
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
                      <Input placeholder="slug-del-concurso" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único generado automáticamente
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
                    <Textarea
                      placeholder="Descripción del concurso"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Información detallada del concurso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        {/* <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        /> para prhohibir seleccionar luego de la fecha actual*/}
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha en que inicia el concurso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de fin (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date <
                            (form.getValues("fechaInicio") ||
                              new Date(new Date().setHours(0, 0, 0, 0)))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha en que finaliza el concurso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compañía organizadora</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una compañía" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Compañía que organiza el concurso
                  </FormDescription>
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
                      <FormLabel className="text-base">Destacado</FormLabel>
                      <FormDescription>
                        Mostrar en secciones especiales
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                      <FormLabel className="text-base">Publicado</FormLabel>
                      <FormDescription>Visible en el sitio web</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : concursoId
                ? "Actualizar concurso"
                : "Crear nuevo concurso"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
