import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'
import { ContestStatus, SubmissionStatus } from '@prisma/client'

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
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status') as SubmissionStatus | null
    const search = searchParams.get('search') || ''
    const participantId = searchParams.get('participantId')

    const skip = (page - 1) * pageSize

    // Check if user has permission to view submissions
    const hasPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageSubmissions'
    )

    const isJudge = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canJudge'
    )

    // If not admin or judge, only show own submissions
    const userId = !hasPermission && !isJudge ? session.user.sub : undefined

    let where: any = {
      participation: {
        contestId: params.contestId,
      },
    }

    if (userId) {
      where.participation.userId = userId
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (status) {
      where.status = status
    }

    if (participantId) {
      where.participation.userId = participantId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [submissions, total] = await Promise.all([
      prisma.contestSubmission.findMany({
        where,
        include: {
          participation: {
            include: {
              user: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                },
              },
            },
          },
          category: true,
          media: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
          ganado: {
            select: {
              id: true,
              nombre: true,
              slug: true,
              raza: true,
              sexo: true,
            },
          },
          _count: {
            select: {
              scores: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.contestSubmission.count({ where }),
    ])

    return NextResponse.json({
      submissions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
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

    // Check if user is a participant
    const participation = await prisma.contestParticipation.findUnique({
      where: {
        userId_contestId: {
          userId,
          contestId: params.contestId,
        },
      },
      include: {
        contest: {
          select: {
            status: true,
          },
        },
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'You are not registered for this contest' },
        { status: 400 }
      )
    }

    if (participation.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Your participation has not been approved yet' },
        { status: 400 }
      )
    }

    // Check if contest is in the right state
    if (
      participation.contest.status !== ContestStatus.REGISTRATION_OPEN &&
      participation.contest.status !== ContestStatus.JUDGING
    ) {
      return NextResponse.json(
        { error: 'Contest is not accepting submissions at this time' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      ganadoId,
      metadata,
    } = body

    // Validate required fields
    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if category exists and belongs to this contest
    const category = await prisma.contestCategory.findUnique({
      where: {
        id: categoryId,
        contestId: params.contestId,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Check if ganado exists and belongs to user (if provided)
    if (ganadoId) {
      const ganado = await prisma.ganado.findUnique({
        where: { id: ganadoId },
      })

      if (!ganado) {
        return NextResponse.json(
          { error: 'Invalid ganado' },
          { status: 400 }
        )
      }
    }

    // Create submission
    const submission = await prisma.contestSubmission.create({
      data: {
        title,
        description,
        status: SubmissionStatus.DRAFT,
        metadata: metadata || {},
        participationId: participation.id,
        categoryId,
        ganadoId,
      },
      include: {
        category: true,
        ganado: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            raza: true,
            sexo: true,
          },
        },
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}