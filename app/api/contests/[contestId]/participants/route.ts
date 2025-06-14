import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'
import { ContestStatus, ParticipationStatus } from '@prisma/client'

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status') as ParticipationStatus | null
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * pageSize

    let where: any = {
      contestId: params.contestId,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.user = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [participations, total] = await Promise.all([
      prisma.contestParticipation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.contestParticipation.count({ where }),
    ])

    return NextResponse.json({
      participations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const userId = session.user.sub

    // Check if contest exists and is open for registration
    const contest = await prisma.contest.findUnique({
      where: { id: params.contestId },
      select: {
        status: true,
        registrationStart: true,
        registrationEnd: true,
        maxParticipants: true,
        _count: {
          select: {
            participations: true,
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

    const now = new Date()
    
    // Check if registration is open
    if (
      contest.status !== ContestStatus.REGISTRATION_OPEN ||
      now < contest.registrationStart ||
      now > contest.registrationEnd
    ) {
      return NextResponse.json(
        { error: 'Registration is not open for this contest' },
        { status: 400 }
      )
    }

    // Check if max participants limit is reached
    if (
      contest.maxParticipants &&
      contest._count.participations >= contest.maxParticipants
    ) {
      return NextResponse.json(
        { error: 'Maximum number of participants reached' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingParticipation = await prisma.contestParticipation.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: params.contestId,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'You are already registered for this contest' },
        { status: 400 }
      )
    }

    // Register user as participant
    const participation = await prisma.contestParticipation.create({
      data: {
        userId,
        contestId: params.contestId,
        status: ParticipationStatus.PENDING,
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

    // Assign participant role
    await prisma.contestUserRole.create({
      data: {
        userId,
        contestId: params.contestId,
        role: 'PARTICIPANT',
      },
    })

    return NextResponse.json(participation, { status: 201 })
  } catch (error) {
    console.error('Error registering participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}