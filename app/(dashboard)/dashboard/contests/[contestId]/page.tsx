"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { ContestStatus, ContestType } from "@prisma/client"
import {
  Calendar,
  Users,
  Tag,
  Award,
  FileText,
  Edit,
  ArrowLeft,
  BarChart,
  Clock,
  Building,
  Trophy,
} from "lucide-react"

export default function ContestPage({ params }: { params: { contestId: string } }) {
  const router = useRouter()
  const [contest, setContest] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishingResults, setIsPublishingResults] = useState(false)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/contests/${params.contestId}`)
        if (!response.ok) throw new Error("Failed to fetch contest")
        
        const data = await response.json()
        setContest(data)
      } catch (error) {
        console.error("Error fetching contest:", error)
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/contests/${params.contestId}/stats`)
        if (!response.ok) throw new Error("Failed to fetch stats")
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContest()
    fetchStats()
  }, [params.contestId])

  const handlePublishResults = async () => {
    setIsPublishingResults(true)
    
    try {
      const response = await fetch(`/api/contests/${params.contestId}/results`, {
        method: "POST",
      })
      
      if (!response.ok) throw new Error("Failed to publish results")
      
      const data = await response.json()
      
      if (data.success) {
        setContest({
          ...contest,
          status: ContestStatus.COMPLETED,
          resultsPublished: data.resultsPublished,
        })
      }
      
      router.refresh()
    } catch (error) {
      console.error("Error publishing results:", error)
    } finally {
      setIsPublishingResults(false)
    }
  }

  const getStatusBadge = (status: ContestStatus) => {
    switch (status) {
      case ContestStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Borrador
          </Badge>
        )
      case ContestStatus.REGISTRATION_OPEN:
        return (
          <Badge className="bg-green-500 text-white">
            Inscripciones abiertas
          </Badge>
        )
      case ContestStatus.REGISTRATION_CLOSED:
        return (
          <Badge className="bg-yellow-500 text-white">
            Inscripciones cerradas
          </Badge>
        )
      case ContestStatus.JUDGING:
        return (
          <Badge className="bg-blue-500 text-white">
            En evaluación
          </Badge>
        )
      case ContestStatus.COMPLETED:
        return (
          <Badge className="bg-purple-500 text-white">
            Completado
          </Badge>
        )
      case ContestStatus.CANCELLED:
        return (
          <Badge className="bg-red-500 text-white">
            Cancelado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: ContestType) => {
    switch (type) {
      case ContestType.LIVESTOCK:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Ganadero
          </Badge>
        )
      case ContestType.COFFEE_PRODUCTS:
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Café
          </Badge>
        )
      case ContestType.GENERAL_PRODUCTS:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Productos
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        )
    }
  }

  if (isLoading || !contest) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Detalles del Concurso" text="Cargando información..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={contest.name} text="Gestiona los detalles del concurso.">
        <div className="flex gap-2">
          <Link href="/dashboard/contests">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a concursos
            </Button>
          </Link>
          <Link href={`/dashboard/contests/${params.contestId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar concurso
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Concurso</CardTitle>
            <CardDescription>Detalles generales del concurso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tipo:</span>
                  {getTypeBadge(contest.type)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Estado:</span>
                  {getStatusBadge(contest.status)}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Organizado por {contest.company.nombre}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inscripciones</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(contest.registrationStart)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(contest.registrationEnd)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concurso</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(contest.contestStart)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(contest.contestEnd)}</p>
                  </div>
                </div>
              </div>
              
              {contest.resultsPublished && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resultados publicados</p>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(contest.resultsPublished)}</p>
                  </div>
                </div>
              )}
              
              {contest.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="text-sm">{contest.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Resumen de participación</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Participantes</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stats.totalParticipants}</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Inscripciones</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stats.totalSubmissions}</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Categorías</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stats.totalCategories}</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">Jueces</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stats.totalJudges}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="submissions">Inscripciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/dashboard/contests/${params.contestId}/categories`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Tag className="mr-2 h-4 w-4" />
                      Gestionar Categorías
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/contests/${params.contestId}/participants`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Gestionar Participantes
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/contests/${params.contestId}/submissions`}>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Inscripciones
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/contests/${params.contestId}/judges`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Award className="mr-2 h-4 w-4" />
                      Gestionar Jueces
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/contests/${params.contestId}/criteria`}>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart className="mr-2 h-4 w-4" />
                      Criterios de Evaluación
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/contests/${params.contestId}/results`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="mr-2 h-4 w-4" />
                      Ver Resultados
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estado del Concurso</CardTitle>
                <CardDescription>Gestiona el estado actual del concurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado actual:</span>
                  {getStatusBadge(contest.status)}
                </div>
                
                <div className="space-y-2">
                  {contest.status === ContestStatus.DRAFT && (
                    <Button
                      className="w-full"
                      onClick={async () => {
                        const response = await fetch(`/api/contests/${params.contestId}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...contest,
                            status: ContestStatus.REGISTRATION_OPEN,
                          }),
                        })
                        
                        if (response.ok) {
                          setContest({
                            ...contest,
                            status: ContestStatus.REGISTRATION_OPEN,
                          })
                          router.refresh()
                        }
                      }}
                    >
                      Abrir Inscripciones
                    </Button>
                  )}
                  
                  {contest.status === ContestStatus.REGISTRATION_OPEN && (
                    <Button
                      className="w-full"
                      onClick={async () => {
                        const response = await fetch(`/api/contests/${params.contestId}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...contest,
                            status: ContestStatus.REGISTRATION_CLOSED,
                          }),
                        })
                        
                        if (response.ok) {
                          setContest({
                            ...contest,
                            status: ContestStatus.REGISTRATION_CLOSED,
                          })
                          router.refresh()
                        }
                      }}
                    >
                      Cerrar Inscripciones
                    </Button>
                  )}
                  
                  {contest.status === ContestStatus.REGISTRATION_CLOSED && (
                    <Button
                      className="w-full"
                      onClick={async () => {
                        const response = await fetch(`/api/contests/${params.contestId}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...contest,
                            status: ContestStatus.JUDGING,
                          }),
                        })
                        
                        if (response.ok) {
                          setContest({
                            ...contest,
                            status: ContestStatus.JUDGING,
                          })
                          router.refresh()
                        }
                      }}
                    >
                      Iniciar Evaluación
                    </Button>
                  )}
                  
                  {contest.status === ContestStatus.JUDGING && (
                    <Button
                      className="w-full"
                      onClick={handlePublishResults}
                      disabled={isPublishingResults}
                    >
                      {isPublishingResults ? "Publicando..." : "Publicar Resultados"}
                    </Button>
                  )}
                  
                  {contest.status !== ContestStatus.CANCELLED && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        const response = await fetch(`/api/contests/${params.contestId}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...contest,
                            status: ContestStatus.CANCELLED,
                          }),
                        })
                        
                        if (response.ok) {
                          setContest({
                            ...contest,
                            status: ContestStatus.CANCELLED,
                          })
                          router.refresh()
                        }
                      }}
                    >
                      Cancelar Concurso
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {contest.rules && (
            <Card>
              <CardHeader>
                <CardTitle>Reglas del Concurso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">{contest.rules}</div>
              </CardContent>
            </Card>
          )}
          
          {contest.prizes && (
            <Card>
              <CardHeader>
                <CardTitle>Premios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">{contest.prizes}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>Categorías definidas para este concurso</CardDescription>
              </div>
              <Link href={`/dashboard/contests/${params.contestId}/categories`}>
                <Button>
                  <Tag className="mr-2 h-4 w-4" />
                  Gestionar Categorías
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {contest.categories && contest.categories.length > 0 ? (
                <div className="space-y-4">
                  {contest.categories.slice(0, 5).map((category: any) => (
                    <div key={category.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                        )}
                      </div>
                      <Link href={`/dashboard/contests/${params.contestId}/categories/${category.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {contest.categories.length > 5 && (
                    <div className="text-center">
                      <Link href={`/dashboard/contests/${params.contestId}/categories`}>
                        <Button variant="link">Ver todas las categorías ({contest.categories.length})</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Tag className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium">No hay categorías</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Este concurso no tiene categorías definidas. Añade categorías para organizar las inscripciones.
                  </p>
                  <Link href={`/dashboard/contests/${params.contestId}/categories/new`}>
                    <Button>
                      Añadir Categoría
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participants" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Participantes</CardTitle>
                <CardDescription>Participantes registrados en este concurso</CardDescription>
              </div>
              <Link href={`/dashboard/contests/${params.contestId}/participants`}>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Participantes
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats && stats.totalParticipants > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-muted-foreground">Total Participantes</p>
                      <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-muted-foreground">Participantes por Estado</p>
                      <div className="mt-2 space-y-1">
                        {stats.participationsByStatus && Object.entries(stats.participationsByStatus).map(([status, count]: [string, any]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm">{status}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Link href={`/dashboard/contests/${params.contestId}/participants`}>
                      <Button variant="link">Ver todos los participantes</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium">No hay participantes</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Este concurso no tiene participantes registrados.
                  </p>
                  <Link href={`/dashboard/contests/${params.contestId}/participants`}>
                    <Button>
                      Gestionar Participantes
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inscripciones</CardTitle>
                <CardDescription>Inscripciones registradas en este concurso</CardDescription>
              </div>
              <Link href={`/dashboard/contests/${params.contestId}/submissions`}>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Inscripciones
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats && stats.totalSubmissions > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-muted-foreground">Total Inscripciones</p>
                      <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <p className="text-sm font-medium text-muted-foreground">Inscripciones por Estado</p>
                      <div className="mt-2 space-y-1">
                        {stats.submissionsByStatus && Object.entries(stats.submissionsByStatus).map(([status, count]: [string, any]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm">{status}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Link href={`/dashboard/contests/${params.contestId}/submissions`}>
                      <Button variant="link">Ver todas las inscripciones</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium">No hay inscripciones</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Este concurso no tiene inscripciones registradas.
                  </p>
                  <Link href={`/dashboard/contests/${params.contestId}/submissions`}>
                    <Button>
                      Ver Inscripciones
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}