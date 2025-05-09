"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Filter, ArrowUpDown, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface GanadoOverviewHeaderProps {
  concursos: {
    id: string
    nombre: string
    slug: string
  }[]
  razas: string[]
  establos: string[]
  searchParams: {
    search?: string
    concursoId?: string
    raza?: string
    establo?: string
    sexo?: string
    orderBy?: string
    orderDir?: string
  }
}

export function GanadoOverviewHeader({ concursos, razas, establos, searchParams }: GanadoOverviewHeaderProps) {
  const router = useRouter()
  const params = useSearchParams()

  const [search, setSearch] = useState(searchParams.search || "")
  const [concursoId, setConcursoId] = useState(searchParams.concursoId || "")
  const [raza, setRaza] = useState(searchParams.raza || "")
  const [establo, setEstablo] = useState(searchParams.establo || "")
  const [sexo, setSexo] = useState(searchParams.sexo || "")
  const [orderBy, setOrderBy] = useState(searchParams.orderBy || "nombre")
  const [orderDir, setOrderDir] = useState(searchParams.orderDir || "asc")

  // Actualizar la URL cuando cambien los filtros
  useEffect(() => {
    const timeout = setTimeout(() => {
      const newParams = new URLSearchParams()

      if (search) newParams.set("search", search)
      if (concursoId) newParams.set("concursoId", concursoId)
      if (raza) newParams.set("raza", raza)
      if (establo) newParams.set("establo", establo)
      if (sexo) newParams.set("sexo", sexo)
      if (orderBy !== "nombre") newParams.set("orderBy", orderBy)
      if (orderDir !== "asc") newParams.set("orderDir", orderDir)

      const page = params.get("page")
      if (page && page !== "1") newParams.set("page", page)

      router.push(`/dashboard/ganado?${newParams.toString()}`)
    }, 500)

    return () => clearTimeout(timeout)
  }, [search, concursoId, raza, establo, sexo, orderBy, orderDir, router, params])

  const handleClearFilters = () => {
    setSearch("")
    setConcursoId("")
    setRaza("")
    setEstablo("")
    setSexo("")
    setOrderBy("nombre")
    setOrderDir("asc")
    router.push("/dashboard/ganado")
  }

  const handleExportCSV = () => {
    // Implementación de exportación a CSV
    alert("Exportación a CSV no implementada")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ganado..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {(concursoId || raza || establo || sexo) && <span className="ml-1 rounded-full bg-primary w-2 h-2" />}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Filtra el ganado por diferentes criterios</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="concurso">Concurso</Label>
                <Select value={concursoId} onValueChange={setConcursoId}>
                  <SelectTrigger id="concurso">
                    <SelectValue placeholder="Todos los concursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los concursos</SelectItem>
                    {concursos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">Raza</Label>
                <Select value={raza} onValueChange={setRaza}>
                  <SelectTrigger id="raza">
                    <SelectValue placeholder="Todas las razas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las razas</SelectItem>
                    {razas.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="establo">Establo</Label>
                <Select value={establo} onValueChange={setEstablo}>
                  <SelectTrigger id="establo">
                    <SelectValue placeholder="Todos los establos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los establos</SelectItem>
                    {establos.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={sexo} onValueChange={setSexo}>
                  <SelectTrigger id="sexo">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="MACHO">Machos</SelectItem>
                    <SelectItem value="HEMBRA">Hembras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="orderBy">Ordenar por</Label>
                <Select value={orderBy} onValueChange={setOrderBy}>
                  <SelectTrigger id="orderBy">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nombre">Nombre</SelectItem>
                    <SelectItem value="raza">Raza</SelectItem>
                    <SelectItem value="establo">Establo</SelectItem>
                    <SelectItem value="puntaje">Puntaje</SelectItem>
                    <SelectItem value="createdAt">Fecha de registro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDir">Dirección</Label>
                <Select value={orderDir} onValueChange={setOrderDir}>
                  <SelectTrigger id="orderDir">
                    <SelectValue placeholder="Dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascendente</SelectItem>
                    <SelectItem value="desc">Descendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar filtros
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button type="submit">Aplicar filtros</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("nombre")
                setOrderDir("asc")
              }}
            >
              Nombre (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("nombre")
                setOrderDir("desc")
              }}
            >
              Nombre (Z-A)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("raza")
                setOrderDir("asc")
              }}
            >
              Raza (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("raza")
                setOrderDir("desc")
              }}
            >
              Raza (Z-A)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("puntaje")
                setOrderDir("desc")
              }}
            >
              Puntaje (mayor a menor)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("puntaje")
                setOrderDir("asc")
              }}
            >
              Puntaje (menor a mayor)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("createdAt")
                setOrderDir("desc")
              }}
            >
              Más recientes primero
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOrderBy("createdAt")
                setOrderDir("asc")
              }}
            >
              Más antiguos primero
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Link href="/dashboard/ganado/nuevo">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Ganado
          </Button>
        </Link>
      </div>
    </div>
  )
}
