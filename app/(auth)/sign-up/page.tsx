/**
 * Archivo: app/(auth)/sign-up/page.tsx
 * Uso: Muestra la página de registro utilizando Clerk. Redirige al usuario a /dashboard tras registrarse o iniciar sesión.
 */

"use client";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Componente SignUp de Clerk, que maneja el proceso de registro */}
      <SignUp afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
