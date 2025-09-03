import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeSupplierVariants = searchParams.get('includeSupplierVariants') === 'true'
    
    const systemVariants = await prisma.systemVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        supplierVariants: includeSupplierVariants ? {
          include: {
            factory: {
              select: {
                id: true,
                name: true,
                code: true,
                isActive: true
              }
            }
          }
        } : false
      },
      orderBy: [
        { product: { name: 'asc' } },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json({ systemVariants })
  } catch (error) {
    console.error('Error fetching system variants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system variants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const systemVariant = await prisma.systemVariant.create({
      data: {
        code: body.code,
        productId: body.productId,
        name: body.name,
        size: body.size,
        color: body.color,
        material: body.material,
        style: body.style,
        price: body.price,
        costPrice: body.costPrice,
        stock: body.stock || 0,
        lowStockAlert: body.lowStockAlert || 10,
        isActive: body.isActive ?? true
      },
      include: {
        product: true,
        supplierVariants: {
          include: {
            factory: true
          }
        }
      }
    })
    
    return NextResponse.json({ systemVariant })
  } catch (error) {
    console.error('Error creating system variant:', error)
    return NextResponse.json(
      { error: 'Failed to create system variant' },
      { status: 500 }
    )
  }
}