import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: params.contestId },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        categories: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            participations: true,
            submissions: true,
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

    return NextResponse.json(contest)
  } catch (error) {
    console.error('Error fetching contest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Check if user has permission to manage this contest
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
    const {
      name,
      description,
      registrationStart,
      registrationEnd,
      contestStart,
      contestEnd,
      maxParticipants,
      entryFee,
      rules,
      prizes,
      isPublic,
      isFeatured,
      bannerImage,
      status,
    } = body

    const contest = await prisma.contest.update({
      where: { id: params.contestId },
      data: {
        name,
        description,
        registrationStart: registrationStart ? new Date(registrationStart) : undefined,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : undefined,
        contestStart: contestStart ? new Date(contestStart) : undefined,
        contestEnd: contestEnd ? new Date(contestEnd) : undefined,
        maxParticipants,
        entryFee,
        rules,
        prizes,
        isPublic,
        isFeatured,
        bannerImage,
        status,
      },
      include: {
        company: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(contest)
  } catch (error) {
    console.error('Error updating contest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if user has permission to manage this contest
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

    await prisma.contest.delete({
      where: { id: params.contestId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}