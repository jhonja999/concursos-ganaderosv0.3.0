import { ContestRole } from '@prisma/client'
import { prisma } from './prisma'

export interface UserPermissions {
  canManageContest: boolean
  canJudge: boolean
  canParticipate: boolean
  canViewResults: boolean
  canManageUsers: boolean
  canManageCategories: boolean
  canManageSubmissions: boolean
}

export async function getUserContestRole(userId: string, contestId: string): Promise<ContestRole | null> {
  const userRole = await prisma.contestUserRole.findFirst({
    where: {
      userId,
      contestId,
    },
  })

  return userRole?.role || null
}

export async function getUserPermissions(userId: string, contestId: string): Promise<UserPermissions> {
  const role = await getUserContestRole(userId, contestId)

  const permissions: UserPermissions = {
    canManageContest: false,
    canJudge: false,
    canParticipate: false,
    canViewResults: true, // Public viewers can see results
    canManageUsers: false,
    canManageCategories: false,
    canManageSubmissions: false,
  }

  switch (role) {
    case ContestRole.CONTEST_ADMINISTRATOR:
      permissions.canManageContest = true
      permissions.canManageUsers = true
      permissions.canManageCategories = true
      permissions.canManageSubmissions = true
      permissions.canViewResults = true
      break

    case ContestRole.JUDGE:
      permissions.canJudge = true
      permissions.canViewResults = true
      break

    case ContestRole.PARTICIPANT:
      permissions.canParticipate = true
      permissions.canViewResults = true
      break

    case ContestRole.PUBLIC_VIEWER:
    default:
      permissions.canViewResults = true
      break
  }

  return permissions
}

export async function requireContestRole(
  userId: string,
  contestId: string,
  requiredRole: ContestRole
): Promise<boolean> {
  const userRole = await getUserContestRole(userId, contestId)
  
  if (!userRole) return false

  // Contest administrators have all permissions
  if (userRole === ContestRole.CONTEST_ADMINISTRATOR) return true

  return userRole === requiredRole
}

export async function requireContestPermission(
  userId: string,
  contestId: string,
  permission: keyof UserPermissions
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, contestId)
  return permissions[permission]
}

// Middleware helper for API routes
export function withContestAuth(requiredRole: ContestRole) {
  return async (req: any, res: any, next: any) => {
    const { user } = req
    const { contestId } = req.query

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const hasPermission = await requireContestRole(user.sub, contestId, requiredRole)

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}