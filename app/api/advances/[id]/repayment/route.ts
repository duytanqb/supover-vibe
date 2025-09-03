import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/advances/[id]/repayment - Get repayment schedule and history
export async function GET(
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

    // Get advance with repayments
    const advance = await prisma.cashAdvance.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        repayments: {
          include: {
            order: {
              select: {
                id: true,
                orderCode: true,
                orderNumber: true,
                total: true
              }
            }
          },
          orderBy: {
            repaymentDate: 'desc'
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

    // Check permissions
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

    const isAdmin = userWithRoles?.userRoles.some(ur => 
      ur.role.code === 'SUPER_ADMIN' || 
      ur.role.code === 'ADMIN' || 
      ur.role.code === 'FINANCE'
    )

    if (!isAdmin && advance.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'You can only view your own advance repayments' },
        { status: 403 }
      )
    }

    // Calculate repayment summary
    const totalRepaid = advance.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
    const remainingBalance = Number(advance.amount) - totalRepaid
    const repaymentPercentage = (totalRepaid / Number(advance.amount)) * 100

    return NextResponse.json({
      advance: {
        id: advance.id,
        advanceNumber: advance.advanceNumber,
        amount: advance.amount,
        status: advance.status,
        disbursedAt: advance.disbursedAt,
        dueDate: advance.dueDate
      },
      repaymentSummary: {
        totalAmount: advance.amount,
        totalRepaid,
        remainingBalance,
        repaymentPercentage: repaymentPercentage.toFixed(2),
        repaymentCount: advance.repayments.length
      },
      repayments: advance.repayments
    })
  } catch (error) {
    console.error('Error fetching repayment details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repayment details' },
      { status: 500 }
    )
  }
}

// POST /api/advances/[id]/repayment - Create repayment
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

    const body = await request.json()
    const { amount, orderId, method, reference, notes } = body

    // Check if user is admin
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

    const isAdmin = userWithRoles?.userRoles.some(ur => 
      ur.role.code === 'SUPER_ADMIN' || 
      ur.role.code === 'ADMIN' || 
      ur.role.code === 'FINANCE'
    )

    // Get advance
    const advance = await prisma.cashAdvance.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            sellerWallet: true
          }
        },
        repayments: true
      }
    })

    if (!advance) {
      return NextResponse.json(
        { error: 'Advance not found' },
        { status: 404 }
      )
    }

    // Check if advance can be repaid
    if (!['DISBURSED', 'PARTIALLY_REPAID', 'OUTSTANDING'].includes(advance.status)) {
      return NextResponse.json(
        { error: 'This advance cannot accept repayments' },
        { status: 400 }
      )
    }

    // Calculate total repaid
    const totalRepaid = advance.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
    const remainingBalance = Number(advance.amount) - totalRepaid

    if (amount > remainingBalance) {
      return NextResponse.json(
        { error: `Repayment amount exceeds outstanding balance of $${remainingBalance}` },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create repayment
      const repayment = await tx.advanceRepayment.create({
        data: {
          advanceId: params.id,
          userId: advance.userId,
          orderId,
          amount,
          method: method || 'MANUAL',
          reference,
          notes
        }
      })

      // Update advance
      const newTotalRepaid = totalRepaid + amount
      const newOutstanding = Number(advance.amount) - newTotalRepaid
      const newStatus = newOutstanding === 0 ? 'REPAID' : 'PARTIALLY_REPAID'

      const updatedAdvance = await tx.cashAdvance.update({
        where: { id: params.id },
        data: {
          repaidAmount: newTotalRepaid,
          outstandingAmount: newOutstanding,
          status: newStatus
        }
      })

      // Update wallet if exists
      if (advance.user.sellerWallet) {
        await tx.sellerWallet.update({
          where: { id: advance.user.sellerWallet.id },
          data: {
            totalRepayments: {
              increment: amount
            },
            lastActivityAt: new Date()
          }
        })

        // Create wallet transaction
        await tx.walletTransaction.create({
          data: {
            walletId: advance.user.sellerWallet.id,
            type: 'REPAYMENT',
            amount,
            balanceBefore: advance.user.sellerWallet.balance,
            balanceAfter: advance.user.sellerWallet.balance,
            referenceType: 'AdvanceRepayment',
            referenceId: repayment.id,
            description: `Repayment for advance ${advance.advanceNumber}`,
            metadata: {
              advanceId: advance.id,
              advanceNumber: advance.advanceNumber,
              orderId,
              method
            },
            createdBy: payload.userId
          }
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: payload.userId,
          action: 'CREATE_REPAYMENT',
          entity: 'AdvanceRepayment',
          entityId: repayment.id,
          metadata: {
            advanceId: advance.id,
            advanceNumber: advance.advanceNumber,
            amount,
            newOutstanding,
            newStatus
          }
        }
      })

      return { repayment, advance: updatedAdvance }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating repayment:', error)
    return NextResponse.json(
      { error: 'Failed to create repayment' },
      { status: 500 }
    )
  }
}