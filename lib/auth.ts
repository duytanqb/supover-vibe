import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
  team?: {
    id: string
    name: string
  }
  isImpersonating?: boolean
  adminUser?: {
    id: string
    name: string
    email: string
  }
  impersonationSession?: {
    id: string
    reason: string
    expiresAt: Date
  }
}

export async function verifyAuth(authHeader: string | null): Promise<AuthUser | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.type === 'impersonation') {
      return await verifyImpersonationToken(decoded)
    }
    
    return await verifyRegularToken(decoded)
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

async function verifyRegularToken(decoded: any): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
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
  
  if (!user || !user.isActive) {
    return null
  }
  
  return {
    id: user.id,
    name: user.name || '',
    email: user.email,
    roles: user.userRoles.map(ur => ur.role.code),
    team: user.teamMember?.team ? {
      id: user.teamMember.team.id,
      name: user.teamMember.team.name
    } : undefined
  }
}

async function verifyImpersonationToken(decoded: any): Promise<AuthUser | null> {
  const session = await prisma.impersonationSession.findUnique({
    where: { sessionToken: decoded.sessionToken },
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
      }
    }
  })
  
  if (!session || !session.isActive || session.expiresAt < new Date()) {
    return null
  }
  
  const hasAdminRole = session.adminUser.userRoles.some(ur => 
    ['SUPER_ADMIN', 'ADMIN'].includes(ur.role.code)
  )
  
  if (!hasAdminRole) {
    return null
  }
  
  return {
    id: session.targetUser.id,
    name: session.targetUser.name || '',
    email: session.targetUser.email,
    roles: session.targetUser.userRoles.map(ur => ur.role.code),
    team: session.targetUser.teamMember?.team ? {
      id: session.targetUser.teamMember.team.id,
      name: session.targetUser.teamMember.team.name
    } : undefined,
    isImpersonating: true,
    adminUser: {
      id: session.adminUser.id,
      name: session.adminUser.name || '',
      email: session.adminUser.email
    },
    impersonationSession: {
      id: session.id,
      reason: session.reason || '',
      expiresAt: session.expiresAt
    }
  }
}

export function hasPermission(user: AuthUser, requiredRoles: string[]): boolean {
  return user.roles.some(role => requiredRoles.includes(role))
}

export function canImpersonate(user: AuthUser): boolean {
  return hasPermission(user, ['SUPER_ADMIN', 'ADMIN'])
}