import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  ChevronDown,
  Filter,
  Tag as TagIcon,
  Award as AwardIcon,
} from "lucide-react";
import GanadoCard from "@/components/ganado/GanadoCard.tsx";

export const metadata = {
  title: "Ganado Disponible",
  description: "Explora todo el ganado disponible en nuestros concursos",
};

export default async function GanadoPage() {
  const ganado = await prisma.ganado.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      GanadoImage: {
        include: { image: true },
        where: { principal: true },
        take: 1,
      },
      criador: true,
      categoriaConcurso: true,
    },
  });

  // Agrupar por razas y ordenar
  const ganadoPorRaza = ganado.reduce((acc, animal) => {
    const raza = animal.raza || "Sin clasificar";
    acc[raza] = acc[raza] || [];
    acc[raza].push(animal);
    return acc;
  }, {} as Record<string, typeof ganado>);

  const razasOrdenadas = Object.keys(ganadoPorRaza).sort((a, b) => {
    if (a === "Sin clasificar") return 1;
    if (b === "Sin clasificar") return -1;
    return a.localeCompare(b);
  });

  const ganadoDestacado = ganado.filter((a) => a.isFeatured).slice(0, 2);

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/landingImages/landscape.webp"
          alt="Landscape Background"
          className="w-full h-full object-cover"
          fill
          priority
        />
      </div>

      {/* Hero */}
      <header className="relative w-full h-64 flex items-center justify-center mb-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 text-center px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Ganado Disponible
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Ejemplares destacados del sector ganadero que representan la
            excelencia y sostenibilidad
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="default"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
            >
              Explorar ganado <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Destacados */}
      <section className="w-full py-20 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center text-white bg-black/50 backdrop-blur-sm py-4 rounded-lg shadow-lg">
            Ejemplares Destacados
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {ganadoDestacado.length > 0 ? (
              ganadoDestacado.map((animal) => (
                <Link
                  key={animal.id}
                  href={`/ganado/${animal.slug}`}
                  className="block"
                >
                  <GanadoCard animal={animal} featured />
                </Link>
              ))
            ) : (
              <div className="col-span-2 bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 p-8 text-center">
                <h3 className="text-xl font-medium text-white mb-2">
                  No hay ejemplares destacados disponibles
                </h3>
                <p className="text-white/80">
                  Se añadirán nuevos ejemplares destacados próximamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="w-full px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <Filter className="mr-2 h-4 w-4" /> Filtrar por raza
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <TagIcon className="mr-2 h-4 w-4" /> Filtrar por categoría
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <AwardIcon className="mr-2 h-4 w-4" /> Ver ganadores
                </Button>
              </div>
              <p className="text-sm text-white/80">
                {ganado.length} ejemplares disponibles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Todos los Ejemplares usando GanadoCard */}
      <section className="w-full py-20 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 md:p-10 shadow-lg">
            <h2 className="text-3xl font-bold mb-8 border-b pb-4 text-white">
              Todos los Ejemplares
            </h2>

            {razasOrdenadas.map((raza) => (
              <div key={raza} className="mb-16 last:mb-0">
                <h3 className="text-2xl font-bold bg-green-700 px-4 py-2 rounded-lg shadow-sm text-white">
                  {raza}
                </h3>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {ganadoPorRaza[raza].map((animal) => (
                    <Link
                      key={animal.id}
                      href={`/ganado/${animal.slug}`}
                      className="block"
                    >
                      <GanadoCard animal={animal} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {ganado.length === 0 && (
              <div className="py-16 text-center bg-white/20 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                <h3 className="text-xl font-medium text-gray-800">
                  No hay ejemplares disponibles en este momento.
                </h3>
                <p className="text-gray-600 mt-2">
                  Vuelve más tarde para ver los próximos ejemplares.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="w-full py-16 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Quieres registrar tu ganado?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Registra tus ejemplares en nuestra plataforma para mostrar su
              calidad, conectar con otros criadores y participar en los
              principales concursos ganaderos del país.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Registrar mis ejemplares
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/50 hover:bg-white/10"
              >
                Conocer requisitos
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
