import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const userSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
})

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

    // Verify user has permission to read users
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

    // Check if user has admin role or users.read permission
    const hasAdminRole = currentUser.userRoles.some(ur => 
      ur.role.code === 'ADMIN' || ur.role.code === 'SUPER_ADMIN'
    )

    if (!hasAdminRole) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        teamMember: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        roles: user.userRoles,
        teamMember: user.teamMember,
      }))
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcryptjs.hash(validatedData.password, 12)

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        isActive: validatedData.isActive,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_CREATED",
        entity: "User",
        entityId: user.id,
        newValue: {
          username: validatedData.username,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          isActive: validatedData.isActive,
        },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("User creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}