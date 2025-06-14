import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Award } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { SubmissionStatus } from "@prisma/client"

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

interface Submission {
  id: string
  title: string
  description: string | null
  status: SubmissionStatus
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
  participationId: string
  categoryId: string
  ganadoId: string | null
  participation: {
    user: {
      id: string
      nombre: string | null
      email: string
    }
  }
  category: {
    id: string
    name: string
  }
  media: {
    id: string
    url: string
  }[]
  ganado?: {
    id: string
    nombre: string
    slug: string
    raza: string | null
    sexo: string
  } | null
  _count: {
    scores: number
  }
}

interface SubmissionsTableProps {
  data: Submission[]
  contestId: string
  canEdit: boolean
  canJudge: boolean
}

export function SubmissionsTable({ data, contestId, canEdit, canJudge }: SubmissionsTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/contests/${contestId}/submissions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la inscripción")
      }

      toast.success("Inscripción eliminada correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar la inscripción")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSubmissionToDelete(null)
    }
  }

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Borrador
          </Badge>
        )
      case SubmissionStatus.SUBMITTED:
        return (
          <Badge className="bg-blue-500 text-white">
            Enviado
          </Badge>
        )
      case SubmissionStatus.UNDER_REVIEW:
        return (
          <Badge className="bg-yellow-500 text-white">
            En revisión
          </Badge>
        )
      case SubmissionStatus.JUDGED:
        return (
          <Badge className="bg-green-500 text-white">
            Evaluado
          </Badge>
        )
      case SubmissionStatus.DISQUALIFIED:
        return (
          <Badge className="bg-red-500 text-white">
            Descalificado
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
            <TableHead>Imagen</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Participante</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Evaluaciones</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No hay inscripciones registradas
              </TableCell>
            </TableRow>
          )}
          {data.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>
                {submission.media.length > 0 ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image
                      src={submission.media[0].url}
                      alt={submission.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : submission.ganado?.slug ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs">{submission.ganado.nombre.substring(0, 2)}</span>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs">N/A</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/contests/${contestId}/submissions/${submission.id}`}
                  className="hover:underline"
                >
                  {submission.title}
                </Link>
                {submission.ganado && (
                  <p className="text-xs text-muted-foreground">
                    {submission.ganado.nombre} - {submission.ganado.raza || "Sin raza"}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {submission.participation.user.nombre || submission.participation.user.email}
              </TableCell>
              <TableCell>{submission.category.name}</TableCell>
              <TableCell>{getStatusBadge(submission.status)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {submission._count.scores}
                </Badge>
              </TableCell>
              <TableCell>
                {submission.submittedAt
                  ? formatDate(submission.submittedAt)
                  : formatDate(submission.createdAt)}
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
                      <Link href={`/dashboard/contests/${contestId}/submissions/${submission.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    
                    {canEdit && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contests/${contestId}/submissions/${submission.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {canJudge && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contests/${contestId}/submissions/${submission.id}/judge`}>
                          <Award className="mr-2 h-4 w-4" />
                          Evaluar
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {canEdit && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSubmissionToDelete(submission.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          disabled={submission.status !== SubmissionStatus.DRAFT && !canEdit}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </>
                    )}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la inscripción y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submissionToDelete && handleDelete(submissionToDelete)}
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