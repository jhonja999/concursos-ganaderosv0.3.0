import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAuth } from '@auth0/nextjs-auth0/edge'

// Define protected routes
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/dashboard(.*)'])
const isContestRoute = createRouteMatcher(['/contests/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Check if it's a protected route
  if (isAdminRoute(req)) {
    // Try Clerk authentication first
    const session = await auth();
    const userRole = session.sessionClaims?.metadata?.role;
    
    // Allow access if the user has the role 'dashboard_admin' or 'admin'
    if (userRole === 'dashboard_admin' || userRole === 'admin') {
      return NextResponse.next()
    }
    
    // If not authenticated with Clerk, try Auth0
    try {
      const { isAuthenticated, user } = getAuth(req)
      
      if (isAuthenticated && user && (
        user.role === 'admin' || 
        user.role === 'dashboard_admin' || 
        user.role === 'CONTEST_ADMINISTRATOR'
      )) {
        return NextResponse.next()
      }
    } catch (error) {
      console.error('Auth0 authentication error:', error)
    }
    
    // If not authenticated with either provider, redirect to login
    const url = new URL('/sign-in', req.url)
    return NextResponse.redirect(url)
  }
  
  // For contest routes, allow public access but check for specific permissions
  if (isContestRoute(req)) {
    // Allow public access by default
    return NextResponse.next()
  }
  
  // For all other routes, proceed normally
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}