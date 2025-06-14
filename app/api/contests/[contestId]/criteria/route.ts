import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    let where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    } else {
      where.contestId = params.contestId
    }

    const criteria = await prisma.judgingCriteria.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(criteria)
  } catch (error) {
    console.error('Error fetching criteria:', error)
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

    // If categoryId is provided, check if it belongs to this contest
    if (categoryId) {
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

    // Create criteria
    const criteria = await prisma.judgingCriteria.create({
      data: {
        name,
        description,
        weight: weight || 1.0,
        maxScore: maxScore || 100,
        order: order || 0,
        contestId: categoryId ? undefined : params.contestId,
        categoryId,
      },
    })

    return NextResponse.json(criteria, { status: 201 })
  } catch (error) {
    console.error('Error creating criteria:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}