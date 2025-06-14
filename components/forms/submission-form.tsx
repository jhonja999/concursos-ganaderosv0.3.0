import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { SubmissionStatus, ContestType } from "@prisma/client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the schema for form validation
const formSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  description: z.string().optional(),
  categoryId: z.string({
    required_error: "La categoría es requerida.",
  }),
  ganadoId: z.string().optional(),
  status: z.nativeEnum(SubmissionStatus).optional(),
  
  // Metadata fields for different contest types
  // Livestock
  breed: z.string().optional(),
  age: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  
  // Coffee
  variety: z.string().optional(),
  process: z.string().optional(),
  altitude: z.number().min(0).optional(),
  harvestDate: z.string().optional(),
  
  // General products
  ingredients: z.string().optional(),
  productionDate: z.string().optional(),
  expiryDate: z.string().optional(),
  certifications: z.string().optional(),
});

// Infer TypeScript type from Zod schema
type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface Ganado {
  id: string;
  nombre: string;
  raza?: string;
  sexo: string;
}

interface SubmissionFormProps {
  contestId: string;
  contestType: ContestType;
  categories: Category[];
  ganado?: Ganado[];
  initialData?: Partial<FormValues> & { id?: string };
  submissionId?: string;
  participationId: string;
}

export function SubmissionForm({
  contestId,
  contestType,
  categories,
  ganado = [],
  initialData,
  submissionId,
  participationId,
}: SubmissionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      ganadoId: initialData?.ganadoId || "",
      status: initialData?.status || SubmissionStatus.DRAFT,
      
      // Metadata fields
      breed: initialData?.breed || "",
      age: initialData?.age || undefined,
      weight: initialData?.weight || undefined,
      height: initialData?.height || undefined,
      variety: initialData?.variety || "",
      process: initialData?.process || "",
      altitude: initialData?.altitude || undefined,
      harvestDate: initialData?.harvestDate || "",
      ingredients: initialData?.ingredients || "",
      productionDate: initialData?.productionDate || "",
      expiryDate: initialData?.expiryDate || "",
      certifications: initialData?.certifications || "",
    },
  });

  // Watch for category changes to update form fields
  const watchCategory = form.watch("categoryId");
  const watchGanado = form.watch("ganadoId");

  // Fetch ganado details when selected
  useEffect(() => {
    if (watchGanado && contestType === ContestType.LIVESTOCK) {
      const selectedGanado = ganado.find(g => g.id === watchGanado);
      if (selectedGanado) {
        form.setValue("breed", selectedGanado.raza || "");
        // You could also set other fields based on the ganado data
      }
    }
  }, [watchGanado, ganado, form, contestType]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      // Prepare metadata based on contest type
      let metadata: any = {};
      
      if (contestType === ContestType.LIVESTOCK) {
        metadata = {
          breed: data.breed,
          age: data.age,
          weight: data.weight,
          height: data.height,
        };
      } else if (contestType === ContestType.COFFEE_PRODUCTS) {
        metadata = {
          variety: data.variety,
          process: data.process,
          altitude: data.altitude,
          harvestDate: data.harvestDate,
        };
      } else if (contestType === ContestType.GENERAL_PRODUCTS) {
        metadata = {
          ingredients: data.ingredients,
          productionDate: data.productionDate,
          expiryDate: data.expiryDate,
          certifications: data.certifications,
        };
      }

      const submissionData = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        ganadoId: data.ganadoId || undefined,
        status: data.status,
        metadata,
      };

      let url = `/api/contests/${contestId}/submissions`;
      let method = "POST";

      if (submissionId) {
        url = `/api/contests/${contestId}/submissions/${submissionId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al procesar la inscripción");
      }

      const submission = await response.json();

      toast.success(
        `Inscripción ${submissionId ? "actualizada" : "creada"} correctamente`
      );
      
      if (submissionId) {
        router.push(`/dashboard/contests/${contestId}/submissions/${submissionId}`);
      } else {
        router.push(`/dashboard/contests/${contestId}/submissions/${submission.id}`);
      }
      
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al procesar la inscripción");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="details">Detalles Específicos</TabsTrigger>
                {submissionId && (
                  <TabsTrigger value="status">Estado</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="general" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título de la inscripción" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre o título de su participación
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
                          placeholder="Descripción de la inscripción"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Descripción detallada de su participación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categoría en la que desea participar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {contestType === ContestType.LIVESTOCK && ganado.length > 0 && (
                  <FormField
                    control={form.control}
                    name="ganadoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ganado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un ganado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Ninguno (crear nuevo)</SelectItem>
                            {ganado.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.nombre} - {g.raza || "Sin raza"} ({g.sexo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Seleccione un ganado existente o deje en blanco para crear uno nuevo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-6 pt-4">
                {/* Livestock-specific fields */}
                {contestType === ContestType.LIVESTOCK && (
                  <>
                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raza</FormLabel>
                          <FormControl>
                            <Input placeholder="Raza del ganado" {...field} />
                          </FormControl>
                          <FormDescription>
                            Raza o tipo de ganado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Edad (meses)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="Edad en meses"
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={0.1}
                                placeholder="Peso en kg"
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura (cm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={0.1}
                                placeholder="Altura en cm"
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Coffee-specific fields */}
                {contestType === ContestType.COFFEE_PRODUCTS && (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="variety"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variedad</FormLabel>
                            <FormControl>
                              <Input placeholder="Variedad de café" {...field} />
                            </FormControl>
                            <FormDescription>
                              Variedad o tipo de café
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="process"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proceso</FormLabel>
                            <FormControl>
                              <Input placeholder="Proceso de beneficio" {...field} />
                            </FormControl>
                            <FormDescription>
                              Método de procesamiento (lavado, natural, honey, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="altitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altitud (msnm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="Altitud en metros"
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="harvestDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de cosecha</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* General products fields */}
                {contestType === ContestType.GENERAL_PRODUCTS && (
                  <>
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredientes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Lista de ingredientes"
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Lista detallada de ingredientes utilizados
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="productionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de producción</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de caducidad</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificaciones</FormLabel>
                          <FormControl>
                            <Input placeholder="Certificaciones del producto" {...field} />
                          </FormControl>
                          <FormDescription>
                            Certificaciones o sellos de calidad (orgánico, comercio justo, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>

              {submissionId && (
                <TabsContent value="status" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={SubmissionStatus.DRAFT}>Borrador</SelectItem>
                            <SelectItem value={SubmissionStatus.SUBMITTED}>Enviado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Estado actual de la inscripción
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Guardando..."
                  : submissionId
                  ? "Actualizar inscripción"
                  : "Crear inscripción"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}