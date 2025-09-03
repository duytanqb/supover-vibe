import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// PUT /api/advances/[id]/reject - Reject an advance request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user has permission to reject advances
    const userWithRoles = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    const canReject = userWithRoles?.userRoles.some(ur => 
      ur.role.code === 'SUPER_ADMIN' || 
      ur.role.code === 'ADMIN' || 
      ur.role.code === 'FINANCE'
    )

    if (!canReject) {
      return NextResponse.json(
        { error: 'You do not have permission to reject advances' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rejectionNote } = body

    if (!rejectionNote) {
      return NextResponse.json(
        { error: 'Rejection note is required' },
        { status: 400 }
      )
    }

    // Get the advance
    const advance = await prisma.cashAdvance.findUnique({
      where: { id: params.id }
    })

    if (!advance) {
      return NextResponse.json(
        { error: 'Advance not found' },
        { status: 404 }
      )
    }

    if (advance.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending advances can be rejected' },
        { status: 400 }
      )
    }

    // Update advance status
    const updatedAdvance = await prisma.cashAdvance.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectedBy: payload.userId,
        rejectedAt: new Date(),
        rejectionNote
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        rejector: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'REJECT_ADVANCE',
        entity: 'CashAdvance',
        entityId: params.id,
        metadata: {
          advanceNumber: advance.advanceNumber,
          amount: advance.amount,
          rejectionNote
        }
      }
    })

    return NextResponse.json({ advance: updatedAdvance })
  } catch (error) {
    console.error('Error rejecting advance:', error)
    return NextResponse.json(
      { error: 'Failed to reject advance' },
      { status: 500 }
    )
  }
}