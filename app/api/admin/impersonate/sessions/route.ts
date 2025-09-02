import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const sessions = await prisma.impersonationSession.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })
    
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching impersonation sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}