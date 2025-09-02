import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SELLER", "DESIGNER", "FULFILLER", "FINANCE", "SUPPORT"]),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

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
        { message: "User already exists with this email" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
      },
    })

    const role = await prisma.role.findUnique({
      where: { code: validatedData.role }
    })

    if (role) {
      await prisma.userRoles.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "7d" }
    )

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_CREATED",
        entity: "User",
        entityId: user.id,
        newValue: { email: user.email, name: user.name, role: validatedData.role },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: validatedData.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}