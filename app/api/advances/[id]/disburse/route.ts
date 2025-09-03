import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// POST /api/advances/[id]/disburse - Disburse an approved advance
export async function POST(
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

    // Check if user has permission to disburse advances
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

    const canDisburse = userWithRoles?.userRoles.some(ur => 
      ur.role.code === 'SUPER_ADMIN' || 
      ur.role.code === 'ADMIN' || 
      ur.role.code === 'FINANCE'
    )

    if (!canDisburse) {
      return NextResponse.json(
        { error: 'You do not have permission to disburse advances' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { notes } = body

    // Get the advance
    const advance = await prisma.cashAdvance.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            sellerWallet: true
          }
        }
      }
    })

    if (!advance) {
      return NextResponse.json(
        { error: 'Advance not found' },
        { status: 404 }
      )
    }

    if (advance.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved advances can be disbursed' },
        { status: 400 }
      )
    }

    // Ensure user has a wallet
    let wallet = advance.user.sellerWallet
    if (!wallet) {
      wallet = await prisma.sellerWallet.create({
        data: {
          userId: advance.userId,
          teamId: advance.teamId
        }
      })
    }

    // Start transaction for disbursement
    const result = await prisma.$transaction(async (tx) => {
      // Update advance status
      const updatedAdvance = await tx.cashAdvance.update({
        where: { id: params.id },
        data: {
          status: 'DISBURSED',
          disbursedAt: new Date(),
          notes: notes || advance.notes
        }
      })

      // Update wallet balances
      const updatedWallet = await tx.sellerWallet.update({
        where: { id: wallet!.id },
        data: {
          totalAdvances: {
            increment: advance.amount
          },
          lastActivityAt: new Date()
        }
      })

      // Create wallet transaction
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet!.id,
          type: 'ADVANCE',
          amount: advance.amount,
          balanceBefore: wallet!.balance,
          balanceAfter: wallet!.balance, // Balance doesn't change for advances
          referenceType: 'CashAdvance',
          referenceId: advance.id,
          description: `Advance disbursement: ${advance.advanceNumber}`,
          metadata: {
            advanceNumber: advance.advanceNumber,
            type: advance.type,
            reason: advance.reason
          },
          createdBy: payload.userId
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: payload.userId,
          action: 'DISBURSE_ADVANCE',
          entity: 'CashAdvance',
          entityId: params.id,
          metadata: {
            advanceNumber: advance.advanceNumber,
            amount: advance.amount,
            walletTransactionId: walletTransaction.id,
            notes
          }
        }
      })

      return { advance: updatedAdvance, walletTransaction }
    })

    // Fetch complete advance with relations
    const completeAdvance = await prisma.cashAdvance.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({ 
      advance: completeAdvance,
      walletTransaction: result.walletTransaction 
    })
  } catch (error) {
    console.error('Error disbursing advance:', error)
    return NextResponse.json(
      { error: 'Failed to disburse advance' },
      { status: 500 }
    )
  }
}