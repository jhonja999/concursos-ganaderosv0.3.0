import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { ContestStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    // Check if contest exists and results are published
    const contest = await prisma.contest.findUnique({
      where: { id: params.contestId },
      select: {
        status: true,
        resultsPublished: true,
        isPublic: true,
      },
    })

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      )
    }

    // If contest is not completed or results are not published, require authentication
    if (
      contest.status !== ContestStatus.COMPLETED ||
      !contest.resultsPublished
    ) {
      const session = await getSession()
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Results not yet published' },
          { status: 403 }
        )
      }
    }

    // Get all submissions with their scores
    const submissions = await prisma.contestSubmission.findMany({
      where: {
        participation: {
          contestId: params.contestId,
        },
        status: 'JUDGED',
      },
      include: {
        category: true,
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
        scores: {
          include: {
            criteria: true,
          },
        },
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
      },
    })

    // Calculate total scores
    const results = submissions.map(submission => {
      // Group scores by criteria
      const scoresByCriteria = submission.scores.reduce((acc, score) => {
        if (!acc[score.criteriaId]) {
          acc[score.criteriaId] = {
            criteria: score.criteria,
            scores: [],
          }
        }
        acc[score.criteriaId].scores.push(score.score)
        return acc
      }, {} as Record<string, { criteria: any, scores: number[] }>)

      // Calculate average score for each criteria
      const criteriaScores = Object.values(scoresByCriteria).map(({ criteria, scores }) => {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
        return {
          criteriaId: criteria.id,
          criteriaName: criteria.name,
          weight: criteria.weight,
          average,
          scores,
        }
      })

      // Calculate weighted total score
      const totalWeight = criteriaScores.reduce((sum, { weight }) => sum + weight, 0)
      const totalScore = criteriaScores.reduce(
        (sum, { average, weight }) => sum + (average * weight),
        0
      ) / (totalWeight || 1)

      return {
        submissionId: submission.id,
        title: submission.title,
        categoryId: submission.categoryId,
        categoryName: submission.category.name,
        participantId: submission.participation.userId,
        participantName: submission.participation.user.nombre || submission.participation.user.email,
        criteriaScores,
        totalScore,
        media: submission.media[0]?.url,
        ganado: submission.ganado,
      }
    })

    // Group by category and sort by score
    const resultsByCategory = results.reduce((acc, result) => {
      if (!acc[result.categoryId]) {
        acc[result.categoryId] = {
          categoryId: result.categoryId,
          categoryName: result.categoryName,
          submissions: [],
        }
      }
      acc[result.categoryId].submissions.push(result)
      return acc
    }, {} as Record<string, { categoryId: string, categoryName: string, submissions: typeof results }>) 

    // Sort submissions by score within each category
    Object.values(resultsByCategory).forEach(category => {
      category.submissions.sort((a, b) => b.totalScore - a.totalScore)
    })

    return NextResponse.json({
      contestId: params.contestId,
      categories: Object.values(resultsByCategory),
    })
  } catch (error) {
    console.error('Error fetching results:', error)
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

    // Check if user has permission to publish results
    const userRole = await prisma.contestUserRole.findFirst({
      where: {
        userId: session.user.sub,
        contestId: params.contestId,
        role: 'CONTEST_ADMINISTRATOR',
      },
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Update contest status and publish results
    const contest = await prisma.contest.update({
      where: { id: params.contestId },
      data: {
        status: ContestStatus.COMPLETED,
        resultsPublished: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      resultsPublished: contest.resultsPublished,
    })
  } catch (error) {
    console.error('Error publishing results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}