import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { OrderStatus, PaymentStatus } from '@prisma/client'

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        store: {
          include: {
            team: true
          }
        },
        items: {
          include: {
            product: true,
            design: {
              select: {
                id: true,
                name: true,
                status: true,
                thumbnailUrl: true,
                printReadyFile: true
              }
            }
          }
        },
        fulfillments: {
          include: {
            factory: true,
            design: {
              select: {
                id: true,
                name: true,
                thumbnailUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        productions: {
          include: {
            factory: true
          }
        },
        shipments: {
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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
    const validatedData = updateOrderSchema.parse(body)
    
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: validatedData,
        include: {
          store: true,
          items: {
            include: {
              product: true,
              design: true
            }
          }
        }
      })
      
      if (validatedData.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            status: validatedData.status,
            reason: 'Status updated via API'
          }
        })
      }
      
      return updatedOrder
    })
    
    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}