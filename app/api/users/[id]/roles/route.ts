import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { z } from "zod"

const roleAssignmentSchema = z.object({
  roleIds: z.array(z.string()).min(1, "At least one role must be selected"),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const hasAdminRole = currentUser.userRoles.some(ur => 
      ur.role.code === 'ADMIN' || ur.role.code === 'SUPER_ADMIN'
    )

    const hasLeaderRole = currentUser.userRoles.some(ur => 
      ur.role.code === 'LEADER'
    )

    if (!hasAdminRole && !hasLeaderRole) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const { roleIds } = roleAssignmentSchema.parse(body)

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!userToUpdate) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const roles = await prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    })

    if (roles.length !== roleIds.length) {
      return NextResponse.json(
        { message: "One or more roles not found" },
        { status: 400 }
      )
    }

    if (hasLeaderRole && !hasAdminRole) {
      const restrictedRoles = ['SUPER_ADMIN', 'ADMIN']
      const hasRestrictedRole = roles.some(role => restrictedRoles.includes(role.code))
      
      if (hasRestrictedRole) {
        return NextResponse.json(
          { message: "Leaders cannot assign admin roles" },
          { status: 403 }
        )
      }
    }

    const oldRoles = userToUpdate.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      code: ur.role.code,
    }))

    await prisma.userRole.deleteMany({
      where: { userId },
    })

    const newUserRoles = await Promise.all(
      roleIds.map(roleId =>
        prisma.userRole.create({
          data: {
            userId,
            roleId,
          },
        })
      )
    )

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_ROLES_UPDATED",
        entity: "UserRole",
        entityId: userId,
        oldValue: { roles: oldRoles },
        newValue: { 
          roles: roles.map(role => ({
            id: role.id,
            name: role.name,
            code: role.code,
          }))
        },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "User roles updated successfully",
      userRoles: newUserRoles,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("User role update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}