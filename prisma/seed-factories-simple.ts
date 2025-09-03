import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedFactories() {
  console.log('🏭 Creating factories...')
  
  // Create Gearment factory
  const gearment = await prisma.factory.upsert({
    where: { code: 'GEAR' },
    update: {
      name: 'Gearment',
      isActive: true,
      capabilities: ['T-SHIRT', 'HOODIE', 'TANK_TOP', 'LONG_SLEEVE'],
      printMethods: ['DTG', 'SCREEN_PRINT', 'EMBROIDERY']
    },
    create: {
      name: 'Gearment',
      code: 'GEAR',
      address: {
        line1: '123 Production Way',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90001'
      },
      capacity: 10000,
      isActive: true,
      capabilities: ['T-SHIRT', 'HOODIE', 'TANK_TOP', 'LONG_SLEEVE'],
      printMethods: ['DTG', 'SCREEN_PRINT', 'EMBROIDERY'],
      apiEndpoint: 'https://api.gearment.com/v1',
      apiKey: 'gearment-api-key',
      apiSecret: 'gearment-api-secret',
      settings: {
        defaultTurnaround: 3,
        rushAvailable: true,
        minOrderQuantity: 1,
        supportedCountries: ['USA', 'CANADA', 'UK', 'EU']
      }
    }
  })

  // Create Pressify factory
  const pressify = await prisma.factory.upsert({
    where: { code: 'PRESS' },
    update: {
      name: 'Pressify',
      isActive: true,
      capabilities: ['MUG', 'POSTER', 'CANVAS', 'PHONE_CASE', 'TOTE_BAG'],
      printMethods: ['SUBLIMATION', 'UV_PRINT', 'VINYL']
    },
    create: {
      name: 'Pressify',
      code: 'PRESS',
      address: {
        line1: '456 Print Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      },
      capacity: 15000,
      isActive: true,
      capabilities: ['MUG', 'POSTER', 'CANVAS', 'PHONE_CASE', 'TOTE_BAG'],
      printMethods: ['SUBLIMATION', 'UV_PRINT', 'VINYL'],
      apiEndpoint: 'https://api.pressify.io/v2',
      apiKey: 'pressify-api-key',
      apiSecret: 'pressify-api-secret',
      settings: {
        defaultTurnaround: 2,
        rushAvailable: true,
        minOrderQuantity: 1,
        supportedCountries: ['USA', 'CANADA', 'MEXICO']
      }
    }
  })

  console.log('✅ Created factories:', { 
    gearment: gearment.name, 
    pressify: pressify.name 
  })

  return { gearment, pressify }
}

async function main() {
  try {
    const result = await seedFactories()
    console.log('✅ Factory seeding completed successfully!')
    console.log('📊 Created:', result)
  } catch (error) {
    console.error('❌ Error seeding factories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })