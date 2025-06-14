"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ContestForm } from "@/components/forms/contest-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewContestPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companias?isPublished=true")
        if (!response.ok) throw new Error("Failed to fetch companies")
        
        const data = await response.json()
        setCompanies(data)
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCompanies()
  }, [])

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Nuevo Concurso" text="Cargando datos..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  if (companies.length === 0) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Nuevo Concurso" text="Crea un nuevo concurso." />
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No hay compañías disponibles. Debes crear al menos una compañía antes de crear un concurso.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Link href="/dashboard/contests">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Link href="/dashboard/companias/nuevo">
            <Button>Crear Compañía</Button>
          </Link>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Nuevo Concurso" text="Crea un nuevo concurso." />
      <div className="grid gap-10">
        <ContestForm companies={companies} />
      </div>
    </DashboardShell>
  )
}