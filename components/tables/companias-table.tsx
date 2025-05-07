"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Check, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

interface Company {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  logo: string | null
  isFeatured: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

interface CompaniasTableProps {
  data: Company[]
}

export function CompaniasTable({ data }: CompaniasTableProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/companias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la compañía")
      }

      toast.success("Compañía eliminada correctamente")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar la compañía")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCompanyToDelete(null)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Destacada</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No hay compañías registradas
              </TableCell>
            </TableRow>
          )}
          {data.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.nombre}</TableCell>
              <TableCell>
                {company.isPublished ? (
                  <Badge variant="default" className="text-black dark:text-black bg-green-500 hover:bg-green-600">
                    <Check className="mr-1 h-3 w-3" /> Publicada
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <X className="mr-1 h-3 w-3" /> Borrador
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {company.isFeatured ? (
                  <Badge variant="secondary" className="text-black dark:text-black bg-amber-400 hover:bg-amber-300">
                    <Check className="mr-1 h-3 w-3 " /> Destacada
                  </Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(company.createdAt)}</TableCell>
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
                      <Link href={`/companias/${company.slug}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/companias/${company.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setCompanyToDelete(company.id)
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la compañía y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => companyToDelete && handleDelete(companyToDelete)}
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
