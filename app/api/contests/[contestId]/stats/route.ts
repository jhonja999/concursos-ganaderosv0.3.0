import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to view stats
    const hasPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageContest'
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get contest with counts
    const contest = await prisma.contest.findUnique({
      where: { id: params.contestId },
      include: {
        _count: {
          select: {
            participations: true,
            categories: true,
            userRoles: true,
          },
        },
      },
    })

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      )
    }

    // Get submissions count
    const submissionsCount = await prisma.contestSubmission.count({
      where: {
        participation: {
          contestId: params.contestId,
        },
      },
    })

    // Get submissions by category
    const submissionsByCategory = await prisma.contestSubmission.groupBy({
      by: ['categoryId'],
      where: {
        participation: {
          contestId: params.contestId,
        },
      },
      _count: {
        _all: true,
      },
    })

    // Get participations by status
    const participationsByStatus = await prisma.contestParticipation.groupBy({
      by: ['status'],
      where: {
        contestId: params.contestId,
      },
      _count: {
        _all: true,
      },
    })

    // Get submissions by status
    const submissionsByStatus = await prisma.contestSubmission.groupBy({
      by: ['status'],
      where: {
        participation: {
          contestId: params.contestId,
        },
      },
      _count: {
        _all: true,
      },
    })

    // Get judges count
    const judgesCount = await prisma.contestUserRole.count({
      where: {
        contestId: params.contestId,
        role: 'JUDGE',
      },
    })

    // Format the stats
    const stats = {
      totalParticipants: contest._count.participations,
      totalSubmissions: submissionsCount,
      totalCategories: contest._count.categories,
      totalJudges: judgesCount,
      submissionsByCategory: Object.fromEntries(
        submissionsByCategory.map(item => [
          item.categoryId,
          item._count._all,
        ])
      ),
      participationsByStatus: Object.fromEntries(
        participationsByStatus.map(item => [
          item.status,
          item._count._all,
        ])
      ),
      submissionsByStatus: Object.fromEntries(
        submissionsByStatus.map(item => [
          item.status,
          item._count._all,
        ])
      ),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}