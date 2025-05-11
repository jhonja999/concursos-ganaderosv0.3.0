import Image from "next/image"
import Link from "next/link"
import { Calendar, Building, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "Concursos Ganaderos",
  description: "Explora todos los concursos ganaderos disponibles",
}

export default async function ConcursosPage() {
  // Cargar datos del servidor con optimización
  const concursos = await prisma.concurso.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        fechaInicio: "desc",
      },
    ],
    include: {
      company: true,
      ganadoEnConcurso: {
        select: {
          id: true,
        },
      },
    },
  })

  // Agrupar concursos por año con tipado explícito
  const concursosPorAnio = concursos.reduce(
    (acc, concurso) => {
      const anio = new Date(concurso.fechaInicio).getFullYear()
      if (!acc[anio]) {
        acc[anio] = []
      }
      acc[anio].push(concurso)
      return acc
    },
    {} as Record<number, typeof concursos>
  )

  // Ordenar años de más reciente a más antiguo
  const aniosOrdenados = Object.keys(concursosPorAnio)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Background Landscape Image con optimización */}
      <div className="fixed inset-0 -z-10">
        <Image 
          src="/landingImages/landscape.webp" 
          alt="Landscape Background" 
          className="w-full h-full object-cover" 
          fill
          priority
          loading="eager"
        />
      </div>
      
      {/* Hero Header full screen */}
      <header className="relative w-screen h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="container relative z-20 text-center px-4 max-w-screen-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">Nuestros Concursos</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Eventos destacados del sector ganadero para promover la excelencia y sostenibilidad
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="default" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30">
              Explorar concursos <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sección de próximos eventos optimizada */}
      <section className="container px-4 md:px-6 max-w-screen-2xl mx-auto py-20">
        <h2 className="text-3xl font-bold mb-10 text-center text-white bg-black/50 backdrop-blur-sm py-3 rounded-lg shadow-lg">
          Próximos Eventos
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {concursos.length > 0 && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px]">
              <div className="relative h-80">
                <Image 
                  src="/nosotrosImages/nosotros1.webp"
                  alt={concursos[0].nombre || "Fongal 2024"} 
                  className="object-cover"
                  fill
                  loading="lazy"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
                  <div className="p-6">
                    <Badge className="mb-2 bg-green-600 hover:bg-green-700 text-white">Destacado</Badge>
                    <h3 className="text-2xl font-bold text-white">{concursos[0].nombre || "Fongal 2024"}</h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-white leading-relaxed">
                  {concursos[0].descripcion || "La feria Fongal es uno de los eventos más importantes del norte de la región Cajamarca y del país, su concurso dedicado a promover la crianza ganadera sostenible, buscando exponer los mejores ejemplares y la destreza de sus criadores."}
                </p>
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">{formatDate(concursos[0]?.fechaInicio) || "Mayo 2024"}</span>
                  </div>
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-white transition-colors duration-300">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Destacado 2 */}
          {concursos.length > 1 && (
            <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px]">
              <div className="relative h-80">
                <Image 
                  src="https://images.unsplash.com/photo-1554145707-80e42bdaaa4a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D "
                  alt={concursos[1].nombre || "Expo Ganadera 2025"} 
                  className="object-cover"
                  fill
                  loading="lazy"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
                  <div className="p-6">
                    <Badge className="mb-2 bg-amber-600 hover:bg-amber-700 text-white">Próximo</Badge>
                    <h3 className="text-2xl font-bold text-white">{concursos[1].nombre || "Expo Ganadera 2025"}</h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-white leading-relaxed">
                  {concursos[1].descripcion || "El evento más completo dedicado a la ganadería sostenible, con exhibiciones de ejemplares premiados, tecnologías de punta para el sector y oportunidades de networking para criadores y profesionales."}
                </p>
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">{formatDate(concursos[1]?.fechaInicio) || "Febrero 2025"}</span>
                  </div>
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-white transition-colors duration-300">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Fallback */}
          {concursos.length === 0 && (
            <div className="col-span-2 bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 p-8 text-center">
              <h3 className="text-xl font-medium text-white mb-2">No hay próximos eventos disponibles</h3>
              <p className="text-white/80">Se añadirán nuevos eventos próximamente.</p>
            </div>
          )}
        </div>
      </section>

      {/* Todos los concursos optimizados */}
      <section className="container px-4 md:px-6 max-w-screen-2xl mx-auto py-20">
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 md:p-10 shadow-lg">
          <h2 className="text-3xl font-bold mb-8 border-b pb-4">Todos los Concursos</h2>
          
          {aniosOrdenados.map((anio) => (
            <div key={anio} className="mb-16 last:mb-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-green-700 px-4 py-2 rounded-lg shadow-sm">{anio}</h3>
                <Badge variant="outline" className="text-lg px-4 py-1 bg-green-700">{concursosPorAnio[anio].length} eventos</Badge>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {concursosPorAnio[anio].map((concurso) => (
                  <Link key={concurso.id} href={`/concursos/${concurso.slug}`} className="block group">
                    <div className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:translate-y-[-4px] group-hover:bg-white">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image 
                          src={typeof concurso.id === 'number' && concurso.id % 2 === 0 
                            ? "/nosotrosImages/nosotros1.webp" 
                            : "https://images.unsplash.com/photo-1554145707-80e42bdaaa4a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                          } 
                          alt={concurso.nombre} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          width={400}
                          height={200}
                          loading="lazy"
                          fetchPriority="low"
                        />
                        {concurso.descripcion && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="p-6 w-full max-w-full text-center">
                              <p className="text-lg md:text-xl text-white font-medium leading-snug">
                                {concurso.descripcion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-green-50 text-green-800 font-medium">{formatDate(concurso.fechaInicio).split(" de ")[1]}</Badge>
                            {concurso.isFeatured && <Badge className="bg-amber-100 text-amber-800">Destacado</Badge>}
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300">{concurso.nombre}</h3>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{formatDate(concurso.fechaInicio)}</span>
                            {concurso.fechaFin && (
                              <>
                                <span className="text-sm text-gray-500">-</span>
                                <span className="text-sm text-gray-500">{formatDate(concurso.fechaFin)}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{concurso.company.nombre}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-gray-600 font-medium">
                              {concurso.ganadoEnConcurso.length} participantes
                            </span>
                            <Button variant="outline" size="sm" className="font-medium text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300">
                              Ver concurso
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          {concursos.length === 0 && (
            <div className="py-16 text-center bg-white/20 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
              <h3 className="text-xl font-medium text-gray-800">No hay concursos disponibles en este momento.</h3>
              <p className="text-gray-600 mt-2">Vuelve más tarde para ver los próximos concursos.</p>        
            </div>
          )}
        </div>
      </section>

      {/* Footer/CTA Section optimizado */}
      <section className="container px-4 md:px-6 max-w-screen-2xl mx-auto py-16">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 md:p-12 shadow-lg text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Quieres participar en nuestros concursos?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Únete a los principales eventos ganaderos del país y muestra la calidad de tu ganado, 
            conecta con otros criadores y aprende de los mejores expertos del sector.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              Registrarse como participante
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10">
              Conocer requisitos
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}