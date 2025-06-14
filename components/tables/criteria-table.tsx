import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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

interface Criteria {
  id: string
  name: string
  description: string | null
  weight: number
  maxScore: number
  order: number
  contestId: string | null
  categoryId: string | null
  category?: {
    id: string
    name: string
  } | null
  _count?: {
    scores: number
  }
}

interface CriteriaTableProps {
  data: Criteria[]
  contestId: string
  categories: {
    id: string
    name: string
  }[]
}

export function CriteriaTable({ data, contestId, categories }: CriteriaTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [criteriaToDelete, setCriteriaToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/contests/${contestId}/criteria/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al eliminar el criterio")
      }

      toast.success("Criterio eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el criterio")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCriteriaToDelete(null)
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Todo el concurso"
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : "Categoría desconocida"
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Puntuación máxima</TableHead>
            <TableHead>Aplicado a</TableHead>
            <TableHead>Evaluaciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No hay criterios registrados
              </TableCell>
            </TableRow>
          )}
          {data.map((criteria) => (
            <TableRow key={criteria.id}>
              <TableCell>{criteria.order}</TableCell>
              <TableCell className="font-medium">
                {criteria.name}
                {criteria.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{criteria.description}</p>
                )}
              </TableCell>
              <TableCell>{criteria.weight.toFixed(1)}</TableCell>
              <TableCell>{criteria.maxScore}</TableCell>
              <TableCell>
                {criteria.categoryId ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {getCategoryName(criteria.categoryId)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    Todo el concurso
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {criteria._count?.scores || 0}
                </Badge>
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
                      <Link href={`/dashboard/contests/${contestId}/criteria/${criteria.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setCriteriaToDelete(criteria.id)
                        setIsDeleteDialogOpen(true)
                      }}
                      disabled={criteria._count?.scores ? criteria._count.scores > 0 : false}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente el criterio de evaluación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => criteriaToDelete && handleDelete(criteriaToDelete)}
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