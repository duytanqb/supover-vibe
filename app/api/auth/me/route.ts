import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No valid token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as any

    if (decoded.type === 'impersonation') {
      return await handleImpersonationAuth(decoded)
    }
    
    return await handleRegularAuth(decoded, token)
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    )
  }
}

async function handleRegularAuth(decoded: any, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      teamMember: {
        include: {
          team: true,
        },
      },
    },
  })

  if (!user || !user.isActive) {
    return NextResponse.json(
      { message: "User not found or inactive" },
      { status: 404 }
    )
  }

  const session = await prisma.session.findFirst({
    where: {
      token,
      userId: user.id,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!session) {
    return NextResponse.json(
      { message: "Invalid or expired session" },
      { status: 401 }
    )
  }

  const userPermissions = user.userRoles.flatMap(ur => 
    ur.role.permissions.map(rp => `${rp.permission.resource}.${rp.permission.action}`)
  )

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      roles: user.userRoles.map(ur => ur.role.code),
      permissions: userPermissions,
      team: user.teamMember?.team,
      lastLoginAt: user.lastLoginAt,
    },
  })
}

async function handleImpersonationAuth(decoded: any) {
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
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
          teamMember: {
            include: {
              team: true,
            },
          },
        }
      }
    }
  })
  
  if (!session || !session.isActive || session.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "Invalid or expired impersonation session" },
      { status: 401 }
    )
  }
  
  const hasAdminRole = session.adminUser.userRoles.some(ur => 
    ['SUPER_ADMIN', 'ADMIN'].includes(ur.role.code)
  )
  
  if (!hasAdminRole) {
    return NextResponse.json(
      { message: "Insufficient admin permissions" },
      { status: 403 }
    )
  }
  
  const userPermissions = session.targetUser.userRoles.flatMap(ur => 
    ur.role.permissions.map(rp => `${rp.permission.resource}.${rp.permission.action}`)
  )

  return NextResponse.json({
    user: {
      id: session.targetUser.id,
      name: session.targetUser.name,
      email: session.targetUser.email,
      avatar: session.targetUser.avatar,
      phone: session.targetUser.phone,
      roles: session.targetUser.userRoles.map(ur => ur.role.code),
      permissions: userPermissions,
      team: session.targetUser.teamMember?.team,
      lastLoginAt: session.targetUser.lastLoginAt,
      isImpersonating: true,
      adminUser: {
        id: session.adminUser.id,
        name: session.adminUser.name,
        email: session.adminUser.email
      },
      impersonationSession: {
        id: session.id,
        reason: session.reason,
        expiresAt: session.expiresAt,
        startedAt: session.startedAt
      }
    },
  })
}