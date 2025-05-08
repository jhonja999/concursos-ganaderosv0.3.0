"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
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

interface CategoriaData {
  id: string
  nombre: string
  descripcion: string | null
  orden: number
  sexo: "MACHO" | "HEMBRA" | null
  edadMinima: number | null
  edadMaxima: number | null
  concursoId: string
  _count: {
    ganado: number
  }
}

interface CategoriasTableProps {
  data: CategoriaData[]
  concursoId: string
  concursoSlug: string
}

export function CategoriasTable({ data, concursoId, concursoSlug }: CategoriasTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/concursos/categorias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al eliminar la categoría")
      }

      toast.success("Categoría eliminada correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar la categoría")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCategoriaToDelete(null)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Rango de Edad</TableHead>
            <TableHead>Ganado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No hay categorías registradas
              </TableCell>
            </TableRow>
          )}
          {data.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell>{categoria.orden}</TableCell>
              <TableCell className="font-medium">
                {categoria.nombre}
                {categoria.descripcion && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{categoria.descripcion}</p>
                )}
              </TableCell>
              <TableCell>
                {categoria.sexo ? (
                  <Badge variant={categoria.sexo === "MACHO" ? "default" : "secondary"}>
                    {categoria.sexo === "MACHO" ? "Macho" : "Hembra"}
                  </Badge>
                ) : (
                  <Badge variant="outline">Ambos</Badge>
                )}
              </TableCell>
              <TableCell>
                {categoria.edadMinima || categoria.edadMaxima ? (
                  <span>
                    {categoria.edadMinima ? `${categoria.edadMinima} días` : "Sin mínimo"}
                    {" - "}
                    {categoria.edadMaxima ? `${categoria.edadMaxima} días` : "Sin máximo"}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Sin restricción</span>
                )}
              </TableCell>
              <TableCell>{categoria._count.ganado}</TableCell>
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
                      <Link href={`/dashboard/concursos/${concursoSlug}/categorias/${categoria.id}/ganado`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver ganado
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/concursos/${concursoSlug}/categorias/${categoria.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setCategoriaToDelete(categoria.id)
                        setIsDeleteDialogOpen(true)
                      }}
                      disabled={categoria._count.ganado > 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la categoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoriaToDelete && handleDelete(categoriaToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
