// Types for the livestock management application

export type Sexo = "MACHO" | "HEMBRA";

export interface Criador {
  id: string;
  nombre: string;
  apellido: string | null;
  empresa: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Concurso {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  fechaInicio: Date;
  fechaFin?: Date | null;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
}

export interface ConcursoCategoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  sexo: Sexo | null;
  edadMinima: number | null;
  edadMaxima: number | null;
  createdAt: Date;
  updatedAt: Date;
  concursoId: string;
}

export interface Image {
  id: string;
  url: string;
  hash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GanadoImage {
  id: string;
  ganadoId: string;
  imageId: string;
  principal: boolean;
  createdAt: Date;
  image: Image;
}

export interface GanadoEnConcurso {
  id: string;
  ganadoId: string;
  concursoId: string;
  posicion?: number | null;
  creadoAt: Date;
  concurso: Concurso;
}

export interface Ganado {
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
  sexo: Sexo;
  numRegistro?: string | null;
  puntaje?: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  isGanadora: boolean;
  premios: string[];
  createdAt: Date;
  updatedAt: Date;
  criadorId?: string | null;
  categoriaConcursoId?: string | null;
  criador?: Criador | null;
  categoriaConcurso?: ConcursoCategoria | null;
  ganadoEnConcurso: GanadoEnConcurso[];
  GanadoImage: GanadoImage[];
}

export interface GanadoFormData {
  nombre: string;
  slug: string;
  numRegistro?: string;
  fechaNac?: Date;
  diasNacida?: number;
  sexo: Sexo;
  raza?: string;
  establo?: string;
  propietario?: string;
  criadorId?: string;
  categoria?: string;
  subcategoria?: string;
  categoriaConcursoId?: string;
  remate: boolean;
  puntaje?: number;
  descripcion?: string;
  concursoId?: string;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface GanadoFormProps {
  initialData?: Partial<GanadoFormData>;
  concursos: {
    id: string;
    nombre: string;
    slug?: string;
  }[];
  categoriasConcurso?: ConcursoCategoria[];
  ganadoId?: string;
  defaultConcursoId?: string;
}

export interface GanadoPorCategoriaProps {
  categoria: {
    id: string;
    nombre: string;
    descripcion: string | null;
    sexo?: Sexo | null;
    edadMinima?: number | null;
    edadMaxima?: number | null;
  };
  machos: Ganado[];
  hembras: Ganado[];
  concursoId: string;
  concursoSlug: string;
}