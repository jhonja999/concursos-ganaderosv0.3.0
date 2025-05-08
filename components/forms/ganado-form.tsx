"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Check, ChevronsUpDown, Plus } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { generateSlug } from "@/lib/utils"

// Define the form schema with explicit types
// Define schema with required fields and defaults
const formSchema = z.object({
  nombre: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres.",
  }),
  slug: z.string().min(3, {
    message: "El slug debe tener al menos 3 caracteres.",
  }),
  numRegistro: z.string().optional(),
  fechaNac: z.date().optional(),
  diasNacida: z.number().optional(),
  sexo: z.enum(["MACHO", "HEMBRA"], {
    required_error: "El sexo es requerido.",
  }),
  raza: z.string().optional(),
  establo: z.string().optional(),
  propietario: z.string().optional(),
  criadorId: z.string().optional(),
  categoria: z.string().optional(), // Campo antiguo para compatibilidad
  subcategoria: z.string().optional(), // Campo antiguo para compatibilidad
  categoriaConcursoId: z.string().optional(), // Nuevo campo para categoría específica del concurso
  remate: z.boolean(), // Required boolean
  puntaje: z.number().optional(),
  descripcion: z.string().optional(),
  concursoId: z.string().optional(),
  isFeatured: z.boolean(), // Required boolean
  isPublished: z.boolean(), // Required boolean
})

const criadorFormSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es requerido" }),
  apellido: z.string().optional(),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  direccion: z.string().optional(),
})

// Export the types for use in the component
type FormValues = z.infer<typeof formSchema>
type CriadorFormValues = z.infer<typeof criadorFormSchema>

interface ConcursoCategoria {
  id: string
  nombre: string
  descripcion: string | null
  sexo: "MACHO" | "HEMBRA" | null
  edadMinima: number | null
  edadMaxima: number | null
}

interface GanadoFormProps {
  concursos: {
    id: string
    nombre: string
  }[]
  initialData?: FormValues
  ganadoId?: string
}

export function GanadoForm({ concursos, initialData, ganadoId }: GanadoFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [razas, setRazas] = useState<string[]>([])
  const [establos, setEstablos] = useState<string[]>([])
  const [propietarios, setPropietarios] = useState<string[]>([])
  const [criadores, setCriadores] = useState<{ id: string; nombre: string; empresa?: string }[]>([])
  const [categorias, setCategorias] = useState<string[]>([
    "Terneras",
    "Vaquillas",
    "Vacas",
    "Terneros",
    "Novillos",
    "Toros",
  ])
  const [categoriasConcurso, setCategoriasConcurso] = useState<ConcursoCategoria[]>([])
  const [openRaza, setOpenRaza] = useState(false)
  const [openEstablo, setOpenEstablo] = useState(false)
  const [openPropietario, setOpenPropietario] = useState(false)
  const [openCategoria, setOpenCategoria] = useState(false)
  const [openCriador, setOpenCriador] = useState(false)
  const [nuevoEstablo, setNuevoEstablo] = useState("")
  const [nuevoPropietario, setNuevoPropietario] = useState("")
  const [isNewCriadorDialogOpen, setIsNewCriadorDialogOpen] = useState(false)

  // Define form with explicit typing to ensure compatibility
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Use type assertion to bypass resolver type issues
    defaultValues: initialData || {
      nombre: "",
      slug: "",
      sexo: "MACHO" as const,
      remate: false,
      isFeatured: false,
      isPublished: false,
    },
  })

  const criadorForm = useForm<CriadorFormValues>({
    resolver: zodResolver(criadorFormSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      empresa: "",
      telefono: "",
      email: "",
      direccion: "",
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    async function fetchData() {
      try {
        // Cargar razas
        setRazas(["Holstein", "Jersey", "Angus", "Brahman", "Hereford"])

        // Cargar establos
        setEstablos(["Rancho Grande", "La Esperanza", "El Paraíso"])

        // Cargar propietarios (para compatibilidad)
        setPropietarios(["Juan Pérez", "María Rodríguez", "Carlos López"])

        // Cargar criadores desde la API
        const response = await fetch("/api/criadores")
        if (response.ok) {
          const data = await response.json()
          setCriadores(data)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    fetchData()
  }, [])

  // Cargar categorías específicas del concurso cuando se selecciona un concurso
  const watchConcursoId = form.watch("concursoId")
  useEffect(() => {
    async function fetchCategoriasConcurso() {
      if (!watchConcursoId) {
        setCategoriasConcurso([])
        return
      }

      try {
        const response = await fetch(`/api/concursos/${watchConcursoId}/categorias`)
        if (response.ok) {
          const data = await response.json()
          setCategoriasConcurso(data)
        }
      } catch (error) {
        console.error("Error al cargar categorías del concurso:", error)
      }
    }

    fetchCategoriasConcurso()
  }, [watchConcursoId])

  // Generar slug automáticamente al cambiar el nombre
  const watchNombre = form.watch("nombre")
  if (watchNombre && !form.getValues("slug")) {
    const slug = generateSlug(watchNombre)
    form.setValue("slug", slug)
  }

  // Calcular días nacida al cambiar la fecha de nacimiento
  const watchFechaNac = form.watch("fechaNac")
  useEffect(() => {
    if (watchFechaNac) {
      const diasNacida = differenceInDays(new Date(), watchFechaNac)
      form.setValue("diasNacida", diasNacida)
    }
  }, [watchFechaNac, form])

  // Filtrar categorías por sexo
  const watchSexo = form.watch("sexo")
  const categoriasFiltradas = categoriasConcurso.filter((cat) => cat.sexo === null || cat.sexo === watchSexo)

  // Filtrar categorías por edad
  const diasNacida = form.watch("diasNacida")
  const categoriasFiltradas2 = categoriasFiltradas.filter(
    (cat) =>
      (cat.edadMinima === null || (diasNacida !== undefined && diasNacida >= cat.edadMinima)) &&
      (cat.edadMaxima === null || (diasNacida !== undefined && diasNacida <= cat.edadMaxima)),
  )

  // Define submit handler with correct types that match what react-hook-form expects
  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      const url = ganadoId ? `/api/ganado/${ganadoId}` : "/api/ganado"
      const method = ganadoId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(`Error al ${ganadoId ? "actualizar" : "crear"} el ganado`)
      }

      toast.success(`Ganado ${ganadoId ? "actualizado" : "creado"} correctamente`)
      router.push("/dashboard/ganado")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(`Error al ${ganadoId ? "actualizar" : "crear"} el ganado`)
    } finally {
      setIsLoading(false)
    }
  }

  async function crearNuevoEstablo() {
    if (!nuevoEstablo) return

    try {
      // Simulamos la creación de un nuevo establo
      setEstablos([...establos, nuevoEstablo])
      form.setValue("establo", nuevoEstablo)
      setNuevoEstablo("")
      setOpenEstablo(false)
      toast.success("Establo creado correctamente")
    } catch (error) {
      console.error("Error al crear establo:", error)
      toast.error("Error al crear establo")
    }
  }

  async function crearNuevoPropietario() {
    if (!nuevoPropietario) return

    try {
      // Simulamos la creación de un nuevo propietario
      setPropietarios([...propietarios, nuevoPropietario])
      form.setValue("propietario", nuevoPropietario)
      setNuevoPropietario("")
      setOpenPropietario(false)
      toast.success("Propietario creado correctamente")
    } catch (error) {
      console.error("Error al crear propietario:", error)
      toast.error("Error al crear propietario")
    }
  }

  async function crearNuevoCriador(data: CriadorFormValues) {
    try {
      const response = await fetch("/api/criadores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", errorData)
        throw new Error("Error al crear el criador: " + (errorData.message || response.statusText))
      }

      const criador = await response.json()

      // Actualizar la lista de criadores
      setCriadores([...criadores, criador])

      // Seleccionar el nuevo criador en el formulario
      form.setValue("criadorId", criador.id)

      // Cerrar el diálogo
      setIsNewCriadorDialogOpen(false)
      criadorForm.reset()

      toast.success("Criador creado correctamente")
    } catch (error) {
      console.error("Error al crear criador:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear criador")
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
                      <Input placeholder="Nombre del ganado" {...field} />
                    </FormControl>
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
                      <Input placeholder="slug-del-ganado" {...field} />
                    </FormControl>
                    <FormDescription>Identificador único generado automáticamente</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="numRegistro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Registro</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de registro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaNac"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date(new Date().setHours(23, 59, 59, 999))}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1990}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="diasNacida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Nacido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Calculado automáticamente"
                        value={field.value || ""}
                        disabled
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Este valor se calcula automáticamente basado en la fecha de nacimiento.
                    </FormDescription>
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
                        <SelectItem value="MACHO">Macho</SelectItem>
                        <SelectItem value="HEMBRA">Hembra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="raza"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Raza</FormLabel>
                    <Popover open={openRaza} onOpenChange={setOpenRaza}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? razas.find((raza) => raza === field.value) : "Seleccionar o crear raza"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar raza..." />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron razas.
                              <Button
                                type="button"
                                variant="ghost"
                                className="mt-2 w-full justify-start"
                                onClick={() => {
                                  const value =
                                    document.querySelector<HTMLInputElement>('input[name="raza-search"]')?.value
                                  if (value) {
                                    setRazas([...razas, value])
                                    field.onChange(value)
                                    setOpenRaza(false)
                                  }
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Crear nueva raza
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {razas.map((raza) => (
                                <CommandItem
                                  key={raza}
                                  value={raza}
                                  onSelect={() => {
                                    field.onChange(raza)
                                    setOpenRaza(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${raza === field.value ? "opacity-100" : "opacity-0"}`}
                                  />
                                  {raza}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="establo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Establo</FormLabel>
                    <Popover open={openEstablo} onOpenChange={setOpenEstablo}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value
                              ? establos.find((establo) => establo === field.value)
                              : "Seleccionar o crear establo"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar establo..."
                            value={nuevoEstablo}
                            onValueChange={setNuevoEstablo}
                          />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron establos.
                              <Button
                                type="button"
                                variant="ghost"
                                className="mt-2 w-full justify-start"
                                onClick={crearNuevoEstablo}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Crear "{nuevoEstablo}"
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {establos.map((establo) => (
                                <CommandItem
                                  key={establo}
                                  value={establo}
                                  onSelect={() => {
                                    field.onChange(establo)
                                    setOpenEstablo(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${establo === field.value ? "opacity-100" : "opacity-0"}`}
                                  />
                                  {establo}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="propietario"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Propietario (Método Antiguo)</FormLabel>
                    <Popover open={openPropietario} onOpenChange={setOpenPropietario}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value
                              ? propietarios.find((prop) => prop === field.value)
                              : "Seleccionar o crear propietario"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar propietario..."
                            value={nuevoPropietario}
                            onValueChange={setNuevoPropietario}
                          />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron propietarios.
                              <Button
                                type="button"
                                variant="ghost"
                                className="mt-2 w-full justify-start"
                                onClick={crearNuevoPropietario}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Crear "{nuevoPropietario}"
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {propietarios.map((prop) => (
                                <CommandItem
                                  key={prop}
                                  value={prop}
                                  onSelect={() => {
                                    field.onChange(prop)
                                    setOpenPropietario(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${prop === field.value ? "opacity-100" : "opacity-0"}`}
                                  />
                                  {prop}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Método antiguo para compatibilidad. Preferiblemente use el selector de Criador.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criadorId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Criador (Recomendado)</FormLabel>
                    <div className="flex gap-2">
                      <Popover open={openCriador} onOpenChange={setOpenCriador}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value
                                ? criadores.find((c) => c.id === field.value)?.nombre || "Seleccionar criador"
                                : "Seleccionar criador"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar criador..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron criadores.</CommandEmpty>
                              <CommandGroup>
                                {criadores.map((criador) => (
                                  <CommandItem
                                    key={criador.id}
                                    value={criador.nombre}
                                    onSelect={() => {
                                      field.onChange(criador.id)
                                      setOpenCriador(false)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        criador.id === field.value ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {criador.nombre} {criador.empresa ? `(${criador.empresa})` : ""}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Dialog open={isNewCriadorDialogOpen} onOpenChange={setIsNewCriadorDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" type="button">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Crear Nuevo Criador</DialogTitle>
                            <DialogDescription>Ingresa los datos del nuevo criador o propietario.</DialogDescription>
                          </DialogHeader>
                          <Form {...criadorForm}>
                            <form onSubmit={criadorForm.handleSubmit(crearNuevoCriador)} className="space-y-4">
                              <FormField
                                control={criadorForm.control}
                                name="nombre"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nombre*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nombre del criador" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={criadorForm.control}
                                name="apellido"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Apellido del criador" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={criadorForm.control}
                                name="empresa"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Empresa</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Empresa o establecimiento" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={criadorForm.control}
                                  name="telefono"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Teléfono</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Teléfono de contacto" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={criadorForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Email de contacto" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={criadorForm.control}
                                name="direccion"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Dirección" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button type="submit">Crear Criador</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="concursoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concurso</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Limpiar la categoría de concurso al cambiar de concurso
                      form.setValue("categoriaConcursoId", undefined)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar concurso (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {concursos.map((concurso) => (
                        <SelectItem key={concurso.id} value={concurso.id}>
                          {concurso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Concurso al que pertenece este ganado (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchConcursoId ? (
              <FormField
                control={form.control}
                name="categoriaConcursoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría del Concurso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría del concurso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría</SelectItem>
                        {categoriasFiltradas2.length > 0 ? (
                          categoriasFiltradas2.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nombre}
                              {cat.sexo && (
                                <Badge variant={cat.sexo === "MACHO" ? "default" : "secondary"} className="ml-2">
                                  {cat.sexo === "MACHO" ? "Macho" : "Hembra"}
                                </Badge>
                              )}
                              {(cat.edadMinima || cat.edadMaxima) && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {cat.edadMinima ? `${cat.edadMinima} días` : ""}
                                  {cat.edadMinima && cat.edadMaxima ? " - " : ""}
                                  {cat.edadMaxima ? `${cat.edadMaxima} días` : ""}
                                </span>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No hay categorías disponibles para este sexo/edad
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categoría específica del concurso seleccionado. Solo se muestran categorías compatibles con el
                      sexo y edad del ganado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Categoría (General)</FormLabel>
                      <Popover open={openCategoria} onOpenChange={setOpenCategoria}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? categorias.find((cat) => cat === field.value) : "Seleccionar categoría"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar categoría..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                              <CommandGroup>
                                {categorias.map((cat) => (
                                  <CommandItem
                                    key={cat}
                                    value={cat}
                                    onSelect={() => {
                                      field.onChange(cat)
                                      setOpenCategoria(false)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${cat === field.value ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {cat}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Categoría general (solo se usa cuando no se selecciona un concurso)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <FormControl>
                        <Input placeholder="Subcategoría" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="puntaje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puntaje</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Puntaje"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Disponible para remate</FormLabel>
                      <FormDescription>Indicar si el ganado está disponible para remate</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
                    <Textarea placeholder="Descripción del ganado" className="min-h-32" {...field} />
                  </FormControl>
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
                      <FormDescription>Mostrar este ganado en secciones destacadas.</FormDescription>
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
                      <FormLabel className="text-base">Publicado</FormLabel>
                      <FormDescription>Hacer visible este ganado en el sitio.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : ganadoId ? "Actualizar ganado" : "Crear ganado"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
