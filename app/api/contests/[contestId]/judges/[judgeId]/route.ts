import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contestId: string, judgeId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to manage judges
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

    // Check if judge has already submitted scores
    const hasScores = await prisma.judgingScore.findFirst({
      where: {
        judgeId: params.judgeId,
        submission: {
          participation: {
            contestId: params.contestId,
          },
        },
      },
    })

    if (hasScores) {
      return NextResponse.json(
        { error: 'Cannot remove judge who has already submitted scores' },
        { status: 400 }
      )
    }

    // Remove assignment and role
    await prisma.$transaction([
      prisma.judgingAssignment.delete({
        where: {
          judgeId_contestId: {
            judgeId: params.judgeId,
            contestId: params.contestId,
          },
        },
      }),
      prisma.contestUserRole.deleteMany({
        where: {
          userId: params.judgeId,
          contestId: params.contestId,
          role: 'JUDGE',
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing judge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}