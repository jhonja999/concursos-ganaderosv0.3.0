"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Award, Medal } from "lucide-react"
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Ganado {
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
  ganadoEnConcurso: {
    id: string
    posicion: number | null
    concurso: {
      id: string
      nombre: string
      slug: string
    }
  }[]
}

interface GanadoOverviewTableProps {
  data: Ganado[]
  totalItems: number
  currentPage: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
}

export function GanadoOverviewTable({
  data,
  totalItems,
  currentPage,
  pageSize,
  searchParams,
}: GanadoOverviewTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [ganadoToDelete, setGanadoToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const totalPages = Math.ceil(totalItems / pageSize)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/ganado/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el ganado")
      }

      toast.success("Ganado eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el ganado")
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

    return `/dashboard/ganado?${params.toString()}`
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
              <TableHead>Sexo</TableHead>
              <TableHead className="text-center">Puntaje</TableHead>
              <TableHead className="text-center">Concursos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay ganado registrado que coincida con los filtros
                </TableCell>
              </TableRow>
            )}
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.GanadoImage.length > 0 ? (
                    <div
                      className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-md"
                      onClick={() => handleImageClick(item.GanadoImage[0].image.url)}
                    >
                      <Image
                        src={item.GanadoImage[0].image.url || "/placeholder.svg"}
                        alt={item.nombre}
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
                  <Link href={`/dashboard/ganado/${item.slug}`} className="hover:underline">
                    {item.nombre}
                  </Link>
                  {item.numRegistro && <p className="text-xs text-muted-foreground">Reg: {item.numRegistro}</p>}
                </TableCell>
                <TableCell>{item.raza || "No especificada"}</TableCell>
                <TableCell>{item.establo || "No especificado"}</TableCell>
                <TableCell>
                  {item.criador
                    ? `${item.criador.nombre} ${item.criador.apellido || ""}`
                    : item.propietario || "No especificado"}
                </TableCell>
                <TableCell>
                  <Badge variant={item.sexo === "MACHO" ? "default" : "secondary"}>
                    {item.sexo === "MACHO" ? "Macho" : "Hembra"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {item.puntaje ? (
                    <span className="font-medium">{item.puntaje} pts</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-1">
                    {item.ganadoEnConcurso.length > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-pointer">
                              {item.ganadoEnConcurso.length}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 p-1">
                              {item.ganadoEnConcurso.map((concurso) => (
                                <div key={concurso.id} className="flex items-center gap-2 text-sm">
                                  {concurso.posicion && concurso.posicion <= 3 ? (
                                    <Medal className="h-4 w-4 text-amber-500" />
                                  ) : (
                                    <span className="w-4" />
                                  )}
                                  <span>{concurso.concurso.nombre}</span>
                                  {concurso.posicion && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {concurso.posicion}º
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
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
                        <Link href={`/ganado/${item.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/ganado/${item.id}/editar`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar ganado
                        </Link>
                      </DropdownMenuItem>
                      {item.ganadoEnConcurso.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">Concursos</DropdownMenuLabel>
                          {item.ganadoEnConcurso.slice(0, 3).map((concurso) => (
                            <DropdownMenuItem key={concurso.id} asChild>
                              <Link href={`/dashboard/ganado/${concurso.concurso.slug}/gestion`}>
                                <Award className="mr-2 h-4 w-4" />
                                {concurso.concurso.nombre}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          {item.ganadoEnConcurso.length > 3 && (
                            <DropdownMenuItem className="text-xs text-muted-foreground">
                              Y {item.ganadoEnConcurso.length - 3} más...
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setGanadoToDelete(item.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar ganado
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
        <Pagination className="mt-4">
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
        </Pagination>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro del ganado y todas sus participaciones en concursos.
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
    </>
  )
}
