import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'
import { ParticipationStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string, participationId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const participation = await prisma.contestParticipation.findUnique({
      where: {
        id: params.participationId,
        contestId: params.contestId,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        submissions: {
          include: {
            category: true,
            media: {
              where: {
                isPrimary: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      )
    }

    // Check if user is the participant or has admin permissions
    const isParticipant = participation.userId === session.user.sub
    const hasAdminPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageContest'
    )

    if (!isParticipant && !hasAdminPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(participation)
  } catch (error) {
    console.error('Error fetching participation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { contestId: string, participationId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to manage participants
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

    const body = await request.json()
    const { status, notes } = body

    // Validate status
    if (!Object.values(ParticipationStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const participation = await prisma.contestParticipation.update({
      where: {
        id: params.participationId,
        contestId: params.contestId,
      },
      data: {
        status,
        notes,
        approvedAt: status === ParticipationStatus.APPROVED ? new Date() : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(participation)
  } catch (error) {
    console.error('Error updating participation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contestId: string, participationId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const participation = await prisma.contestParticipation.findUnique({
      where: {
        id: params.participationId,
        contestId: params.contestId,
      },
      select: {
        userId: true,
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      )
    }

    // Check if user is the participant or has admin permissions
    const isParticipant = participation.userId === session.user.sub
    const hasAdminPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageContest'
    )

    if (!isParticipant && !hasAdminPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete participation and related submissions
    await prisma.$transaction([
      prisma.contestSubmission.deleteMany({
        where: { participationId: params.participationId },
      }),
      prisma.contestParticipation.delete({
        where: { id: params.participationId },
      }),
      // Remove participant role if user has no other participations in this contest
      prisma.contestUserRole.deleteMany({
        where: {
          userId: participation.userId,
          contestId: params.contestId,
          role: 'PARTICIPANT',
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting participation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}