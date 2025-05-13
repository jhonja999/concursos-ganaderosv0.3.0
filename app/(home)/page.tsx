import Link from "next/link";
import Image from "next/image";
import { MilkIcon as Cow, Calendar, Building, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import AnimalSlider from "@/components/AnimalSlider";

export default async function HomePage() {
  // Obtener concursos destacados
  const concursos = await prisma.concurso.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    orderBy: {
      fechaInicio: "desc",
    },
    take: 3,
    include: {
      company: true,
    },
  });

  // Obtener ganado destacado
  const ganado = await prisma.ganado.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      GanadoImage: {
        include: {
          image: true,
        },
        where: {
          principal: true,
        },
        take: 1,
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Mejorada con Slider de Animales */}
      <section className="w-full h-screen relative overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="Paisaje ganadero"
            className="object-cover w-full h-full"
            src="/landingImages/landscape.webp"
            fill
            priority
            loading="eager"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-neutral-900 z-1"></div>

        {/* Contenido Hero - Centrado vertical y horizontalmente */}
        <div className="container mx-auto relative z-40 h-3/6 flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
              Concursos Ganaderos
            </h1>

            <p className="max-w-[800px] mx-auto text-xl md:text-2xl lg:text-3xl text-white mb-8">
              Reconocemos tu dedicación y pasión por tus animales
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 mt-4 justify-center">
              <Link href="/concursos">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-100 font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  CONÓCENOS
                </Button>
              </Link>
              <Link href="/ganado">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-black dark:text-white hover:bg-white/20 rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  Explorar Ganado
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Componente Slider de Animales (Client Component) */}
        <AnimalSlider />
      </section>

      {/* Concursos Destacados */}
      <section className="w-full py-12 md:py-24 bg-background text-center bg-neutral-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Concursos Destacados
              </h2>
              <p className="mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Descubre los próximos eventos y concursos ganaderos más
                importantes.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {concursos.map((concurso) => (
              <Link key={concurso.id} href={`/concursos/${concurso.slug}`}>
                <div className="flex flex-col h-full rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg">
                  <div className="p-6 flex flex-col space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {formatDate(concurso.fechaInicio)}
                      </p>
                    </div>
                    <div className="space-y-2 text-left">
                      <h3 className="text-xl font-bold">{concurso.nombre}</h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {concurso.descripcion || "Sin descripción"}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {concurso.company.nombre}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/concursos">
              <Button variant="outline">Ver todos los concursos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ganado Destacado */}
      <section className="w-full py-12 md:py-24 bg-muted text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ganado Destacado
              </h2>
              <p className="mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conoce los ejemplares más destacados de nuestros concursos.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {ganado.map((animal) => (
              <Link key={animal.id} href={`/ganado/${animal.slug}`}>
                <div className="flex flex-col h-full rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg">
                  <div className="relative aspect-square">
                    <Image
                      alt={animal.nombre}
                      className="rounded-t-xl object-cover"
                      fill
                      src={
                        animal.GanadoImage[0]?.image.url ||
                        "/placeholder.svg?height=300&width=300"
                      }
                    />
                  </div>
                  <div className="p-4 flex flex-col space-y-2 text-left">
                    <h3 className="font-bold">{animal.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {animal.categoria || "Sin categoría"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cow className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {animal.raza || "Raza no especificada"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/ganado">
              <Button variant="outline">Ver todo el ganado</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background text-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                ¿Quieres organizar un concurso?
              </h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Regístrate y comienza a gestionar tus propios concursos
                ganaderos.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/sign-up">
                <Button size="lg">Registrarse</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}