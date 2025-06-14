import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string, criteriaId: string } }
) {
  try {
    const criteria = await prisma.judgingCriteria.findUnique({
      where: { id: params.criteriaId },
    })

    if (!criteria) {
      return NextResponse.json(
        { error: 'Criteria not found' },
        { status: 404 }
      )
    }

    // Verify criteria belongs to this contest
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

    return NextResponse.json(criteria)
  } catch (error) {
    console.error('Error fetching criteria:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { contestId: string, criteriaId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to manage criteria
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

    const criteria = await prisma.judgingCriteria.findUnique({
      where: { id: params.criteriaId },
    })

    if (!criteria) {
      return NextResponse.json(
        { error: 'Criteria not found' },
        { status: 404 }
      )
    }

    // Verify criteria belongs to this contest
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

    const body = await request.json()
    const {
      name,
      description,
      weight,
      maxScore,
      order,
      categoryId,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // If changing category, verify it belongs to this contest
    if (categoryId && categoryId !== criteria.categoryId) {
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
    }

    // Update criteria
    const updatedCriteria = await prisma.judgingCriteria.update({
      where: { id: params.criteriaId },
      data: {
        name,
        description,
        weight: weight || 1.0,
        maxScore: maxScore || 100,
        order: order || 0,
        contestId: categoryId ? null : params.contestId,
        categoryId,
      },
    })

    return NextResponse.json(updatedCriteria)
  } catch (error) {
    console.error('Error updating criteria:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contestId: string, criteriaId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to manage criteria
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

    const criteria = await prisma.judgingCriteria.findUnique({
      where: { id: params.criteriaId },
      include: {
        _count: {
          select: {
            scores: true,
          },
        },
      },
    })

    if (!criteria) {
      return NextResponse.json(
        { error: 'Criteria not found' },
        { status: 404 }
      )
    }

    // Verify criteria belongs to this contest
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

    // Check if criteria has scores
    if (criteria._count.scores > 0) {
      return NextResponse.json(
        { error: 'Cannot delete criteria with scores' },
        { status: 400 }
      )
    }

    await prisma.judgingCriteria.delete({
      where: { id: params.criteriaId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting criteria:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}