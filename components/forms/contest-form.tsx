import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { ContestType, ContestStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { generateSlug } from "@/lib/utils"

// Define the schema for form validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  slug: z.string().min(3, {
    message: "El slug debe tener al menos 3 caracteres.",
  }),
  description: z.string().optional(),
  type: z.nativeEnum(ContestType, {
    required_error: "El tipo de concurso es requerido.",
  }),
  registrationStart: z.date({
    required_error: "La fecha de inicio de registro es requerida.",
  }),
  registrationEnd: z.date({
    required_error: "La fecha de fin de registro es requerida.",
  }),
  contestStart: z.date({
    required_error: "La fecha de inicio del concurso es requerida.",
  }),
  contestEnd: z.date({
    required_error: "La fecha de fin del concurso es requerida.",
  }),
  maxParticipants: z.number().int().positive().optional(),
  entryFee: z.number().min(0).optional(),
  rules: z.string().optional(),
  prizes: z.string().optional(),
  isPublic: z.boolean(),
  isFeatured: z.boolean(),
  bannerImage: z.string().optional(),
  companyId: z.string({
    required_error: "La compañía organizadora es requerida.",
  }),
  status: z.nativeEnum(ContestStatus).optional(),
});

// Infer TypeScript type from Zod schema
type FormValues = z.infer<typeof formSchema>;

interface ContestFormProps {
  companies: {
    id: string;
    nombre: string;
  }[];
  initialData?: FormValues;
  contestId?: string;
}

export function ContestForm({
  companies,
  initialData,
  contestId,
}: ContestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      type: initialData?.type || ContestType.LIVESTOCK,
      registrationStart: initialData?.registrationStart || new Date(),
      registrationEnd: initialData?.registrationEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      contestStart: initialData?.contestStart || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
      contestEnd: initialData?.contestEnd || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // +21 days
      maxParticipants: initialData?.maxParticipants || undefined,
      entryFee: initialData?.entryFee || 0,
      rules: initialData?.rules || "",
      prizes: initialData?.prizes || "",
      isPublic: initialData?.isPublic ?? true,
      isFeatured: initialData?.isFeatured || false,
      bannerImage: initialData?.bannerImage || "",
      companyId: initialData?.companyId || "",
      status: initialData?.status || ContestStatus.DRAFT,
    },
  });

  // Generate slug automatically when name changes
  const watchName = form.watch("name");
  if (watchName && !form.getValues("slug")) {
    const slug = generateSlug(watchName);
    form.setValue("slug", slug);
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      let url = "/api/contests";
      let method = "POST";

      if (contestId) {
        url = `/api/contests/${contestId}`;
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
        throw new Error(errorData?.message || "Error al procesar el concurso");
      }

      const contest = await response.json();

      toast.success(
        `Concurso ${contestId ? "actualizado" : "creado"} correctamente`
      );
      router.push(`/dashboard/contests/${contest.id}`);
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
                name="name"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de concurso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ContestType.LIVESTOCK}>Concurso Ganadero</SelectItem>
                      <SelectItem value={ContestType.COFFEE_PRODUCTS}>Concurso de Café</SelectItem>
                      <SelectItem value={ContestType.GENERAL_PRODUCTS}>Concurso de Productos Generales</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El tipo de concurso determina las categorías y criterios disponibles
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
                name="registrationStart"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Inicio de inscripciones</FormLabel>
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
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha en que inician las inscripciones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationEnd"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fin de inscripciones</FormLabel>
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
                          disabled={(date) =>
                            date <
                            (form.getValues("registrationStart") ||
                              new Date())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha en que finalizan las inscripciones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contestStart"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Inicio del concurso</FormLabel>
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
                          disabled={(date) =>
                            date <
                            (form.getValues("registrationEnd") ||
                              new Date())
                          }
                          initialFocus
                        />
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
                name="contestEnd"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fin del concurso</FormLabel>
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
                          disabled={(date) =>
                            date <
                            (form.getValues("contestStart") ||
                              new Date())
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

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de participantes (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Sin límite"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Límite de participantes (dejar vacío para sin límite)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuota de inscripción</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Costo de inscripción (0 para gratuito)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reglas del concurso</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reglas y requisitos del concurso"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Reglas detalladas para los participantes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premios</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de los premios"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detalle de los premios para los ganadores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen de banner</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL de la imagen para el banner del concurso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {contestId && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del concurso</FormLabel>
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
                        <SelectItem value={ContestStatus.DRAFT}>Borrador</SelectItem>
                        <SelectItem value={ContestStatus.REGISTRATION_OPEN}>Inscripciones abiertas</SelectItem>
                        <SelectItem value={ContestStatus.REGISTRATION_CLOSED}>Inscripciones cerradas</SelectItem>
                        <SelectItem value={ContestStatus.JUDGING}>En evaluación</SelectItem>
                        <SelectItem value={ContestStatus.COMPLETED}>Completado</SelectItem>
                        <SelectItem value={ContestStatus.CANCELLED}>Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Estado actual del concurso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Público</FormLabel>
                      <FormDescription>
                        Visible para todos los usuarios
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
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Destacado</FormLabel>
                      <FormDescription>
                        Mostrar en secciones destacadas
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
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : contestId
                ? "Actualizar concurso"
                : "Crear nuevo concurso"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}