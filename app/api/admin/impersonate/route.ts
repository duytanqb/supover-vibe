import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const impersonateSchema = z.object({
  targetUserId: z.string().cuid(),
  reason: z.string().min(1, 'Reason is required'),
  duration: z.number().min(1).max(480).default(60)
})

async function verifyAdminPermission(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization header')
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }
    
    const hasAdminRole = user.userRoles.some(ur => 
      ['SUPER_ADMIN', 'ADMIN'].includes(ur.role.code)
    )
    
    if (!hasAdminRole) {
      throw new Error('Insufficient permissions for impersonation')
    }
    
    return user
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminPermission(request)
    const body = await request.json()
    const { targetUserId, reason, duration } = impersonateSchema.parse(body)
    
    if (adminUser.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot impersonate yourself' },
        { status: 400 }
      )
    }
    
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
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
    })
    
    if (!targetUser || !targetUser.isActive) {
      return NextResponse.json(
        { error: 'Target user not found or inactive' },
        { status: 404 }
      )
    }
    
    const targetHasSuperAdmin = targetUser.userRoles.some(ur => 
      ur.role.code === 'SUPER_ADMIN'
    )
    
    if (targetHasSuperAdmin && adminUser.userRoles.every(ur => ur.role.code !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Cannot impersonate super admin without super admin privileges' },
        { status: 403 }
      )
    }
    
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + duration * 60 * 1000)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    const impersonationSession = await prisma.impersonationSession.create({
      data: {
        adminUserId: adminUser.id,
        targetUserId,
        sessionToken,
        reason,
        ipAddress: clientIp,
        userAgent,
        expiresAt
      },
      include: {
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
    
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'IMPERSONATION_START',
        entity: 'User',
        entityId: targetUserId,
        newValue: {
          targetUserId,
          reason,
          duration,
          sessionToken: sessionToken.substring(0, 8) + '...'
        },
        ipAddress: clientIp,
        userAgent
      }
    })
    
    const impersonationToken = jwt.sign(
      {
        type: 'impersonation',
        adminUserId: adminUser.id,
        targetUserId,
        sessionToken,
        exp: Math.floor(expiresAt.getTime() / 1000)
      },
      process.env.JWT_SECRET!
    )
    
    return NextResponse.json({
      impersonationToken,
      sessionId: impersonationSession.id,
      targetUser: impersonationSession.targetUser,
      expiresAt,
      adminUser: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Impersonation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Impersonation failed' },
      { status: error instanceof Error && error.message.includes('permissions') ? 403 : 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('sessionToken')
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 400 }
      )
    }
    
    const session = await prisma.impersonationSession.findUnique({
      where: { sessionToken },
      include: {
        adminUser: true,
        targetUser: true
      }
    })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    await prisma.impersonationSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
        endedAt: new Date()
      }
    })
    
    await prisma.auditLog.create({
      data: {
        userId: session.adminUserId,
        action: 'IMPERSONATION_END',
        entity: 'User',
        entityId: session.targetUserId,
        metadata: {
          sessionId: session.id,
          duration: Date.now() - session.startedAt.getTime()
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('End impersonation error:', error)
    return NextResponse.json(
      { error: 'Failed to end impersonation' },
      { status: 500 }
    )
  }
}