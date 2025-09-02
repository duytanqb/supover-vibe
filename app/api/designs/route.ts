import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DesignStatus } from '@prisma/client'
import crypto from 'crypto'

const createDesignSchema = z.object({
  teamId: z.string().cuid(),
  name: z.string().min(1, 'Design name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  printReadyFile: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  artworkData: z.record(z.any()).optional(),
  printSpecs: z.record(z.any()).optional(),
  designerId: z.string().cuid().optional(),
  sellerId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
})

function createFingerprint(data: {
  teamId: string
  sellerId?: string
  artworkData?: any
  printSpecs?: any
}): string {
  const fingerprintData = {
    team: data.teamId,
    seller: data.sellerId || '',
    artwork: JSON.stringify(data.artworkData || {}),
    specs: JSON.stringify(data.printSpecs || {})
  }
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(fingerprintData))
    .digest('hex')
    .substring(0, 16)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const status = searchParams.get('status')
    const sellerId = searchParams.get('sellerId')
    const search = searchParams.get('search')
    
    const where: any = {}
    if (teamId) where.teamId = teamId
    if (status) where.status = status as DesignStatus
    if (sellerId) where.sellerId = sellerId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }
    
    const designs = await prisma.design.findMany({
      where,
      include: {
        team: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            fulfillments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(designs)
  } catch (error) {
    console.error('Error fetching designs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDesignSchema.parse(body)
    
    const fingerprint = createFingerprint({
      teamId: validatedData.teamId,
      sellerId: validatedData.sellerId,
      artworkData: validatedData.artworkData,
      printSpecs: validatedData.printSpecs
    })
    
    const existingDesign = await prisma.design.findUnique({
      where: { fingerprint }
    })
    
    if (existingDesign) {
      return NextResponse.json(
        { error: 'Design with this fingerprint already exists', designId: existingDesign.id },
        { status: 409 }
      )
    }
    
    const design = await prisma.design.create({
      data: {
        ...validatedData,
        fingerprint,
        metadata: validatedData.metadata || {}
      },
      include: {
        team: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(design, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating design:', error)
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 }
    )
  }
}