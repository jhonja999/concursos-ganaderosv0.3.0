"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, ArrowLeft } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { CategoriesTable } from "@/components/tables/categories-table"

export default function CategoriesPage({ params }: { params: { contestId: string } }) {
  const router = useRouter()
  const [contest, setContest] = useState<any>(null)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contest
        const contestResponse = await fetch(`/api/contests/${params.contestId}`)
        if (!contestResponse.ok) throw new Error("Failed to fetch contest")
        const contestData = await contestResponse.json()
        setContest(contestData)
        
        // Fetch categories
        const categoriesResponse = await fetch(`/api/contests/${params.contestId}/categories`)
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [params.contestId])

  if (isLoading || !contest) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Categorías" text="Cargando datos..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Categorías - ${contest.name}`}
        text="Gestiona las categorías del concurso."
      >
        <div className="flex gap-2">
          <Link href={`/dashboard/contests/${params.contestId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al concurso
            </Button>
          </Link>
          <Link href={`/dashboard/contests/${params.contestId}/categories/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <CategoriesTable
        data={categories}
        contestId={params.contestId}
        contestType={contest.type}
      />
    </DashboardShell>
  )
}