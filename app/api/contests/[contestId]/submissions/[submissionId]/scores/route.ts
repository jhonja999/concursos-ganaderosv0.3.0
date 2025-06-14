import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string, submissionId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const submission = await prisma.contestSubmission.findUnique({
      where: { id: params.submissionId },
      include: {
        participation: {
          select: {
            userId: true,
            contestId: true,
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (submission.participation.contestId !== params.contestId) {
      return NextResponse.json(
        { error: 'Submission not found in this contest' },
        { status: 404 }
      )
    }

    // Check if user is the owner, a judge, or has admin permissions
    const isOwner = submission.participation.userId === session.user.sub
    const isJudge = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canJudge'
    )
    const hasAdminPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageSubmissions'
    )

    if (!isOwner && !isJudge && !hasAdminPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const scores = await prisma.judgingScore.findMany({
      where: { submissionId: params.submissionId },
      include: {
        judge: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        criteria: true,
      },
      orderBy: [
        { criteria: { order: 'asc' } },
        { scoredAt: 'desc' },
      ],
    })

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { contestId: string, submissionId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a judge for this contest
    const isJudge = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canJudge'
    )

    if (!isJudge) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const submission = await prisma.contestSubmission.findUnique({
      where: { id: params.submissionId },
      include: {
        participation: {
          select: {
            contestId: true,
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (submission.participation.contestId !== params.contestId) {
      return NextResponse.json(
        { error: 'Submission not found in this contest' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { criteriaId, score, comments } = body

    // Validate required fields
    if (!criteriaId || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score
    if (score < 0) {
      return NextResponse.json(
        { error: 'Score must be a positive number' },
        { status: 400 }
      )
    }

    // Check if criteria exists and belongs to this contest
    const criteria = await prisma.judgingCriteria.findUnique({
      where: { id: criteriaId },
    })

    if (!criteria) {
      return NextResponse.json(
        { error: 'Criteria not found' },
        { status: 404 }
      )
    }

    if (
      criteria.contestId !== params.contestId &&
      !(criteria.categoryId && await prisma.contestCategory.findUnique({
        where: {
          id: criteria.categoryId,
          contestId: params.contestId,
        },
      }))
    ) {
      return NextResponse.json(
        { error: 'Criteria not found in this contest' },
        { status: 404 }
      )
    }

    // Check if score exceeds max score
    if (score > criteria.maxScore) {
      return NextResponse.json(
        { error: `Score cannot exceed maximum score of ${criteria.maxScore}` },
        { status: 400 }
      )
    }

    // Check if judge has already scored this submission for this criteria
    const existingScore = await prisma.judgingScore.findUnique({
      where: {
        judgeId_submissionId_criteriaId: {
          judgeId: session.user.sub,
          submissionId: params.submissionId,
          criteriaId,
        },
      },
    })

    let judgingScore

    if (existingScore) {
      // Update existing score
      judgingScore = await prisma.judgingScore.update({
        where: { id: existingScore.id },
        data: {
          score,
          comments,
          updatedAt: new Date(),
        },
        include: {
          criteria: true,
        },
      })
    } else {
      // Create new score
      judgingScore = await prisma.judgingScore.create({
        data: {
          judgeId: session.user.sub,
          submissionId: params.submissionId,
          criteriaId,
          score,
          comments,
        },
        include: {
          criteria: true,
        },
      })
    }

    // Check if all criteria have been scored
    const allCriteria = await prisma.judgingCriteria.findMany({
      where: {
        OR: [
          { contestId: params.contestId },
          {
            category: {
              contestId: params.contestId,
            },
          },
        ],
      },
      select: { id: true },
    })

    const scoredCriteria = await prisma.judgingScore.findMany({
      where: {
        judgeId: session.user.sub,
        submissionId: params.submissionId,
      },
      select: { criteriaId: true },
    })

    const allCriteriaScored = allCriteria.every(
      criteria => scoredCriteria.some(score => score.criteriaId === criteria.id)
    )

    // If all criteria scored, update submission status
    if (allCriteriaScored) {
      await prisma.contestSubmission.update({
        where: { id: params.submissionId },
        data: { status: 'JUDGED' },
      })
    }

    return NextResponse.json(judgingScore)
  } catch (error) {
    console.error('Error scoring submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}