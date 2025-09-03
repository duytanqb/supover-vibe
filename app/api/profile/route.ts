import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const authResult = await verifyAuth(authHeader)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        roles: {
          include: {
            role: {
              select: {
                name: true,
                description: true,
              }
            }
          }
        },
        teamMembers: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                code: true,
                description: true,
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Format response
    const profile = {
      ...user,
      roles: user.roles.map(ur => ur.role),
      team: user.teamMembers[0]?.team || null,
      isLeader: user.teamMembers[0]?.isLeader || false,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// Profile update schema
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  preferences: z.object({
    language: z.string().optional(),
    timezone: z.string().optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
    }).optional(),
  }).optional(),
})

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const authResult = await verifyAuth(authHeader)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const updateData: any = {}

    // Basic fields
    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone

    // Email change (check uniqueness)
    if (data.email && data.email !== authResult.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
      updateData.email = data.email
      updateData.emailVerified = null // Reset verification
    }

    // Password change (requires current password)
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: 'Current password required to change password' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: { password: true }
      })

      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        user!.password
      )

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(data.newPassword, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: authResult.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        updatedAt: true,
      }
    })

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.id,
        action: 'USER_PROFILE_UPDATE',
        tableName: 'User',
        recordId: authResult.user.id,
        oldValues: JSON.stringify(authResult.user),
        newValues: JSON.stringify(updatedUser),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        userAgent: request.headers.get('user-agent') || '',
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile - Delete user account (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const authResult = await verifyAuth(authHeader)
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Require password confirmation
    const body = await request.json()
    const { password, reason } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password confirmation required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: { password: true }
    })

    const isValidPassword = await bcrypt.compare(password, user!.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      )
    }

    // Soft delete - just deactivate the account
    await prisma.user.update({
      where: { id: authResult.user.id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${authResult.user.email}`, // Prefix to allow email reuse
        deletedAt: new Date(),
      }
    })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.id,
        action: 'USER_ACCOUNT_DELETION',
        tableName: 'User',
        recordId: authResult.user.id,
        oldValues: JSON.stringify({ reason }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        userAgent: request.headers.get('user-agent') || '',
      }
    })

    return NextResponse.json({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}