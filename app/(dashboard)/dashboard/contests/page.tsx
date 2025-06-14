"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContestsTable } from "@/components/tables/contests-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContestType, ContestStatus } from "@prisma/client"
import { useRouter, useSearchParams } from "next/navigation"

export default function ContestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isLoading, setIsLoading] = useState(true)
  const [contests, setContests] = useState([])
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true")

  useEffect(() => {
    const fetchContests = async () => {
      setIsLoading(true)
      
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (type) params.set("type", type)
      if (status) params.set("status", status)
      if (featured) params.set("featured", "true")
      
      try {
        const response = await fetch(`/api/contests?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch contests")
        
        const data = await response.json()
        setContests(data.contests)
      } catch (error) {
        console.error("Error fetching contests:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContests()
  }, [search, type, status, featured])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (featured) params.set("featured", "true")
    
    router.push(`/dashboard/contests?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setType("")
    setStatus("")
    setFeatured(false)
    router.push("/dashboard/contests")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Concursos" text="Gestiona todos los concursos del sistema.">
        <Link href="/dashboard/contests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Concurso
          </Button>
        </Link>
      </DashboardHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar concursos..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de concurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value={ContestType.LIVESTOCK}>Ganadero</SelectItem>
              <SelectItem value={ContestType.COFFEE_PRODUCTS}>Café</SelectItem>
              <SelectItem value={ContestType.GENERAL_PRODUCTS}>Productos Generales</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value={ContestStatus.DRAFT}>Borrador</SelectItem>
              <SelectItem value={ContestStatus.REGISTRATION_OPEN}>Inscripciones abiertas</SelectItem>
              <SelectItem value={ContestStatus.REGISTRATION_CLOSED}>Inscripciones cerradas</SelectItem>
              <SelectItem value={ContestStatus.JUDGING}>En evaluación</SelectItem>
              <SelectItem value={ContestStatus.COMPLETED}>Completado</SelectItem>
              <SelectItem value={ContestStatus.CANCELLED}>Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" className="h-9">
            Filtrar
          </Button>
          {(search || type || status || featured) && (
            <Button variant="ghost" size="sm" className="h-9" onClick={handleClearFilters}>
              Limpiar
            </Button>
          )}
        </form>
        <div className="text-sm text-muted-foreground">
          {contests.length} concurso{contests.length !== 1 ? "s" : ""} encontrado
          {contests.length !== 1 ? "s" : ""}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ContestsTable data={contests} />
      )}
    </DashboardShell>
  )
}