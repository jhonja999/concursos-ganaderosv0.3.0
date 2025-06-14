import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { ContestType, ContestStatus } from '@prisma/client'
import { generateSlug } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const type = searchParams.get('type') as ContestType | null
    const status = searchParams.get('status') as ContestStatus | null
    const search = searchParams.get('search') || ''
    const featured = searchParams.get('featured') === 'true'

    const skip = (page - 1) * pageSize

    let where: any = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (featured) {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [contests, total] = await Promise.all([
      prisma.contest.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              nombre: true,
              slug: true,
            },
          },
          _count: {
            select: {
              participations: true,
              submissions: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.contest.count({ where }),
    ])

    return NextResponse.json({
      contests,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching contests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
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
      companyId,
    } = body

    // Validate required fields
    if (!name || !type || !registrationStart || !registrationEnd || !contestStart || !contestEnd || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = generateSlug(name)

    // Check if slug already exists
    const existingContest = await prisma.contest.findUnique({
      where: { slug },
    })

    if (existingContest) {
      return NextResponse.json(
        { error: 'Contest with this name already exists' },
        { status: 400 }
      )
    }

    // Validate dates
    const regStart = new Date(registrationStart)
    const regEnd = new Date(registrationEnd)
    const contStart = new Date(contestStart)
    const contEnd = new Date(contestEnd)

    if (regStart >= regEnd || regEnd > contStart || contStart >= contEnd) {
      return NextResponse.json(
        { error: 'Invalid date sequence' },
        { status: 400 }
      )
    }

    const contest = await prisma.contest.create({
      data: {
        name,
        slug,
        description,
        type,
        registrationStart: regStart,
        registrationEnd: regEnd,
        contestStart: contStart,
        contestEnd: contEnd,
        maxParticipants,
        entryFee: entryFee || 0,
        rules,
        prizes,
        isPublic: isPublic ?? true,
        isFeatured: isFeatured ?? false,
        bannerImage,
        companyId,
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

    // Assign the creator as contest administrator
    await prisma.contestUserRole.create({
      data: {
        userId: session.user.sub,
        contestId: contest.id,
        role: 'CONTEST_ADMINISTRATOR',
      },
    })

    return NextResponse.json(contest, { status: 201 })
  } catch (error) {
    console.error('Error creating contest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}