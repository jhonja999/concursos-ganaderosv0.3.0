/**
 * Archivo: app/(auth)/sign-in/page.tsx
 * Uso: Muestra la página de inicio de sesión utilizando Clerk. Redirige al usuario a /dashboard tras iniciar sesión o registrarse.
 */

"use client";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}