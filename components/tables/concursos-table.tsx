"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Tag,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Concurso {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  fechaInicio: Date;
  fechaFin: Date | null;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  company: {
    nombre: string;
  };
  _count: {
    ganadoEnConcurso: number;
    categorias: number;
  };
}

interface ConcursosTableProps {
  data: Concurso[];
}

export function ConcursosTable({ data }: ConcursosTableProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [concursoToDelete, setConcursoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/concursos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el concurso");
      }

      toast.success("Concurso eliminado correctamente");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el concurso");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setConcursoToDelete(null);
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Compañía</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Destacado</TableHead>
            <TableHead>Participantes</TableHead>
            <TableHead>Categorías</TableHead>
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
          {data.map((concurso) => (
            <TableRow key={concurso.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/concursos/${concurso.slug}`}
                  className="hover:underline"
                >
                  {concurso.nombre}
                </Link>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {concurso.descripcion || "Sin descripción"}
                </p>
              </TableCell>
              <TableCell>{concurso.company.nombre}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{formatDate(concurso.fechaInicio)}</span>
                  {concurso.fechaFin && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(concurso.fechaFin)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {concurso.isPublished ? (
                  <Badge className="flex items-center gap-1 text-black dark:text-black bg-green-500 hover:bg-green-400">
                    <Check className="h-3 w-3" /> Publicado
                  </Badge>
                ) : (
                  <Badge className="flex items-center gap-1 text-black dark:text-black bg-orange-400 hover:bg-orange-300">
                    <X className="h-3 w-3" /> Borrador
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {concurso.isFeatured ? (
                  <Badge
                    variant="secondary"
                    className="text-black dark:text-black bg-cyan-600 hover:bg-cyan-400/80"
                  >
                    <Check className="mr-1 h-3 w-3" /> Destacado
                  </Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {concurso._count.ganadoEnConcurso}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{concurso._count.categorias}</Badge>
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
                      <Link href={`/dashboard/concursos/${concurso.slug}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/concursos/${concurso.slug}/editar`}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/concursos/${concurso.slug}/categorias`}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Categorías
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setConcursoToDelete(concurso.id);
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
              onClick={() => concursoToDelete && handleDelete(concursoToDelete)}
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
