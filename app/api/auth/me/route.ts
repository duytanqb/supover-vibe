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
    ) as { userId: string; email: string }

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

    // Get all user permissions from their roles
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
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    )
  }
}