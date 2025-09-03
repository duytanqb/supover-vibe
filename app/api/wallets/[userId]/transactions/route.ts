import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/wallets/[userId]/transactions - Get wallet transactions
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    // Non-admin users can only see their own transactions
    if (!isAdmin && payload.userId !== params.userId) {
      return NextResponse.json(
        { error: 'You can only view your own transactions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get wallet
    const wallet = await prisma.sellerWallet.findUnique({
      where: { userId: params.userId }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Build where clause
    let where: any = { walletId: wallet.id }
    if (type) where.type = type
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.walletTransaction.count({ where })
    ])

    return NextResponse.json({ 
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/wallets/[userId]/transactions - Create manual transaction (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create manual transactions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, amount, description, referenceType, referenceId, metadata } = body

    // Get wallet
    const wallet = await prisma.sellerWallet.findUnique({
      where: { userId: params.userId }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Calculate new balance
    let newBalance = Number(wallet.balance)
    let newAvailableBalance = Number(wallet.availableBalance)

    if (type === 'CREDIT' || type === 'PROFIT_SHARE') {
      newBalance += Number(amount)
      newAvailableBalance += Number(amount)
    } else if (type === 'DEBIT' || type === 'REPAYMENT') {
      newBalance -= Number(amount)
      newAvailableBalance -= Number(amount)
    } else if (type === 'HOLD') {
      newAvailableBalance -= Number(amount)
    } else if (type === 'RELEASE') {
      newAvailableBalance += Number(amount)
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet
      const updatedWallet = await tx.sellerWallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          availableBalance: newAvailableBalance,
          lastActivityAt: new Date(),
          ...(type === 'REPAYMENT' && {
            totalRepayments: {
              increment: amount
            }
          }),
          ...(type === 'PROFIT_SHARE' && {
            totalProfitShare: {
              increment: amount
            }
          })
        }
      })

      // Create transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          description,
          referenceType,
          referenceId,
          metadata: metadata || {},
          createdBy: payload.userId
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: payload.userId,
          action: 'CREATE_WALLET_TRANSACTION',
          entity: 'WalletTransaction',
          entityId: transaction.id,
          metadata: {
            walletId: wallet.id,
            userId: params.userId,
            type,
            amount,
            description
          }
        }
      })

      return { wallet: updatedWallet, transaction }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating wallet transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}