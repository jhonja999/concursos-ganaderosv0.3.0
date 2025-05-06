export interface Company {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  website?: string | null
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  parent?: Category | null
  subCategories?: {
    id: string;
    name: string;
  }[];
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  comparePrice?: number | null
  images: string[]
  videos: string[]
  ingredients?: string | null
  companyId: string
  company: {
    name: string
    slug: string
  }
  categoryId: string
  category: {
    name: string
    slug: string
  }
  isFeatured: boolean
  isPublished: boolean
  stock: number
  createdAt: Date
  updatedAt: Date
}

export interface Variant {
  id: string
  name: string
  price: number
  sku?: string | null
  stock: number
  productId: string
}

export interface Attribute {
  id: string
  name: string
  value: string
  imageUrl?: string | null
  productId: string
}

export interface User {
  id: string
  clerkId: string
  name?: string | null
  email: string
  role: "USER" | "ADMIN"
  createdAt: Date
  updatedAt: Date
}

export interface Ganado {
  id: string;
  nombre: string;
  categoria?: string;
  subcategoria?: string;
  raza?: string;
  sexo: "MACHO" | "HEMBRA";
  propietario?: string;
  isGanadora?: boolean;
  premios?: string[];
  imagenUrl?: string;  // Nueva propiedad opcional
}