import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Sexo } from "@prisma/client"

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

interface CategoryData {
  id: string
  name: string
  description: string | null
  order: number
  ageMin: number | null
  ageMax: number | null
  sexo: Sexo | null
  productType: string | null
  weightMin: number | null
  weightMax: number | null
  maxEntries: number | null
  _count?: {
    submissions: number
  }
}

interface CategoriesTableProps {
  data: CategoryData[]
  contestId: string
  contestType: string
}

export function CategoriesTable({ data, contestId, contestType }: CategoriesTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/contests/${contestId}/categories/${id}`, {
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
      setCategoryToDelete(null)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Nombre</TableHead>
            {contestType === "LIVESTOCK" && (
              <>
                <TableHead>Sexo</TableHead>
                <TableHead>Rango de Edad</TableHead>
              </>
            )}
            {(contestType === "COFFEE_PRODUCTS" || contestType === "GENERAL_PRODUCTS") && (
              <>
                <TableHead>Tipo de Producto</TableHead>
                <TableHead>Rango de Peso</TableHead>
              </>
            )}
            <TableHead>Máx. Entradas</TableHead>
            <TableHead>Inscripciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={contestType === "LIVESTOCK" ? 7 : 6} className="text-center">
                No hay categorías registradas
              </TableCell>
            </TableRow>
          )}
          {data.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.order}</TableCell>
              <TableCell className="font-medium">
                {category.name}
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                )}
              </TableCell>
              
              {contestType === "LIVESTOCK" && (
                <>
                  <TableCell>
                    {category.sexo ? (
                      <Badge variant={category.sexo === "MACHO" ? "default" : "secondary"}>
                        {category.sexo === "MACHO" ? "Macho" : category.sexo === "HEMBRA" ? "Hembra" : "Sin restricción"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Ambos</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.ageMin || category.ageMax ? (
                      <span>
                        {category.ageMin ? `${category.ageMin} días` : "Sin mínimo"}
                        {" - "}
                        {category.ageMax ? `${category.ageMax} días` : "Sin máximo"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sin restricción</span>
                    )}
                  </TableCell>
                </>
              )}
              
              {(contestType === "COFFEE_PRODUCTS" || contestType === "GENERAL_PRODUCTS") && (
                <>
                  <TableCell>
                    {category.productType || <span className="text-muted-foreground">No especificado</span>}
                  </TableCell>
                  <TableCell>
                    {category.weightMin || category.weightMax ? (
                      <span>
                        {category.weightMin ? `${category.weightMin} kg` : "Sin mínimo"}
                        {" - "}
                        {category.weightMax ? `${category.weightMax} kg` : "Sin máximo"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sin restricción</span>
                    )}
                  </TableCell>
                </>
              )}
              
              <TableCell>
                {category.maxEntries || <span className="text-muted-foreground">Sin límite</span>}
              </TableCell>
              
              <TableCell>
                {category._count?.submissions || 0}
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
                      <Link href={`/dashboard/contests/${contestId}/categories/${category.id}/submissions`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver inscripciones
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contests/${contestId}/categories/${category.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setCategoryToDelete(category.id)
                        setIsDeleteDialogOpen(true)
                      }}
                      disabled={category._count?.submissions ? category._count.submissions > 0 : false}
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
              onClick={() => categoryToDelete && handleDelete(categoryToDelete)}
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