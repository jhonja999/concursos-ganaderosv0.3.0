import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GanadoGestionLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Gestión de Ganado" text="Cargando información del ganado para este concurso..." />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-64" />
          </CardTitle>
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="raza">Por Raza</TabsTrigger>
              <TabsTrigger value="establo">Por Establo</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-3 w-36 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-3 w-36 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-3 w-36 mt-2" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <div className="h-12 border-b px-4 flex items-center">
          <div className="grid grid-cols-8 w-full">
            <div className="col-span-1">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-1 text-center">
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="col-span-1 text-center">
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="col-span-1 text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          </div>
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b px-4 flex items-center">
            <div className="grid grid-cols-8 w-full">
              <div className="col-span-1">
                <Skeleton className="h-12 w-12 rounded-md" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="col-span-1 text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
              <div className="col-span-1 text-center">
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
              <div className="col-span-1 text-right">
                <Skeleton className="h-8 w-8 ml-auto rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
