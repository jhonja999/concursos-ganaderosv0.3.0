import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/dashboard(.*)']) //agregar rutas protegidas

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes starting with `/admin` or `/dashboard`
  if (isAdminRoute(req)) {
    const session = await auth();
    const userRole = session.sessionClaims?.metadata?.role;
    
    // Permitir acceso si el usuario tiene el rol 'dashboard_admin' o 'org:admin'
    if (userRole !== 'dashboard_admin' && userRole !== 'admin') {
      const url = new URL('/', req.url)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}