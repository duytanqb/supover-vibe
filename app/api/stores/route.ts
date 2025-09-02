import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ChannelType } from '@prisma/client'

const createStoreSchema = z.object({
  teamId: z.string().cuid(),
  name: z.string().min(1, 'Store name is required'),
  platform: z.nativeEnum(ChannelType),
  storeUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  sellerId: z.string().optional(),
  region: z.string().optional(),
  currency: z.string().default('USD'),
  settings: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const platform = searchParams.get('platform')
    
    const where: any = {}
    if (teamId) where.teamId = teamId
    if (platform) where.platform = platform as ChannelType
    
    const stores = await prisma.store.findMany({
      where,
      include: {
        team: true,
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createStoreSchema.parse(body)
    
    const store = await prisma.store.create({
      data: {
        ...validatedData,
        settings: validatedData.settings || {}
      },
      include: {
        team: true
      }
    })
    
    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    )
  }
}