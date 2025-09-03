import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { OrderStatus, PaymentStatus } from '@prisma/client'

// Generate unique 9-character order code
function generateOrderCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 9; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const createOrderSchema = z.object({
  storeId: z.string().cuid(),
  orderNumber: z.string().min(1, 'Order number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email().optional(),
  shippingAddress: z.record(z.any()),
  billingAddress: z.record(z.any()).optional(),
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    printSpecs: z.record(z.any()).optional(),
    artworkData: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional()
  })).min(1, 'At least one item is required')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status')
    const customerEmail = searchParams.get('customerEmail')
    const orderNumber = searchParams.get('orderNumber')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const where: any = {}
    if (storeId) where.storeId = storeId
    if (status) where.status = status as OrderStatus
    if (customerEmail) where.customerEmail = customerEmail
    if (orderNumber) {
      where.orderNumber = { contains: orderNumber, mode: 'insensitive' }
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
            platform: true,
            team: {
              select: {
                id: true,
                name: true,
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                        name: true
                      }
                    }
                  },
                  where: {
                    isLeader: true
                  }
                }
              }
            }
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            },
            design: {
              select: {
                id: true,
                name: true,
                status: true,
                thumbnailUrl: true
              }
            }
          }
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
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            items: true,
            fulfillments: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    
    const total = await prisma.order.count({ where })
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)
    
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: validatedData.orderNumber }
    })
    
    if (existingOrder) {
      return NextResponse.json(
        { error: 'Order number already exists' },
        { status: 409 }
      )
    }
    
    // Generate unique order code
    let orderCode = generateOrderCode()
    let codeExists = true
    while (codeExists) {
      const existing = await prisma.order.findUnique({
        where: { orderCode }
      })
      if (!existing) {
        codeExists = false
      } else {
        orderCode = generateOrderCode()
      }
    }
    
    const order = await prisma.order.create({
      data: {
        storeId: validatedData.storeId,
        orderNumber: validatedData.orderNumber,
        orderCode,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        shippingAddress: validatedData.shippingAddress,
        billingAddress: validatedData.billingAddress,
        subtotal: validatedData.subtotal,
        shippingCost: validatedData.shippingCost,
        tax: validatedData.tax,
        discount: validatedData.discount,
        total: validatedData.total,
        currency: validatedData.currency,
        notes: validatedData.notes,
        metadata: validatedData.metadata || {},
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            printSpecs: item.printSpecs,
            artworkData: item.artworkData,
            metadata: item.metadata || {}
          }))
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            reason: 'Order created'
          }
        }
      },
      include: {
        store: {
          select: {
            name: true,
            platform: true,
            team: {
              select: {
                name: true
              }
            }
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}