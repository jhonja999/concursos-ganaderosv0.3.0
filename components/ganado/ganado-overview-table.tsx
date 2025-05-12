"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

interface GanadoOverviewTableProps {
  ganado: any[]
}

export function GanadoOverviewTable({ ganado }: GanadoOverviewTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [ganadoToDelete, setGanadoToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
      // Recargar la página para actualizar la lista
      window.location.reload()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar el ganado")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Fecha Nac.</TableHead>
              <TableHead>Criador</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ganado.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay ganado registrado.
                </TableCell>
              </TableRow>
            ) : (
              ganado.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.GanadoImage && item.GanadoImage[0]?.image?.url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <Image
                          src={item.GanadoImage[0].image.url || "/placeholder.svg"}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <span className="text-xs text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/ganado/${item.slug}`} className="font-medium hover:underline">
                      {item.nombre}
                    </Link>
                  </TableCell>
                  <TableCell>{item.numRegistro || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={item.sexo === "MACHO" ? "default" : "secondary"}>
                      {item.sexo === "MACHO" ? "Macho" : "Hembra"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.raza || "-"}</TableCell>
                  <TableCell>
                    {item.fechaNac ? format(new Date(item.fechaNac), "dd/MM/yyyy", { locale: es }) : "-"}
                  </TableCell>
                  <TableCell>{item.criador ? item.criador.nombre : item.propietario || "-"}</TableCell>
                  <TableCell>
                    {item.isPublished ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Borrador
                      </Badge>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/ganado/${item.slug}/editar`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setGanadoToDelete(item.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este ganado de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => ganadoToDelete && handleDelete(ganadoToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
