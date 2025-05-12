"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Award } from "lucide-react"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GanadoPosicionForm } from "@/components/ganado/ganado-posicion-form"

interface ConcursoCategoria {
  id: string
  nombre: string
  descripcion: string | null
  sexo: "MACHO" | "HEMBRA" | null
  edadMinima: number | null
  edadMaxima: number | null
}

interface GanadoEnConcurso {
  id: string
  ganadoId: string
  concursoId: string
  posicion: number | null
  ganado: {
    id: string
    nombre: string
    slug: string
    numRegistro: string | null
    fechaNac: Date | null
    sexo: "MACHO" | "HEMBRA"
    raza: string | null
    establo: string | null
    propietario: string | null
    categoria: string | null
    subcategoria: string | null
    puntaje: number | null
    categoriaConcursoId: string | null
    criador: {
      id: string
      nombre: string
      apellido: string | null
      empresa: string | null
    } | null
    GanadoImage: {
      id: string
      image: {
        url: string
      }
    }[]
  }
}

interface GanadoTableProps {
  data: GanadoEnConcurso[]
  concursoSlug: string
  concursoId: string
  totalItems: number
  currentPage: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
  categoriasConcurso?: ConcursoCategoria[]
}

export function GanadoTable({
  data,
  concursoSlug,
  concursoId,
  totalItems,
  currentPage,
  pageSize,
  searchParams,
  categoriasConcurso = [],
}: GanadoTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [ganadoToDelete, setGanadoToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedGanado, setSelectedGanado] = useState<GanadoEnConcurso | null>(null)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const totalPages = Math.ceil(totalItems / pageSize)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      // Primero eliminamos la relación GanadoEnConcurso
      const response = await fetch(`/api/ganado/concurso/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el ganado del concurso")
      }

      toast.success("Ganado eliminado del concurso correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el ganado del concurso")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setGanadoToDelete(null)
    }
  }

  const handleImageClick = (url: string) => {
    setSelectedImage(url)
    setIsImageDialogOpen(true)
  }

  // Función para generar la URL de paginación
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams()

    // Mantener los parámetros de búsqueda y filtrado actuales
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value) {
        params.set(key, value.toString())
      }
    })

    // Añadir el nuevo número de página
    params.set("page", page.toString())

    return `/dashboard/ganado/${concursoSlug}/gestion?${params.toString()}`
  }

  // Función para obtener el nombre de la categoría
  const getCategoriaName = (categoriaId: string | null) => {
    if (!categoriaId) return "Sin categoría"
    const categoria = categoriasConcurso.find((cat) => cat.id === categoriaId)
    return categoria ? categoria.nombre : "Categoría desconocida"
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Establo</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-center">Posición</TableHead>
              <TableHead className="text-center">Puntaje</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay ganado registrado en este concurso
                </TableCell>
              </TableRow>
            )}
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.ganado.GanadoImage.length > 0 ? (
                    <div
                      className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-md"
                      onClick={() => handleImageClick(item.ganado.GanadoImage[0].image.url)}
                    >
                      <Image
                        src={item.ganado.GanadoImage[0].image.url || "/placeholder.svg"}
                        alt={item.ganado.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/ganado/${item.ganado.slug}`} className="hover:underline">
                    {item.ganado.nombre}
                  </Link>
                  {item.ganado.numRegistro && (
                    <p className="text-xs text-muted-foreground">Reg: {item.ganado.numRegistro}</p>
                  )}
                </TableCell>
                <TableCell>{item.ganado.raza || "No especificada"}</TableCell>
                <TableCell>{item.ganado.establo || "No especificado"}</TableCell>
                <TableCell>
                  {item.ganado.criador
                    ? `${item.ganado.criador.nombre} ${item.ganado.criador.apellido || ""}`
                    : item.ganado.propietario || "No especificado"}
                </TableCell>
                <TableCell>
                  {item.ganado.categoriaConcursoId ? (
                    <Badge variant="outline">{getCategoriaName(item.ganado.categoriaConcursoId)}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.posicion ? (
                    <Badge className="mx-auto">{item.posicion}º</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.ganado.puntaje ? (
                    <span className="font-medium">{item.ganado.puntaje} pts</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/ganado/${item.ganado.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/ganado/editar/${item.ganado.slug}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar ganado
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedGanado(item)}>
                        <Award className="mr-2 h-4 w-4" />
                        Asignar posición
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setGanadoToDelete(item.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar del concurso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? getPaginationUrl(currentPage - 1) : "#"}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={getPaginationUrl(i + 1)} isActive={currentPage === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? getPaginationUrl(currentPage + 1) : "#"}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el ganado de este concurso, pero no eliminará el registro del ganado del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => ganadoToDelete && handleDelete(ganadoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Imagen del ganado</DialogTitle>
            <DialogDescription>Vista ampliada de la imagen</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={selectedImage || "/placeholder.svg"} alt="Imagen ampliada" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedGanado && (
        <GanadoPosicionForm
          ganadoEnConcurso={selectedGanado}
          onClose={() => setSelectedGanado(null)}
          onSuccess={() => {
            setSelectedGanado(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
