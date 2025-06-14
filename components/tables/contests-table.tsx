import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Tag,
  Users,
  Award,
  Calendar,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { ContestStatus, ContestType } from "@prisma/client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

interface Contest {
  id: string
  name: string
  slug: string
  description: string | null
  type: ContestType
  status: ContestStatus
  registrationStart: Date
  registrationEnd: Date
  contestStart: Date
  contestEnd: Date
  resultsPublished: Date | null
  isPublic: boolean
  isFeatured: boolean
  company: {
    id: string
    nombre: string
    slug: string
  }
  _count: {
    participations: number
    submissions: number
  }
}

interface ContestsTableProps {
  data: Contest[]
}

export function ContestsTable({ data }: ContestsTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contestToDelete, setContestToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/contests/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el concurso")
      }

      toast.success("Concurso eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el concurso")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setContestToDelete(null)
    }
  }

  const getStatusBadge = (status: ContestStatus) => {
    switch (status) {
      case ContestStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Borrador
          </Badge>
        )
      case ContestStatus.REGISTRATION_OPEN:
        return (
          <Badge className="bg-green-500 text-white">
            Inscripciones abiertas
          </Badge>
        )
      case ContestStatus.REGISTRATION_CLOSED:
        return (
          <Badge className="bg-yellow-500 text-white">
            Inscripciones cerradas
          </Badge>
        )
      case ContestStatus.JUDGING:
        return (
          <Badge className="bg-blue-500 text-white">
            En evaluación
          </Badge>
        )
      case ContestStatus.COMPLETED:
        return (
          <Badge className="bg-purple-500 text-white">
            Completado
          </Badge>
        )
      case ContestStatus.CANCELLED:
        return (
          <Badge className="bg-red-500 text-white">
            Cancelado
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

  const getTypeBadge = (type: ContestType) => {
    switch (type) {
      case ContestType.LIVESTOCK:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Ganadero
          </Badge>
        )
      case ContestType.COFFEE_PRODUCTS:
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Café
          </Badge>
        )
      case ContestType.GENERAL_PRODUCTS:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Productos
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        )
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Compañía</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Participantes</TableHead>
            <TableHead>Inscripciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No hay concursos registrados
              </TableCell>
            </TableRow>
          )}
          {data.map((contest) => (
            <TableRow key={contest.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/contests/${contest.id}`}
                  className="hover:underline"
                >
                  {contest.name}
                </Link>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {contest.description || "Sin descripción"}
                </p>
              </TableCell>
              <TableCell>{getTypeBadge(contest.type)}</TableCell>
              <TableCell>{contest.company.nombre}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Reg: {formatDate(contest.registrationStart)} - {formatDate(contest.registrationEnd)}</span>
                  <span className="text-xs text-muted-foreground">Concurso: {formatDate(contest.contestStart)} - {formatDate(contest.contestEnd)}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(contest.status)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {contest._count.participations}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {contest._count.submissions}
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
                      <Link href={`/dashboard/contests/${contest.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/contests/${contest.id}/edit`}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/contests/${contest.id}/categories`}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Categorías
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/contests/${contest.id}/participants`}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Participantes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/contests/${contest.id}/submissions`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Inscripciones
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/contests/${contest.id}/results`}
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Resultados
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setContestToDelete(contest.id);
                        setIsDeleteDialogOpen(true);
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              concurso y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => contestToDelete && handleDelete(contestToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}