import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { factoryId: string } }
) {
  try {
    const body = await request.json()
    const { factoryId } = params
    
    const factory = await prisma.factory.update({
      where: { id: factoryId },
      data: {
        name: body.name,
        code: body.code,
        supplierType: body.supplierType,
        companyName: body.companyName,
        website: body.website,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        paymentTerms: body.paymentTerms,
        minimumOrder: body.minimumOrder,
        leadTime: body.leadTime,
        capacity: body.capacity,
        qualityRating: body.qualityRating,
        isActive: body.isActive,
        isPrimary: body.isPrimary
      },
      include: {
        locations: true,
        _count: {
          select: {
            fulfillments: true,
            supplierVariants: true,
            factoryProducts: true,
            locations: true
          }
        }
      }
    })
    
    return NextResponse.json({ factory })
  } catch (error) {
    console.error('Error updating factory:', error)
    return NextResponse.json(
      { error: 'Failed to update factory' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { factoryId: string } }
) {
  try {
    const { factoryId } = params
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const includeMappings = searchParams.get('includeMappings') === 'true'
    const includeLocations = searchParams.get('includeLocations') === 'true'
    
    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
      include: {
        factoryProducts: includeProducts ? true : false,
        locations: includeLocations ? true : false,
        supplierVariants: includeMappings ? {
          include: {
            systemVariant: {
              include: {
                product: true
              }
            }
          }
        } : false,
        _count: {
          select: {
            fulfillments: true,
            supplierVariants: true,
            factoryProducts: true,
            locations: true
          }
        }
      }
    })
    
    if (!factory) {
      return NextResponse.json(
        { error: 'Factory not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ factory })
  } catch (error) {
    console.error('Error fetching factory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch factory' },
      { status: 500 }
    )
  }
}