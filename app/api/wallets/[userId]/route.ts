import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/wallets/[userId] - Get wallet details
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

    // Non-admin users can only see their own wallet
    if (!isAdmin && payload.userId !== params.userId) {
      return NextResponse.json(
        { error: 'You can only view your own wallet' },
        { status: 403 }
      )
    }

    // Get or create wallet
    let wallet = await prisma.sellerWallet.findUnique({
      where: { userId: params.userId },
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
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!wallet) {
      // Get user's team
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        include: {
          teamMember: true
        }
      })

      if (!user?.teamMember?.teamId) {
        return NextResponse.json(
          { error: 'User must be part of a team to have a wallet' },
          { status: 400 }
        )
      }

      // Create wallet
      wallet = await prisma.sellerWallet.create({
        data: {
          userId: params.userId,
          teamId: user.teamMember.teamId
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
          transactions: true
        }
      })
    }

    // Calculate outstanding advances
    const outstandingAdvances = await prisma.cashAdvance.aggregate({
      where: {
        userId: params.userId,
        status: {
          in: ['DISBURSED', 'PARTIALLY_REPAID', 'OUTSTANDING']
        }
      },
      _sum: {
        outstandingAmount: true
      }
    })

    // Get recent advances
    const recentAdvances = await prisma.cashAdvance.findMany({
      where: { userId: params.userId },
      orderBy: { requestedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        advanceNumber: true,
        type: true,
        amount: true,
        status: true,
        outstandingAmount: true,
        requestedAt: true,
        disbursedAt: true
      }
    })

    return NextResponse.json({ 
      wallet: {
        ...wallet,
        outstandingAdvances: outstandingAdvances._sum.outstandingAmount || 0,
        availableCredit: Number(wallet.advanceLimit) - (Number(outstandingAdvances._sum.outstandingAmount) || 0),
        recentAdvances
      }
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}