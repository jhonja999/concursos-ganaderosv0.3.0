import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

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

    const media = await prisma.submissionMedia.findMany({
      where: { submissionId: params.submissionId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
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

    // Check if user is the owner or has admin permissions
    const isOwner = submission.participation.userId === session.user.sub
    const hasAdminPermission = await requireContestPermission(
      session.user.sub,
      params.contestId,
      'canManageSubmissions'
    )

    if (!isOwner && !hasAdminPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const isPrimary = formData.get('isPrimary') === 'true'
    const caption = formData.get('caption') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['image', 'video', 'document'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid media type' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the limit (5MB)' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, buffer)

    // Generate URL
    const url = `/uploads/${filename}`

    // If this is set as primary, update other media to not be primary
    if (isPrimary) {
      await prisma.submissionMedia.updateMany({
        where: { submissionId: params.submissionId },
        data: { isPrimary: false },
      })
    }

    // Create media record
    const media = await prisma.submissionMedia.create({
      data: {
        type,
        url,
        filename,
        mimeType: file.type,
        size: file.size,
        isPrimary,
        caption,
        submissionId: params.submissionId,
      },
    })

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}