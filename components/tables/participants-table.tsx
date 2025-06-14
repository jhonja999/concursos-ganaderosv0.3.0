import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Check, X } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { ParticipationStatus } from "@prisma/client"

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

interface Participant {
  id: string
  status: ParticipationStatus
  registeredAt: Date
  approvedAt: Date | null
  notes: string | null
  userId: string
  contestId: string
  user: {
    id: string
    nombre: string | null
    email: string
  }
  _count: {
    submissions: number
  }
}

interface ParticipantsTableProps {
  data: Participant[]
  contestId: string
}

export function ParticipantsTable({ data, contestId }: ParticipantsTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [participantToUpdate, setParticipantToUpdate] = useState<Participant | null>(null)
  const [newStatus, setNewStatus] = useState<ParticipationStatus | null>(null)
  const [statusNotes, setStatusNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/contests/${contestId}/participants/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el participante")
      }

      toast.success("Participante eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el participante")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setParticipantToDelete(null)
    }
  }

  const handleStatusUpdate = async () => {
    if (!participantToUpdate || !newStatus) return
    
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/contests/${contestId}/participants/${participantToUpdate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado")
      }

      toast.success("Estado actualizado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al actualizar el estado")
    } finally {
      setIsUpdating(false)
      setIsStatusDialogOpen(false)
      setParticipantToUpdate(null)
      setNewStatus(null)
      setStatusNotes("")
    }
  }

  const getStatusBadge = (status: ParticipationStatus) => {
    switch (status) {
      case ParticipationStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case ParticipationStatus.APPROVED:
        return (
          <Badge className="bg-green-500 text-white">
            <Check className="mr-1 h-3 w-3" /> Aprobado
          </Badge>
        )
      case ParticipationStatus.REJECTED:
        return (
          <Badge className="bg-red-500 text-white">
            <X className="mr-1 h-3 w-3" /> Rechazado
          </Badge>
        )
      case ParticipationStatus.WITHDRAWN:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Retirado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participante</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Inscripciones</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No hay participantes registrados
              </TableCell>
            </TableRow>
          )}
          {data.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell className="font-medium">
                {participant.user.nombre || participant.user.email}
                <p className="text-xs text-muted-foreground">
                  {participant.user.email}
                </p>
              </TableCell>
              <TableCell>{formatDate(participant.registeredAt)}</TableCell>
              <TableCell>{getStatusBadge(participant.status)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {participant._count.submissions}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {participant.notes || "-"}
                </p>
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
                      <Link href={`/dashboard/contests/${contestId}/participants/${participant.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setParticipantToUpdate(participant)
                        setNewStatus(ParticipationStatus.APPROVED)
                        setStatusNotes(participant.notes || "")
                        setIsStatusDialogOpen(true)
                      }}
                      disabled={participant.status === ParticipationStatus.APPROVED}
                    >
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Aprobar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setParticipantToUpdate(participant)
                        setNewStatus(ParticipationStatus.REJECTED)
                        setStatusNotes(participant.notes || "")
                        setIsStatusDialogOpen(true)
                      }}
                      disabled={participant.status === ParticipationStatus.REJECTED}
                    >
                      <X className="mr-2 h-4 w-4 text-red-500" />
                      Rechazar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setParticipantToDelete(participant.id)
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
              Esta acción no se puede deshacer. Se eliminará permanentemente el participante y todas sus inscripciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => participantToDelete && handleDelete(participantToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === ParticipationStatus.APPROVED ? "Aprobar" : "Rechazar"} participante
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === ParticipationStatus.APPROVED
                ? "Al aprobar, el participante podrá enviar inscripciones al concurso."
                : "Al rechazar, el participante no podrá enviar inscripciones al concurso."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="text-sm font-medium">
                  Notas (opcional)
                </label>
                <textarea
                  id="notes"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Añade notas o comentarios sobre esta decisión"
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              className={
                newStatus === ParticipationStatus.APPROVED
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
              disabled={isUpdating}
            >
              {isUpdating
                ? "Actualizando..."
                : newStatus === ParticipationStatus.APPROVED
                ? "Aprobar"
                : "Rechazar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}