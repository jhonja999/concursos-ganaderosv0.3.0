import Image from "next/image"
import Link from "next/link"
import { Calendar, Building, ChevronDown, Tag, Filter, Trophy, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "Ganado Disponible",
  description: "Explora todo el ganado disponible en nuestros concursos",
}

export default async function GanadoPage() {
  const ganado = await prisma.ganado.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
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
      criador: true,
      categoriaConcurso: true,
    },
  })

  // Agrupar ganado por razas
  const ganadoPorRaza = ganado.reduce(
    (acc, animal) => {
      const raza = animal.raza || "Sin clasificar"
      if (!acc[raza]) {
        acc[raza] = []
      }
      acc[raza].push(animal)
      return acc
    },
    {} as Record<string, typeof ganado>,
  )

  // Ordenar razas alfabéticamente (colocando "Sin clasificar" al final)
  const razasOrdenadas = Object.keys(ganadoPorRaza).sort((a, b) => {
    if (a === "Sin clasificar") return 1;
    if (b === "Sin clasificar") return -1;
    return a.localeCompare(b);
  })

  // Obtener ganado destacado (máximo 2)
  const ganadoDestacado = ganado.filter(animal => animal.isFeatured).slice(0, 2)

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Background Landscape Image */}
      <div className="fixed inset-0 -z-10">
        <Image 
          src="/landingImages/landscape.webp" 
          alt="Landscape Background" 
          className="w-full h-full object-cover" 
          fill
          priority
        />
      </div>
      
      {/* Hero Header */}
      <header className="relative w-full h-64 flex items-center justify-center mb-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 text-center px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">Ganado Disponible</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Ejemplares destacados del sector ganadero que representan la excelencia y sostenibilidad
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="default" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30">
              Explorar ganado <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Ganado destacado - Mostrar máximo dos ejemplares destacados */}
      <section className="w-full py-20 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-10 text-center text-white bg-black/50 backdrop-blur-sm py-4 rounded-lg shadow-lg">
            Ejemplares Destacados
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Destacado 1 */}
            {ganadoDestacado.length > 0 && (
              <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300 hover:shadow-2xl hover:translate-y-[-4px]">
                <div className="relative h-80">
                  <Image 
                    src={ganadoDestacado[0].GanadoImage.length > 0 
                      ? ganadoDestacado[0].GanadoImage[0].image.url 
                      : "/nosotrosImages/nosotros1.webp"}
                    alt={ganadoDestacado[0].nombre || "Ganado destacado"} 
                    className="object-cover"
                    fill
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
                    <div className="p-6">
                      <Badge className="mb-2 bg-green-600 hover:bg-green-700 text-white">Premiado</Badge>
                      <h3 className="text-2xl font-bold text-white">{ganadoDestacado[0].nombre || "Ejemplar destacado"}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-white leading-relaxed">
                    {ganadoDestacado[0].descripcion || "Ejemplar de alta calidad genética y excelentes características físicas, que representa lo mejor de su raza en términos de producción y conformación."}
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                      <Tag className="h-5 w-5 text-white" />
                      <span className="text-white font-medium">{ganadoDestacado[0].raza || "Raza no especificada"}</span>
                    </div>
                    {ganadoDestacado[0].premios && ganadoDestacado[0].premios.length > 0 && (
                      <div className="flex items-center gap-2 bg-amber-800/30 px-3 py-2 rounded-lg">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        <span className="text-white font-medium">{ganadoDestacado[0].premios[0]}</span>
                      </div>
                    )}
                    <Link href={`/ganado/${ganadoDestacado[0].slug}`}>
                      <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-white transition-colors duration-300">
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Destacado 2 */}
            {ganadoDestacado.length > 1 && (
              <div className="bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300 hover:shadow-2xl hover:translate-y-[-4px]">
                <div className="relative h-80">
                  <Image 
                    src={ganadoDestacado[1].GanadoImage.length > 0 
                      ? ganadoDestacado[1].GanadoImage[0].image.url 
                      : "/nosotrosImages/nosotros1.webp"}
                    alt={ganadoDestacado[1].nombre || "Ganado destacado"} 
                    className="object-cover"
                    fill
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
                    <div className="p-6">
                      <Badge className="mb-2 bg-amber-600 hover:bg-amber-700 text-white">Premium</Badge>
                      <h3 className="text-2xl font-bold text-white">{ganadoDestacado[1].nombre || "Ejemplar premium"}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-white leading-relaxed">
                    {ganadoDestacado[1].descripcion || "Este ejemplar destaca por su genética superior y sus características fenotípicas excepcionales, un modelo en producción y sostenibilidad para el sector ganadero."}
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                      <Tag className="h-5 w-5 text-white" />
                      <span className="text-white font-medium">{ganadoDestacado[1].raza || "Raza no especificada"}</span>
                    </div>
                    {ganadoDestacado[1].premios && ganadoDestacado[1].premios.length > 0 && (
                      <div className="flex items-center gap-2 bg-amber-800/30 px-3 py-2 rounded-lg">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        <span className="text-white font-medium">{ganadoDestacado[1].premios[0]}</span>
                      </div>
                    )}
                    <Link href={`/ganado/${ganadoDestacado[1].slug}`}>
                      <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-white transition-colors duration-300">
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Caso de fallback si no hay ganado destacado */}
            {ganadoDestacado.length === 0 && (
              <div className="col-span-2 bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 p-8 text-center">
                <h3 className="text-xl font-medium text-white mb-2">No hay ejemplares destacados disponibles</h3>
                <p className="text-white/80">Se añadirán nuevos ejemplares destacados próximamente.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Filtros y búsqueda */}
      <section className="w-full px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar por raza
                </Button>
                <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                  <Tag className="mr-2 h-4 w-4" />
                  Filtrar por categoría
                </Button>
                <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                  <Award className="mr-2 h-4 w-4" />
                  Ver ganadores
                </Button>
              </div>
              <p className="text-sm text-white/80">{ganado.length} ejemplares disponibles</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Todo el ganado por razas */}
      <section className="w-full py-20 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 md:p-10 shadow-lg">
            <h2 className="text-3xl font-bold mb-8 border-b pb-4">Todos los Ejemplares</h2>
            
            {razasOrdenadas.map((raza) => (
              <div key={raza} className="mb-16 last:mb-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-green-700 px-4 py-2 rounded-lg shadow-sm">{raza}</h3>
                  <Badge variant="outline" className="text-lg px-4 py-1 bg-green-700">{ganadoPorRaza[raza].length} ejemplares</Badge>
                </div>
                
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {ganadoPorRaza[raza].map((animal) => (
                    <Link key={animal.id} href={`/ganado/${animal.slug}`} className="block group">
                      <div className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:translate-y-[-4px] group-hover:bg-white">
                        {/* Card Image with Glassmorphism effect on hover */}
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image 
                            src={animal.GanadoImage.length > 0 
                              ? animal.GanadoImage[0].image.url 
                              : (typeof animal.id === 'number' && animal.id % 2 === 0 
                                ? "/nosotrosImages/nosotros1.webp" 
                                : "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1740&auto=format&fit=crop"
                              )} 
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
                        
                        {/* Card Content */}
                        <div className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-green-50 text-green-800 font-medium">{animal.categoriaConcurso?.nombre || animal.categoria || "General"}</Badge>
                              {animal.sexo && (
                                <Badge className={animal.sexo === "MACHO" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}>
                                  {animal.sexo}
                                </Badge>
                              )}
                              {animal.isFeatured && <Badge className="bg-amber-100 text-amber-800">Destacado</Badge>}
                              {animal.isGanadora && <Badge className="bg-purple-100 text-purple-800">Ganador</Badge>}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors duration-300">{animal.nombre}</h3>
                            
                            {animal.fechaNac && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Nacimiento: {formatDate(animal.fechaNac)}</span>
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
                              <Button variant="outline" size="sm" className="font-medium text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300">
                                Ver detalles
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

            {ganado.length === 0 && (
              <div className="py-16 text-center bg-white/20 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                <h3 className="text-xl font-medium text-gray-800">No hay ejemplares disponibles en este momento.</h3>
                <p className="text-gray-600 mt-2">Vuelve más tarde para ver los próximos ejemplares.</p>        
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer/CTA Section */}
      <section className="w-full py-16 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 md:p-12 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¿Quieres registrar tu ganado?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Registra tus ejemplares en nuestra plataforma para mostrar su calidad, 
              conectar con otros criadores y participar en los principales concursos ganaderos del país.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Registrar mis ejemplares
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10">
                Conocer requisitos
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}