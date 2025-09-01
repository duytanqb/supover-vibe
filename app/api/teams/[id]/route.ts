import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { z } from "zod"

const teamSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  region: z.string().optional(),
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

    const teamId = params.id
    const body = await request.json()
    const validatedData = teamSchema.parse(body)

    const existingTeam = await prisma.team.findFirst({
      where: {
        code: validatedData.code,
        NOT: { id: teamId }
      }
    })

    if (existingTeam) {
      return NextResponse.json(
        { message: "Another team with this code already exists" },
        { status: 400 }
      )
    }

    const oldTeam = await prisma.team.findUnique({
      where: { id: teamId }
    })

    if (!oldTeam) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      )
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: validatedData,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "TEAM_UPDATED",
        entity: "Team",
        entityId: teamId,
        oldValue: {
          name: oldTeam.name,
          code: oldTeam.code,
          description: oldTeam.description,
          region: oldTeam.region,
        },
        newValue: validatedData,
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Team update error:", error)
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

    const teamId = params.id

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    })

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      )
    }

    if (team.members.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete team with existing members. Remove all members first." },
        { status: 400 }
      )
    }

    await prisma.team.delete({
      where: { id: teamId },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "TEAM_DELETED",
        entity: "Team",
        entityId: teamId,
        oldValue: {
          name: team.name,
          code: team.code,
          description: team.description,
          region: team.region,
        },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "Team deleted successfully",
    })
  } catch (error) {
    console.error("Team deletion error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}