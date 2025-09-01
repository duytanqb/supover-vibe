import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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

    const { id: teamId, userId } = params

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
      include: {
        team: true,
        user: true,
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      )
    }

    await prisma.teamMember.delete({
      where: { id: teamMember.id },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_REMOVED_FROM_TEAM",
        entity: "TeamMember",
        entityId: teamMember.id,
        oldValue: {
          userId,
          teamId,
          isLeader: teamMember.isLeader,
          teamName: teamMember.team.name,
          userName: teamMember.user.name,
        },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
      },
    })

    return NextResponse.json({
      message: "User removed from team successfully",
    })
  } catch (error) {
    console.error("Remove team member error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}