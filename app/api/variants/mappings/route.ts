import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const supplierVariant = await prisma.supplierVariant.create({
      data: {
        factoryId: body.factoryId,
        systemVariantCode: body.systemVariantCode,
        supplierProductCode: body.supplierProductCode,
        supplierVariantCode: body.supplierVariantCode,
        supplierSku: body.supplierSku,
        supplierName: body.supplierName,
        size: body.size,
        color: body.color,
        material: body.material,
        style: body.style,
        supplierPrice: body.supplierPrice,
        minimumQuantity: body.minimumQuantity || 1,
        leadTime: body.leadTime,
        isAvailable: true,
        lastSyncedAt: new Date()
      },
      include: {
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true
          }
        },
        systemVariant: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json({ supplierVariant })
  } catch (error) {
    console.error('Error creating supplier variant:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier variant' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supplierVariants = await prisma.supplierVariant.findMany({
      include: {
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true
          }
        },
        systemVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: [
        { factory: { name: 'asc' } },
        { systemVariant: { name: 'asc' } }
      ]
    })
    
    return NextResponse.json({ supplierVariants })
  } catch (error) {
    console.error('Error fetching supplier variants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier variants' },
      { status: 500 }
    )
  }
}