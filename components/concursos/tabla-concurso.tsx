"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MoreHorizontal, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { calculateDaysFromBirth } from "@/lib/utils"

interface GanadoEnConcurso {
  id: string
  ganadoId: string
  concursoId: string
  posicion: number | null
  ganado: {
    id: string
    nombre: string
    slug: string
    numRegistro: string | null
    fechaNac: Date | null
    sexo: "MACHO" | "HEMBRA"
    raza: string | null
    establo: string | null
    propietario: string | null
    categoria: string | null
    subcategoria: string | null
    puntaje: number | null
    criador: {
      id: string
      nombre: string
      apellido: string | null
      empresa: string | null
    } | null
    GanadoImage: {
      id: string
      image: {
        url: string
      }
    }[]
  }
}

interface TablaConcursoProps {
  participantes: GanadoEnConcurso[]
}

export function TablaConcurso({ participantes }: TablaConcursoProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<GanadoEnConcurso>[] = [
    {
      accessorKey: "posicion",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Pos.
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const posicion = row.getValue("posicion") as number | null
        return posicion ? <Badge variant="outline">{posicion}</Badge> : "-"
      },
    },
    {
      accessorKey: "ganado.nombre",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Nombre
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const ganado = row.original.ganado
        const imageUrl =
          ganado.GanadoImage.length > 0 ? ganado.GanadoImage[0].image.url : "/placeholder.svg?height=40&width=40"

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md">
              <Image src={imageUrl || "/placeholder.svg"} alt={ganado.nombre} fill className="object-cover" />
            </div>
            <Link href={`/ganado/${ganado.slug}`} className="font-medium hover:underline">
              {ganado.nombre}
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: "ganado.numRegistro",
      header: "Registro",
      cell: ({ row }) => row.original.ganado.numRegistro || "-",
    },
    {
      accessorKey: "ganado.raza",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Raza
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => row.original.ganado.raza || "-",
    },
    {
      accessorKey: "ganado.categoria",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Categoría
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const categoria = row.original.ganado.categoria
        const subcategoria = row.original.ganado.subcategoria
        return (
          <div>
            {categoria || "-"}
            {subcategoria && <div className="text-xs text-muted-foreground">{subcategoria}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "ganado.fechaNac",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Edad
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const fechaNac = row.original.ganado.fechaNac
        if (!fechaNac) return "-"

        const dias = calculateDaysFromBirth(fechaNac)
        const años = Math.floor(dias / 365)
        const meses = Math.floor((dias % 365) / 30)

        return (
          <div>
            {años > 0 ? `${años} años` : ""}
            {meses > 0 ? ` ${meses} meses` : años === 0 ? `${Math.floor(dias)} días` : ""}
          </div>
        )
      },
    },
    {
      accessorKey: "propietario",
      header: "Propietario",
      cell: ({ row }) => {
        const ganado = row.original.ganado
        if (ganado.criador) {
          return `${ganado.criador.nombre} ${ganado.criador.apellido || ""}`
        }
        return ganado.propietario || "-"
      },
    },
    {
      accessorKey: "ganado.puntaje",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Puntaje
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const puntaje = row.original.ganado.puntaje
        return puntaje !== null ? `${puntaje} pts` : "-"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ganado = row.original.ganado

        return (
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
                <Link href={`/ganado/${ganado.slug}`}>Ver detalles</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/ganado/${ganado.id}`}>Editar</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: participantes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filtrar por nombre..."
          value={(table.getColumn("ganado.nombre")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("ganado.nombre")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay participantes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
