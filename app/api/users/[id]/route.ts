import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  // Username cannot be changed after creation
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

    if (!hasAdminRole) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToUpdate) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: "Another user with this email already exists" },
          { status: 400 }
        )
      }
    }

    const updateData: any = { ...validatedData }
    
    if (validatedData.password) {
      updateData.password = await bcryptjs.hash(validatedData.password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_UPDATED",
        entity: "User",
        entityId: userId,
        oldValue: {
          name: userToUpdate.name,
          email: userToUpdate.email,
          phone: userToUpdate.phone,
          isActive: userToUpdate.isActive,
        },
        newValue: validatedData,
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: "User updated successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("User update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!hasAdminRole) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const userId = params.id

    if (userId === currentUser.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: true,
        teamMember: true,
      },
    })

    if (!userToDelete) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (userToDelete.teamMember) {
      await prisma.teamMember.delete({
        where: { id: userToDelete.teamMember.id },
      })
    }

    if (userToDelete.userRoles.length > 0) {
      await prisma.userRole.deleteMany({
        where: { userId },
      })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_DELETED",
        entity: "User",
        entityId: userId,
        oldValue: {
          name: userToDelete.name,
          email: userToDelete.email,
          phone: userToDelete.phone,
          isActive: userToDelete.isActive,
        },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("User deletion error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}