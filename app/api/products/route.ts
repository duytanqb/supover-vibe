import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  storeId: z.string().cuid(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  basePrice: z.number().positive('Base price must be positive'),
  costPrice: z.number().positive('Cost price must be positive'),
  weight: z.number().positive().optional(),
  dimensions: z.record(z.any()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([])
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    const where: any = {}
    if (storeId) where.storeId = storeId
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const products = await prisma.product.findMany({
      where,
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
        designs: {
          include: {
            design: {
              select: {
                id: true,
                name: true,
                thumbnailUrl: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)
    
    const existingProduct = await prisma.product.findUnique({
      where: {
        storeId_sku: {
          storeId: validatedData.storeId,
          sku: validatedData.sku
        }
      }
    })
    
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists in this store' },
        { status: 409 }
      )
    }
    
    const product = await prisma.product.create({
      data: validatedData,
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
        }
      }
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}