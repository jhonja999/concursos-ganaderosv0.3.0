import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Trash2, Mail } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

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

interface Judge {
  id: string
  assignedAt: Date
  judgeId: string
  contestId: string
  judge: {
    id: string
    nombre: string | null
    email: string
  }
}

interface JudgesTableProps {
  data: Judge[]
  contestId: string
}

export function JudgesTable({ data, contestId }: JudgesTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [judgeToDelete, setJudgeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (judgeId: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/contests/${contestId}/judges/${judgeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el juez")
      }

      toast.success("Juez eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el juez")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setJudgeToDelete(null)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Asignado el</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay jueces asignados
              </TableCell>
            </TableRow>
          )}
          {data.map((judge) => (
            <TableRow key={judge.id}>
              <TableCell className="font-medium">
                {judge.judge.nombre || "Sin nombre"}
              </TableCell>
              <TableCell>{judge.judge.email}</TableCell>
              <TableCell>{formatDate(judge.assignedAt)}</TableCell>
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
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `mailto:${judge.judge.email}`
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setJudgeToDelete(judge.judgeId)
                        setIsDeleteDialogOpen(true)
                      }}
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
              Esta acción eliminará al juez de este concurso. No podrá seguir evaluando inscripciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => judgeToDelete && handleDelete(judgeToDelete)}
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