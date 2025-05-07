import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { Check, X } from "lucide-react"

export async function RecentConcursos() {
  const concursos = await prisma.concurso.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      ganadoEnConcurso: true,
    },
  })

  if (concursos.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium">No hay concursos recientes</h3>
        <p className="text-muted-foreground mt-2">Crea tu primer concurso para verlo aquí.</p>
        <Link href="/dashboard/concursos/new" className="mt-4 inline-block">
          <Button>Crear concurso</Button>
        </Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Compañía</TableHead>
          <TableHead>Fecha Inicio</TableHead>
          <TableHead>Participantes</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {concursos.map((concurso) => (
          <TableRow key={concurso.id}>
            <TableCell className="font-medium">{concurso.nombre}</TableCell>
            <TableCell>{concurso.company.nombre}</TableCell>
            <TableCell>{formatDate(concurso.fechaInicio)}</TableCell>
            <TableCell>{concurso.ganadoEnConcurso.length}</TableCell>
            <TableCell>
            <Badge
                className={`
                  flex items-center gap-1 text-black dark:text-black
                  ${concurso.isPublished 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-orange-400 hover:bg-orange-300"}
                `}
              >
                {concurso.isPublished ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {concurso.isPublished ? "Publicado" : "Borrador"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/concursos/${concurso.id}`}>
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