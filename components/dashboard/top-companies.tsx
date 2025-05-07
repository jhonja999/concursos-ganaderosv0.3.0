import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { Check, X } from "lucide-react"

export async function TopCompanies() {
  const companies = await prisma.company.findMany({
    take: 5,
    include: {
      concursos: true,
    },
    orderBy: {
      concursos: {
        _count: "desc",
      },
    },
  })

  if (companies.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium">No hay compañías registradas</h3>
        <p className="text-muted-foreground mt-2">Crea tu primera compañía para verla aquí.</p>
        <Link href="/dashboard/companies/new" className="mt-4 inline-block">
          <Button>Crear compañía</Button>
        </Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Concursos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium">{company.nombre}</TableCell>
            <TableCell>{company.concursos.length}</TableCell>
            <TableCell>
            <Badge
                className={`
                  flex items-center gap-1 text-black dark:text-black
                  ${company.isPublished 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-orange-400 hover:bg-orange-300"}
                `}
              >
                {company.isPublished ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {company.isPublished ? "Publicado" : "Borrador"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/companies/${company.id}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/90"
                >
                  Ver detalles
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}