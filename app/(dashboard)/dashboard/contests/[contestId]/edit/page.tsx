"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ContestForm } from "@/components/forms/contest-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditContestPage({ params }: { params: { contestId: string } }) {
  const router = useRouter()
  const [contest, setContest] = useState<any>(null)
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contest
        const contestResponse = await fetch(`/api/contests/${params.contestId}`)
        if (!contestResponse.ok) throw new Error("Failed to fetch contest")
        const contestData = await contestResponse.json()
        setContest(contestData)
        
        // Fetch companies
        const companiesResponse = await fetch("/api/companias")
        if (!companiesResponse.ok) throw new Error("Failed to fetch companies")
        const companiesData = await companiesResponse.json()
        setCompanies(companiesData)
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
        <DashboardHeader heading="Editar Concurso" text="Cargando datos..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Editar Concurso: ${contest.name}`} text="Actualiza la información del concurso.">
        <Link href={`/dashboard/contests/${params.contestId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al concurso
          </Button>
        </Link>
      </DashboardHeader>
      
      <div className="grid gap-10">
        <ContestForm
          companies={companies}
          initialData={{
            name: contest.name,
            slug: contest.slug,
            description: contest.description || "",
            type: contest.type,
            registrationStart: new Date(contest.registrationStart),
            registrationEnd: new Date(contest.registrationEnd),
            contestStart: new Date(contest.contestStart),
            contestEnd: new Date(contest.contestEnd),
            maxParticipants: contest.maxParticipants,
            entryFee: contest.entryFee,
            rules: contest.rules || "",
            prizes: contest.prizes || "",
            isPublic: contest.isPublic,
            isFeatured: contest.isFeatured,
            bannerImage: contest.bannerImage || "",
            companyId: contest.companyId,
            status: contest.status,
          }}
          contestId={params.contestId}
        />
      </div>
    </DashboardShell>
  )
}