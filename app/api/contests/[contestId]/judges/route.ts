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

    // Check if user has permission to view judges
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

    const judges = await prisma.judgingAssignment.findMany({
      where: { contestId: params.contestId },
      include: {
        judge: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(judges)
  } catch (error) {
    console.error('Error fetching judges:', error)
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

    const body = await request.json()
    const { judgeId } = body

    if (!judgeId) {
      return NextResponse.json(
        { error: 'Judge ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: judgeId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if judge is already assigned
    const existingAssignment = await prisma.judgingAssignment.findUnique({
      where: {
        judgeId_contestId: {
          judgeId,
          contestId: params.contestId,
        },
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Judge is already assigned to this contest' },
        { status: 400 }
      )
    }

    // Create assignment and role
    const [assignment] = await prisma.$transaction([
      prisma.judgingAssignment.create({
        data: {
          judgeId,
          contestId: params.contestId,
        },
        include: {
          judge: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      }),
      prisma.contestUserRole.create({
        data: {
          userId: judgeId,
          contestId: params.contestId,
          role: 'JUDGE',
        },
      }),
    ])

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error assigning judge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}