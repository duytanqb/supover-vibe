import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const includeMappings = searchParams.get('includeMappings') === 'true'
    const includeLocations = searchParams.get('includeLocations') === 'true'
    
    const factories = await prisma.factory.findMany({
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
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json({ factories })
  } catch (error) {
    console.error('Error fetching factories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch factories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const factory = await prisma.factory.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        capacity: body.capacity,
        capabilities: body.capabilities || [],
        printMethods: body.printMethods || [],
        apiEndpoint: body.apiEndpoint,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        settings: body.settings || {},
        isActive: body.isActive ?? true
      }
    })
    
    return NextResponse.json({ factory })
  } catch (error) {
    console.error('Error creating factory:', error)
    return NextResponse.json(
      { error: 'Failed to create factory' },
      { status: 500 }
    )
  }
}