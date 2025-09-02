import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.type !== 'impersonation') {
      return NextResponse.json(
        { error: 'Not an impersonation token' },
        { status: 400 }
      )
    }
    
    const session = await prisma.impersonationSession.findUnique({
      where: { 
        sessionToken: decoded.sessionToken
      },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
            userRoles: {
              include: {
                role: true
              }
            }
          }
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            userRoles: {
              include: {
                role: true
              }
            },
            teamMember: {
              include: {
                team: true
              }
            }
          }
        }
      }
    })
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired impersonation session' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      isImpersonating: true,
      session: {
        id: session.id,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        reason: session.reason
      },
      adminUser: session.adminUser,
      targetUser: session.targetUser,
      user: session.targetUser
    })
  } catch (error) {
    console.error('Impersonation verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    )
  }
}