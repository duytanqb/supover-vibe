import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { DesignStatus } from '@prisma/client'

const updateDesignSchema = z.object({
  name: z.string().min(1).optional(),
  fileUrl: z.string().url().optional(),
  printReadyFile: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  artworkData: z.record(z.any()).optional(),
  printSpecs: z.record(z.any()).optional(),
  status: z.nativeEnum(DesignStatus).optional(),
  designerId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const design = await prisma.design.findUnique({
      where: { id: params.id },
      include: {
        team: true,
        products: {
          include: {
            product: {
              include: {
                store: {
                  select: {
                    name: true,
                    platform: true
                  }
                }
              }
            }
          }
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                createdAt: true
              }
            }
          },
          take: 20,
          orderBy: { createdAt: 'desc' }
        },
        fulfillments: {
          include: {
            factory: {
              select: {
                name: true,
                code: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            orderItems: true,
            fulfillments: true
          }
        }
      }
    })
    
    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(design)
  } catch (error) {
    console.error('Error fetching design:', error)
    return NextResponse.json(
      { error: 'Failed to fetch design' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateDesignSchema.parse(body)
    
    const updateData: any = { ...validatedData }
    
    if (validatedData.status === DesignStatus.ARCHIVED) {
      updateData.archivedAt = new Date()
    } else if (validatedData.status && validatedData.status !== DesignStatus.ARCHIVED) {
      updateData.archivedAt = null
    }
    
    const design = await prisma.design.update({
      where: { id: params.id },
      data: updateData,
      include: {
        team: true,
        _count: {
          select: {
            orderItems: true,
            fulfillments: true
          }
        }
      }
    })
    
    return NextResponse.json(design)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating design:', error)
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fulfillmentCount = await prisma.fulfillment.count({
      where: { designId: params.id }
    })
    
    if (fulfillmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete design with existing fulfillments' },
        { status: 409 }
      )
    }
    
    await prisma.design.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting design:', error)
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    )
  }
}