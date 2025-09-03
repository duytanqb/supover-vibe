import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/advances - List all advances with filters
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const teamId = searchParams.get('teamId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build where clause based on user role
    let where: any = {}
    
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

    // Non-admin users can only see their own advances
    if (!isAdmin) {
      where.userId = payload.userId
    } else if (userId) {
      where.userId = userId
    }

    if (teamId) where.teamId = teamId
    if (status) where.status = status
    if (type) where.type = type

    const advances = await prisma.cashAdvance.findMany({
      where,
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
        },
        rejector: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        repayments: {
          orderBy: {
            repaymentDate: 'desc'
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return NextResponse.json({ advances })
  } catch (error) {
    console.error('Error fetching advances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advances' },
      { status: 500 }
    )
  }
}

// POST /api/advances/request - Create new advance request
export async function POST(request: NextRequest) {
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
    const { type, amount, reason, notes, dueDate } = body

    // Get user's team
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        teamMember: true,
        sellerWallet: true
      }
    })

    if (!user?.teamMember?.teamId) {
      return NextResponse.json(
        { error: 'User must be part of a team to request advances' },
        { status: 400 }
      )
    }

    // Check if user has a wallet, create if not
    let wallet = user.sellerWallet
    if (!wallet) {
      wallet = await prisma.sellerWallet.create({
        data: {
          userId: payload.userId,
          teamId: user.teamMember.teamId
        }
      })
    }

    // Check advance limit
    const outstandingAdvances = await prisma.cashAdvance.aggregate({
      where: {
        userId: payload.userId,
        status: {
          in: ['PENDING', 'APPROVED', 'DISBURSED', 'PARTIALLY_REPAID', 'OUTSTANDING']
        }
      },
      _sum: {
        outstandingAmount: true
      }
    })

    const totalOutstanding = outstandingAdvances._sum.outstandingAmount || 0
    if (Number(totalOutstanding) + amount > Number(wallet.advanceLimit)) {
      return NextResponse.json(
        { error: `Advance would exceed limit of $${wallet.advanceLimit}` },
        { status: 400 }
      )
    }

    // Generate advance number
    const advanceCount = await prisma.cashAdvance.count()
    const advanceNumber = `ADV${String(advanceCount + 1).padStart(6, '0')}`

    // Create advance request
    const advance = await prisma.cashAdvance.create({
      data: {
        advanceNumber,
        userId: payload.userId,
        teamId: user.teamMember.teamId,
        type,
        amount,
        reason,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        outstandingAmount: amount
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
        }
      }
    })

    return NextResponse.json({ advance })
  } catch (error) {
    console.error('Error creating advance request:', error)
    return NextResponse.json(
      { error: 'Failed to create advance request' },
      { status: 500 }
    )
  }
}