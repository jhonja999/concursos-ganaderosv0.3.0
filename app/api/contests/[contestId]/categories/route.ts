import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    const categories = await prisma.contestCategory.findMany({
      where: { contestId: params.contestId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
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

    // Check if user has permission to manage categories
    const hasPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageCategories'
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
      order,
      ageMin,
      ageMax,
      sexo,
      productType,
      weightMin,
      weightMax,
      maxEntries,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get contest to check its type
    const contest = await prisma.contest.findUnique({
      where: { id: params.contestId },
      select: { type: true },
    })

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      )
    }

    // Create category with type-specific fields
    const category = await prisma.contestCategory.create({
      data: {
        name,
        description,
        order: order || 0,
        contestId: params.contestId,
        // Livestock-specific fields
        ageMin: contest.type === 'LIVESTOCK' ? ageMin : undefined,
        ageMax: contest.type === 'LIVESTOCK' ? ageMax : undefined,
        sexo: contest.type === 'LIVESTOCK' ? sexo : undefined,
        // Product-specific fields
        productType: ['COFFEE_PRODUCTS', 'GENERAL_PRODUCTS'].includes(contest.type) ? productType : undefined,
        weightMin: ['COFFEE_PRODUCTS', 'GENERAL_PRODUCTS'].includes(contest.type) ? weightMin : undefined,
        weightMax: ['COFFEE_PRODUCTS', 'GENERAL_PRODUCTS'].includes(contest.type) ? weightMax : undefined,
        // Common fields
        maxEntries,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}