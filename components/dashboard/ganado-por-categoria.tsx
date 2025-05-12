import Link from "next/link";
import { Ganado, GanadoPorCategoriaProps } from "@/types/ganado";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";

export function GanadoPorCategoria({ 
  categoria, 
  machos, 
  hembras, 
  concursoId, 
  concursoSlug 
}: GanadoPorCategoriaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            {categoria.nombre}
            {categoria.sexo && (
              <Badge variant={categoria.sexo === "MACHO" ? "default" : "secondary"} className="ml-2">
                {categoria.sexo === "MACHO" ? "Macho" : "Hembra"}
              </Badge>
            )}
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            {categoria.edadMinima && categoria.edadMaxima ? (
              `${categoria.edadMinima} - ${categoria.edadMaxima} días`
            ) : categoria.edadMinima ? (
              `Min. ${categoria.edadMinima} días`
            ) : categoria.edadMaxima ? (
              `Max. ${categoria.edadMaxima} días`
            ) : null}
          </div>
        </CardTitle>
        {categoria.descripcion && <p className="text-sm text-muted-foreground">{categoria.descripcion}</p>}
      </CardHeader>
      <CardContent>
        {/* Sección de machos */}
        {machos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Badge variant="default" className="mr-2">
                Machos
              </Badge>
              <span>{machos.length} ejemplar(es)</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {machos.map((ganado) => (
                <GanadoCard 
                  key={ganado.id} 
                  ganado={ganado} 
                  concursoSlug={concursoSlug} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Sección de hembras */}
        {hembras.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Badge variant="secondary" className="mr-2">
                Hembras
              </Badge>
              <span>{hembras.length} ejemplar(es)</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hembras.map((ganado) => (
                <GanadoCard 
                  key={ganado.id} 
                  ganado={ganado} 
                  concursoSlug={concursoSlug}
                />
              ))}
            </div>
          </div>
        )}

        {machos.length === 0 && hembras.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No hay ganado asignado a esta categoría
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GanadoCardProps {
  ganado: Ganado;
  concursoSlug: string;
}

function GanadoCard({ ganado, concursoSlug }: GanadoCardProps) {
  // Obtener la imagen principal si existe
  const imagenPrincipal = ganado.GanadoImage.find(img => img.principal)?.image.url;
  
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-muted">
        {imagenPrincipal ? (
          <img 
            src={imagenPrincipal} 
            alt={ganado.nombre} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold truncate">{ganado.nombre}</h4>
        <p className="text-sm text-muted-foreground mb-2 truncate">
          {ganado.establo || ganado.propietario || (ganado.criador ? ganado.criador.nombre : "")}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {ganado.puntaje && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              {ganado.puntaje} pts
            </Badge>
          )}
          {ganado.isGanadora && (
            <Badge className="bg-yellow-500">
              Ganadora
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={`/ganado/${ganado.slug}`}>
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Link>
          </Button>
          <Button asChild size="sm" variant="default" className="w-full">
            <Link href={`/dashboard/ganado/editar/${ganado.slug}`}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}