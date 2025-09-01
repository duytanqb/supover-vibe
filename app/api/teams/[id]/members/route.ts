import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { z } from "zod"

const addMemberSchema = z.object({
  userId: z.string(),
  isLeader: z.boolean().default(false),
})

export async function POST(
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

    const teamId = params.id
    const body = await request.json()
    const { userId, isLeader } = addMemberSchema.parse(body)

    const team = await prisma.team.findUnique({
      where: { id: teamId }
    })

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMember: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (user.teamMember) {
      return NextResponse.json(
        { message: "User is already a member of another team" },
        { status: 400 }
      )
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        userId,
        teamId,
        isLeader,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_ADDED_TO_TEAM",
        entity: "TeamMember",
        entityId: teamMember.id,
        newValue: {
          userId,
          teamId,
          isLeader,
          teamName: team.name,
          userName: user.name,
        },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "User added to team successfully",
      teamMember,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Add team member error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}