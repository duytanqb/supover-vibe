import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// PUT /api/advances/[id]/approve - Approve an advance request
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

    // Check if user has permission to approve advances
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

    const canApprove = userWithRoles?.userRoles.some(ur => 
      ur.role.code === 'SUPER_ADMIN' || 
      ur.role.code === 'ADMIN' || 
      ur.role.code === 'FINANCE'
    )

    if (!canApprove) {
      return NextResponse.json(
        { error: 'You do not have permission to approve advances' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { notes } = body

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
        { error: 'Only pending advances can be approved' },
        { status: 400 }
      )
    }

    // Update advance status
    const updatedAdvance = await prisma.cashAdvance.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedBy: payload.userId,
        approvedAt: new Date(),
        notes: notes || advance.notes
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
        approver: {
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
        action: 'APPROVE_ADVANCE',
        entity: 'CashAdvance',
        entityId: params.id,
        metadata: {
          advanceNumber: advance.advanceNumber,
          amount: advance.amount,
          notes
        }
      }
    })

    return NextResponse.json({ advance: updatedAdvance })
  } catch (error) {
    console.error('Error approving advance:', error)
    return NextResponse.json(
      { error: 'Failed to approve advance' },
      { status: 500 }
    )
  }
}