import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { BarChart3, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardNav } from "@/components/dashboard/layout/DashboardNav"
import { UserNav } from "@/components/dashboard/layout/UserNav"
import { SidebarToggle } from "@/components/dashboard/layout/SidebarToggle"
import { requireAdmin } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }
  
  // Ensure only admins can access the dashboard
  await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col bg-muted/5">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-full">
                <DashboardNav />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5 text-primary md:hidden" />
            <span className="text-lg">Sistema de Gestión</span>
          </div>
          
          <div className="ml-auto flex items-center">
            <UserNav />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Navigation with Collapsible */}
        {/* <aside className="hidden md:block h-[calc(100vh-4rem)]"> */}
        <aside className="hidden md:block h-auto">
          <SidebarToggle>
            <DashboardNav />
          </SidebarToggle>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}