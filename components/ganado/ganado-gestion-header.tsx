"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ConcursoCategoria {
  id: string
  nombre: string
  descripcion: string | null
  sexo: "MACHO" | "HEMBRA" | null
  edadMinima: number | null
  edadMaxima: number | null
}

interface GanadoGestionHeaderProps {
  concurso: {
    id: string
    nombre: string
    slug: string
  }
  razas: string[]
  establos: string[]
  searchParams: {
    search?: string
    raza?: string
    establo?: string
    orderBy?: string
    orderDir?: "asc" | "desc"
    page?: string
  }
  categoriasConcurso?: ConcursoCategoria[]
}

export function GanadoGestionHeader({
  concurso,
  razas,
  establos,
  searchParams,
  categoriasConcurso = [],
}: GanadoGestionHeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || "")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams as Record<string, string>)

    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }

    params.set("page", "1") // Reset to first page on new search
    router.push(`/dashboard/ganado/${concurso.slug}/gestion?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.set("page", "1") // Reset to first page on filter change
    router.push(`/dashboard/ganado/${concurso.slug}/gestion?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    if (searchParams.search) {
      params.set("search", searchParams.search)
    }
    router.push(`/dashboard/ganado/${concurso.slug}/gestion?${params.toString()}`)
  }

  const hasActiveFilters = searchParams.raza || searchParams.establo

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o número de registro..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <div className="flex gap-2">
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && <Badge className="ml-1">{countActiveFilters()}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>Filtra el ganado por diferentes criterios.</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Raza</Label>
                  <Select value={searchParams.raza || ""} onValueChange={(value) => handleFilterChange("raza", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las razas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las razas</SelectItem>
                      {razas.map((raza) => (
                        <SelectItem key={raza} value={raza}>
                          {raza}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Establo</Label>
                  <Select
                    value={searchParams.establo || ""}
                    onValueChange={(value) => handleFilterChange("establo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los establos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los establos</SelectItem>
                      {establos.map((establo) => (
                        <SelectItem key={establo} value={establo}>
                          {establo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" className="w-full mt-4" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link href={`/dashboard/ganado/nuevo?concursoId=${concurso.id}`}>
            <Button className="flex gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Añadir Ganado</span>
            </Button>
          </Link>
        </div>
      </div>

      {categoriasConcurso.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Categorías del Concurso</CardTitle>
            <CardDescription>Categorías disponibles para este concurso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categoriasConcurso.map((categoria) => (
                <Badge
                  key={categoria.id}
                  variant={categoria.sexo === "MACHO" ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  {categoria.nombre}
                  {categoria.sexo && <span className="ml-1 text-xs">({categoria.sexo === "MACHO" ? "M" : "H"})</span>}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  function countActiveFilters() {
    let count = 0
    if (searchParams.raza) count++
    if (searchParams.establo) count++
    return count
  }
}

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
