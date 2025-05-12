import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Tag, Calendar, Building, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

// Definición de tipos basada en el modelo Prisma
export interface GanadoCardProps {
  animal: {
    id: string;
    nombre: string;
    slug: string;
    fechaNac?: Date | null;
    categoria?: string | null;
    subcategoria?: string | null;
    establo?: string | null;
    remate?: boolean | null;
    propietario?: string | null;
    descripcion?: string | null;
    raza?: string | null;
    sexo: "MACHO" | "HEMBRA";
    numRegistro?: string | null;
    puntaje?: number | null;
    isFeatured: boolean;
    isPublished: boolean;
    isGanadora: boolean;
    premios: string[];
    criador?: {
      id: string;
      nombre: string;
      apellido?: string | null;
    } | null;
    categoriaConcurso?: {
      id: string;
      nombre: string;
    } | null;
    GanadoImage: Array<{
      image: {
        url: string;
      };
    }>;
  };
  featured?: boolean;
  className?: string;
}

// Colores por categoría
export const CATEGORY_COLORS = {
  dental: {
    border: "border-blue-400",
    header: "bg-blue-600",
    icon: "text-blue-600",
    text: "text-blue-900",
    badge: "bg-blue-100 text-blue-800",
  },
  ternera: {
    border: "border-green-400",
    header: "bg-green-600",
    icon: "text-green-600",
    text: "text-green-900",
    badge: "bg-green-100 text-green-800",
  },
  vaca: {
    border: "border-amber-400",
    header: "bg-amber-600",
    icon: "text-amber-600",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-800",
  },
  default: {
    border: "border-gray-400",
    header: "bg-gray-600",
    icon: "text-gray-600",
    text: "text-gray-900",
    badge: "bg-gray-100 text-gray-800",
  },
};

// Función para determinar la categoría principal basada en el nombre de la categoría
const getMainCategory = (
  categoria?: string | null
): "dental" | "ternera" | "vaca" | "default" => {
  if (!categoria) return "default";

  const lowerCategoria = categoria.toLowerCase();
  if (lowerCategoria.includes("diente") || lowerCategoria.includes("dental")) {
    return "dental";
  } else if (lowerCategoria.includes("ternera")) {
    return "ternera";
  } else if (lowerCategoria.includes("vaca")) {
    return "vaca";
  }
  return "default";
};

// Imágenes de placeholder
const PLACEHOLDER_IMAGES = ["https://plus.unsplash.com/premium_photo-1677850457281-772c39419991?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1533582602984-b531bfa8d66e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1691030658335-92a9debc0d17?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1699777927112-0bed7d4a4578?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1721312039545-a1a1d76457ab?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
 ];

const GanadoCard: React.FC<GanadoCardProps> = ({
  animal,
  featured = false,
  className = "",
}) => {
  // Determinar la categoría principal
  const mainCategory = getMainCategory(
    animal.categoria || animal.categoriaConcurso?.nombre
  );

  // Obtener el estilo según la categoría
  const style = CATEGORY_COLORS[mainCategory];

  // Seleccionar una imagen de placeholder aleatoria si no hay imagen
  const randomPlaceholder =
    PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

  // Obtener la URL de la imagen
  const imageUrl =
    animal.GanadoImage.length > 0
      ? animal.GanadoImage[0].image.url
      : randomPlaceholder;

  // Si es una tarjeta destacada (para la sección de destacados)
  if (featured) {
    return (
      <div
        className={`bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300 hover:shadow-2xl hover:translate-y-[-4px] ${className}`}
      >
        <div className="relative h-80">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={animal.nombre || "Ganado destacado"}
            className="object-cover"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
            <div className="p-6">
              <Badge className="mb-2 bg-green-600 hover:bg-green-700 text-white">
                {animal.isGanadora ? "Premiado" : "Destacado"}
              </Badge>
              <h3 className="text-2xl font-bold text-white">
                {animal.nombre || "Ejemplar destacado"}
              </h3>
            </div>
          </div>

          {/* Badges adicionales */}
          {animal.sexo && (
            <div className="absolute top-2 right-2 z-10">
              <Badge
                className={
                  animal.sexo === "MACHO"
                    ? "bg-blue-500 text-white"
                    : "bg-pink-500 text-white"
                }
              >
                {animal.sexo}
              </Badge>
            </div>
          )}

          {/* Número de registro flotante */}
          {animal.numRegistro && (
            <div className="absolute top-12 right-2 z-10">
              <Badge
                className={
                  animal.numRegistro === "S/N"
                    ? "bg-blue-500 text-white"
                    : "bg-pink-500 text-white"
                }
              >
                Registro #{animal.numRegistro}
              </Badge>
            </div>
          )}

          {animal.puntaje && (
            <div className="absolute top-12 left-2 z-10">
              <Badge className="bg-yellow-400 text-white">
                <Award size={14} className="mr-1" /> {animal.puntaje}
              </Badge>
            </div>
          )}

          {animal.remate !== undefined && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                className={
                  animal.remate
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }
              >
                {animal.remate ? "En Remate" : "No Disponible"}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-6">
          <p className="mb-4 text-white leading-relaxed">
            {animal.descripcion ||
              "Ejemplar de alta calidad genética y excelentes características físicas, que representa lo mejor de su raza en términos de producción y conformación."}
          </p>
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Tag className="h-5 w-5 text-white" />
              <span className="text-white font-medium">
                {animal.raza || "Raza no especificada"}
              </span>
            </div>
            {animal.premios && animal.premios.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-800/30 px-3 py-2 rounded-lg">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span className="text-white font-medium">
                  {animal.premios[0]}
                </span>
              </div>
            )}
            <Link href={`/ganado/${animal.slug}`}>
              <Button
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10 hover:border-white transition-colors duration-300"
              >
                Ver detalles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tarjeta normal (para la sección de todos los ejemplares)
  return (
    <div
      className={`relative h-full overflow-hidden rounded-xl border ${style.border} bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] hover:bg-white ${className}`}
    >
      {/* Badges */}
      <div className="absolute top-1 right-2 px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 bg-opacity-90 text-white z-10">
        {animal.sexo}
      </div>

        {/* Número de registro flotante */}
        {animal.numRegistro && (
            <div className="absolute top-12 right-2 z-10">
              <Badge
                className={
                  animal.numRegistro === "S/N"
                    ? "bg-blue-500 text-white"
                    : "bg-pink-500 text-white"
                }
              >
                Registro #{animal.numRegistro}
              </Badge>
            </div>
          )}

      {animal.puntaje && (
        <div className="absolute top-10 left-2 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-400 text-white bg-opacity-75 z-10">
          <Award size={14} className="inline-block mr-1" /> {animal.puntaje}
        </div>
      )}

      {animal.remate !== undefined && (
        <div
          className={`absolute top-1 left-2 px-2 py-1 rounded-full text-xs font-semibold opacity-80 z-10 ${
            animal.remate ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {animal.remate ? "En Remate" : "No Disponible"}
        </div>
      )}

      {/* Card Image with Glassmorphism effect on hover */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={animal.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          width={400}
          height={200}
        />

        {/* Glassmorphism overlay with description on hover */}
        {animal.descripcion && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="p-6 w-full max-w-full text-center">
              <p className="text-lg md:text-xl text-white font-medium leading-snug">
                {animal.descripcion}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Header */}
      <div className={`${style.header} text-white p-3`}>
        <h3 className="truncate text-sm sm:text-base font-semibold">
          {animal.nombre}
        </h3>
        <p className="text-xs">
          {animal.categoriaConcurso?.nombre ||
            animal.categoria ||
            animal.subcategoria ||
            "Sin categoría"}
        </p>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`bg-green-50 text-green-800 font-medium ${style.badge}`}
            >
              {animal.categoriaConcurso?.nombre ||
                animal.categoria ||
                "General"}
            </Badge>
            {animal.sexo && (
              <Badge
                className={
                  animal.sexo === "MACHO"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-pink-100 text-pink-800"
                }
              >
                {animal.sexo}
              </Badge>
            )}
            {animal.isFeatured && (
              <Badge className="bg-amber-100 text-amber-800">Destacado</Badge>
            )}
            {animal.isGanadora && (
              <Badge className="bg-purple-100 text-purple-800">Ganador</Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300">
            {animal.nombre}
          </h3>

          {animal.fechaNac && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Nacimiento: {formatDate(animal.fechaNac)}
              </span>
            </div>
          )}

          {(animal.criador || animal.propietario) && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {animal.criador
                  ? `${animal.criador.nombre} ${animal.criador.apellido || ""}`
                  : animal.propietario || "Propietario no especificado"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {animal.puntaje && (
              <span className="text-sm text-gray-600 font-medium">
                Puntaje: {animal.puntaje}/100
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="font-medium text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanadoCard;
