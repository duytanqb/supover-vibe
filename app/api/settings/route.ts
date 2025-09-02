import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { verifyAuth, hasPermission } from "@/lib/auth"

const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: z.string(),
  description: z.string().optional(),
  isSecret: z.boolean().default(false),
})

const settingsSchema = z.object({
  settings: z.array(settingSchema),
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

    if (!hasPermission(user, ['ADMIN', 'SUPER_ADMIN'])) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const settings = await prisma.systemSettings.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    })

    // Mask secret values for security
    const maskedSettings = settings.map(setting => ({
      ...setting,
      value: setting.isSecret ? (setting.value ? '********' : '') : setting.value,
    }))

    return NextResponse.json({ settings: maskedSettings })
  } catch (error) {
    console.error("Settings fetch error:", error)
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
    const { settings } = settingsSchema.parse(body)

    // Process each setting
    for (const setting of settings) {
      const existingSetting = await prisma.systemSettings.findUnique({
        where: { key: setting.key }
      })

      if (existingSetting) {
        // Update existing setting only if value changed
        if (existingSetting.value !== setting.value) {
          await prisma.systemSettings.update({
            where: { key: setting.key },
            data: {
              value: setting.value,
              category: setting.category,
              description: setting.description,
              isSecret: setting.isSecret,
              updatedBy: user.id,
            },
          })

          // Log the change
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "SETTING_UPDATED",
              entity: "SystemSettings",
              entityId: existingSetting.id,
              oldValue: { 
                key: setting.key, 
                value: existingSetting.isSecret ? "***" : existingSetting.value 
              },
              newValue: { 
                key: setting.key, 
                value: setting.isSecret ? "***" : setting.value 
              },
              ipAddress: request.ip,
              userAgent: request.headers.get("user-agent"),
            },
          })
        }
      } else {
        // Create new setting
        const newSetting = await prisma.systemSettings.create({
          data: {
            key: setting.key,
            value: setting.value,
            category: setting.category,
            description: setting.description,
            isSecret: setting.isSecret,
            updatedBy: user.id,
          },
        })

        // Log the creation
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "SETTING_CREATED",
            entity: "SystemSettings",
            entityId: newSetting.id,
            newValue: { 
              key: setting.key, 
              value: setting.isSecret ? "***" : setting.value,
              category: setting.category,
            },
            ipAddress: request.ip,
            userAgent: request.headers.get("user-agent"),
          },
        })
      }
    }

    return NextResponse.json({
      message: "Settings updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Settings update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}