import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  if (!text) return ""

  return slugify(text, {
    lower: true,
    strict: true,
    locale: "es",
    remove: /[*+~.()'"!:@]/g,
  })
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function calculateDaysFromBirth(birthDate: Date | string | null): number {
  if (!birthDate) return 0

  const birth = new Date(birthDate)
  const today = new Date()

  const diffTime = Math.abs(today.getTime() - birth.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
