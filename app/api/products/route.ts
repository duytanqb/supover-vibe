import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const sku = searchParams.get('sku')
    const name = searchParams.get('name')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const where: any = {}
    if (storeId) where.storeId = storeId
    if (sku) where.sku = { contains: sku, mode: 'insensitive' }
    if (name) where.name = { contains: name, mode: 'insensitive' }
    if (isActive) where.isActive = isActive === 'true'
    
    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            platform: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            designs: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    
    const total = await prisma.product.count({ where })
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
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
    
    // Check if SKU already exists for this store
    const existingProduct = await prisma.product.findUnique({
      where: {
        storeId_sku: {
          storeId: body.storeId,
          sku: body.sku
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
      data: {
        storeId: body.storeId,
        sku: body.sku,
        name: body.name,
        description: body.description,
        basePrice: body.basePrice,
        costPrice: body.costPrice,
        weight: body.weight,
        dimensions: body.dimensions,
        category: body.category,
        tags: body.tags || [],
        isActive: body.isActive ?? true
      },
      include: {
        store: {
          select: {
            name: true,
            platform: true
          }
        }
      }
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}