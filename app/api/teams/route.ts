import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { verifyAuth, hasPermission } from "@/lib/auth"

const teamSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  region: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!hasPermission(user, ['ADMIN', 'SUPER_ADMIN', 'LEADER'])) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Teams fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const user = await verifyAuth(authHeader)
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!hasPermission(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = teamSchema.parse(body)

    const existingTeam = await prisma.team.findUnique({
      where: { code: validatedData.code }
    })

    if (existingTeam) {
      return NextResponse.json(
        { message: "Team with this code already exists" },
        { status: 400 }
      )
    }

    const team = await prisma.team.create({
      data: validatedData,
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "TEAM_CREATED",
        entity: "Team",
        entityId: team.id,
        newValue: validatedData,
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "Team created successfully",
      team,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Team creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}