//type para los roles de clerk
export {}

// Create a type for the roles
export type Roles = 'admin' | 'dashboard_admin' | 'Member'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}