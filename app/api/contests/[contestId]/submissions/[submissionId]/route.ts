import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '@/lib/prisma'
import { requireContestPermission } from '@/lib/rbac'
import { SubmissionStatus } from '@prisma/client'

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
          include: {
            user: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
            contest: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
              },
            },
          },
        },
        category: true,
        media: true,
        ganado: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            raza: true,
            sexo: true,
            numRegistro: true,
            fechaNac: true,
            establo: true,
            propietario: true,
            criador: true,
          },
        },
        scores: {
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

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const {
      title,
      description,
      status,
      metadata,
      categoryId,
      ganadoId,
    } = body

    // Validate status change
    if (status && status !== submission.status) {
      // Only admins can change to certain statuses
      if (
        (status === SubmissionStatus.UNDER_REVIEW || 
         status === SubmissionStatus.JUDGED || 
         status === SubmissionStatus.DISQUALIFIED) && 
        !hasAdminPermission
      ) {
        return NextResponse.json(
          { error: 'You do not have permission to change to this status' },
          { status: 403 }
        )
      }

      // If changing to SUBMITTED, set submittedAt
      if (status === SubmissionStatus.SUBMITTED && submission.status === SubmissionStatus.DRAFT) {
        body.submittedAt = new Date()
      }
    }

    // Update submission
    const updatedSubmission = await prisma.contestSubmission.update({
      where: { id: params.submissionId },
      data: {
        title,
        description,
        status,
        metadata,
        submittedAt: status === SubmissionStatus.SUBMITTED && !submission.submittedAt ? new Date() : undefined,
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

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Only allow deletion of draft submissions by participants
    if (isOwner && !hasAdminPermission && submission.status !== SubmissionStatus.DRAFT) {
      return NextResponse.json(
        { error: 'Only draft submissions can be deleted' },
        { status: 400 }
      )
    }

    // Delete submission and related media
    await prisma.$transaction([
      prisma.submissionMedia.deleteMany({
        where: { submissionId: params.submissionId },
      }),
      prisma.judgingScore.deleteMany({
        where: { submissionId: params.submissionId },
      }),
      prisma.contestSubmission.delete({
        where: { id: params.submissionId },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}