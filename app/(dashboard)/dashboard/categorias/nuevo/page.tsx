import { redirect } from "next/navigation"

export default function NuevaCategoriaRedirectPage() {
  // Redirigir a la página de categorías donde el usuario puede seleccionar un concurso
  redirect("/dashboard/categorias")
}
