import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSuppliers() {
  console.log('🏭 Creating suppliers and their locations...')
  
  // Create Gearment supplier with multiple locations
  const gearment = await prisma.factory.upsert({
    where: { code: 'GEAR' },
    update: {
      name: 'Gearment',
      supplierType: 'MANUFACTURER',
      companyName: 'Gearment LLC',
      website: 'https://gearment.com',
      contactName: 'John Smith',
      contactEmail: 'orders@gearment.com',
      contactPhone: '+1-555-GEAR-001',
      currency: 'USD',
      paymentTerms: 'NET_30',
      minimumOrder: 50.00,
      leadTime: 3,
      capacity: 10000,
      isActive: true,
      isPrimary: true,
      capabilities: ['T-SHIRT', 'HOODIE', 'TANK_TOP', 'LONG_SLEEVE'],
      printMethods: ['DTG', 'SCREEN_PRINT', 'EMBROIDERY'],
      apiEndpoint: 'https://api.gearment.com/v1',
      apiKey: 'gearment-api-key',
      apiSecret: 'gearment-api-secret',
      qualityRating: 4.8,
      certifications: ['ISO_9001', 'OEKO_TEX'],
      settings: {
        defaultTurnaround: 3,
        rushAvailable: true,
        minOrderQuantity: 1,
        supportedCountries: ['USA', 'CANADA', 'UK', 'EU']
      }
    },
    create: {
      name: 'Gearment',
      code: 'GEAR',
      supplierType: 'MANUFACTURER',
      companyName: 'Gearment LLC',
      website: 'https://gearment.com',
      contactName: 'John Smith',
      contactEmail: 'orders@gearment.com',
      contactPhone: '+1-555-GEAR-001',
      currency: 'USD',
      paymentTerms: 'NET_30',
      minimumOrder: 50.00,
      leadTime: 3,
      capacity: 10000,
      isActive: true,
      isPrimary: true,
      capabilities: ['T-SHIRT', 'HOODIE', 'TANK_TOP', 'LONG_SLEEVE'],
      printMethods: ['DTG', 'SCREEN_PRINT', 'EMBROIDERY'],
      apiEndpoint: 'https://api.gearment.com/v1',
      apiKey: 'gearment-api-key',
      apiSecret: 'gearment-api-secret',
      qualityRating: 4.8,
      certifications: ['ISO_9001', 'OEKO_TEX'],
      settings: {
        defaultTurnaround: 3,
        rushAvailable: true,
        minOrderQuantity: 1,
        supportedCountries: ['USA', 'CANADA', 'UK', 'EU']
      }
    }
  })

  // Create Pressify supplier
  const pressify = await prisma.factory.upsert({
    where: { code: 'PRESS' },
    update: {
      name: 'Pressify',
      supplierType: 'PRINTER',
      companyName: 'Pressify Corp',
      website: 'https://pressify.io',
      contactName: 'Sarah Johnson',
      contactEmail: 'support@pressify.io',
      contactPhone: '+1-555-PRESS-002',
      currency: 'USD',
      paymentTerms: 'PREPAID',
      minimumOrder: 25.00,
      leadTime: 2,
      capacity: 15000,
      isActive: true,
      isPrimary: false,
      capabilities: ['MUG', 'POSTER', 'CANVAS', 'PHONE_CASE', 'TOTE_BAG'],
      printMethods: ['SUBLIMATION', 'UV_PRINT', 'VINYL'],
      apiEndpoint: 'https://api.pressify.io/v2',
      apiKey: 'pressify-api-key',
      apiSecret: 'pressify-api-secret',
      qualityRating: 4.6,
      certifications: ['ISO_14001'],
      settings: {
        defaultTurnaround: 2,
        rushAvailable: true,
        minOrderQuantity: 1,
        supportedCountries: ['USA', 'CANADA', 'MEXICO']
      }
    },
    create: {
      name: 'Pressify',
      code: 'PRESS',
      supplierType: 'PRINTER',
      companyName: 'Pressify Corp',
      website: 'https://pressify.io',
      contactName: 'Sarah Johnson',
      contactEmail: 'support@pressify.io',
      contactPhone: '+1-555-PRESS-002',
      currency: 'USD',
      paymentTerms: 'PREPAID',
      minimumOrder: 25.00,
      leadTime: 2,
      capacity: 15000,
      isActive: true,
      isPrimary: false,
      capabilities: ['MUG', 'POSTER', 'CANVAS', 'PHONE_CASE', 'TOTE_BAG'],
      printMethods: ['SUBLIMATION', 'UV_PRINT', 'VINYL'],
      apiEndpoint: 'https://api.pressify.io/v2',
      apiKey: 'pressify-api-key',
      apiSecret: 'pressify-api-secret',
      qualityRating: 4.6,
      certifications: ['ISO_14001'],
      settings: {
        defaultTurnaround: 2,
        rushAvailable: true,
        minOrderQuantity: 1,
        supportedCountries: ['USA', 'CANADA', 'MEXICO']
      }
    }
  })

  console.log('✅ Created suppliers:', { 
    gearment: gearment.name, 
    pressify: pressify.name 
  })

  // Create locations for Gearment
  const gearmentLocations = await Promise.all([
    prisma.factoryLocation.upsert({
      where: {
        factoryId_locationCode: {
          factoryId: gearment.id,
          locationCode: 'GEAR-HQ'
        }
      },
      update: {},
      create: {
        factoryId: gearment.id,
        locationName: 'Gearment Headquarters',
        locationType: 'HEADQUARTERS',
        locationCode: 'GEAR-HQ',
        addressLine1: '123 Production Way',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        contactName: 'John Smith',
        contactEmail: 'hq@gearment.com',
        contactPhone: '+1-555-GEAR-001',
        operatingHours: {
          monday: '08:00-17:00',
          tuesday: '08:00-17:00',
          wednesday: '08:00-17:00',
          thursday: '08:00-17:00',
          friday: '08:00-17:00',
          saturday: 'Closed',
          sunday: 'Closed'
        },
        capabilities: ['T-SHIRT', 'HOODIE', 'TANK_TOP'],
        capacity: 5000,
        shippingZones: ['US_WEST', 'US_CENTRAL'],
        isDefault: true,
        isActive: true
      }
    }),
    prisma.factoryLocation.upsert({
      where: {
        factoryId_locationCode: {
          factoryId: gearment.id,
          locationCode: 'GEAR-EAST'
        }
      },
      update: {},
      create: {
        factoryId: gearment.id,
        locationName: 'Gearment East Coast Facility',
        locationType: 'PRODUCTION',
        locationCode: 'GEAR-EAST',
        addressLine1: '789 Industrial Blvd',
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30301',
        country: 'USA',
        latitude: 33.7490,
        longitude: -84.3880,
        contactName: 'Mike Davis',
        contactEmail: 'east@gearment.com',
        contactPhone: '+1-555-GEAR-002',
        operatingHours: {
          monday: '07:00-16:00',
          tuesday: '07:00-16:00',
          wednesday: '07:00-16:00',
          thursday: '07:00-16:00',
          friday: '07:00-16:00',
          saturday: 'Closed',
          sunday: 'Closed'
        },
        capabilities: ['LONG_SLEEVE', 'HOODIE'],
        capacity: 3000,
        shippingZones: ['US_EAST', 'CANADA_EAST'],
        isDefault: false,
        isActive: true
      }
    }),
    prisma.factoryLocation.upsert({
      where: {
        factoryId_locationCode: {
          factoryId: gearment.id,
          locationCode: 'GEAR-EU'
        }
      },
      update: {},
      create: {
        factoryId: gearment.id,
        locationName: 'Gearment Europe Warehouse',
        locationType: 'WAREHOUSE',
        locationCode: 'GEAR-EU',
        addressLine1: '45 Factory Road',
        city: 'Manchester',
        state: 'Greater Manchester',
        postalCode: 'M1 2AB',
        country: 'UK',
        latitude: 53.4808,
        longitude: -2.2426,
        contactName: 'Emma Wilson',
        contactEmail: 'eu@gearment.com',
        contactPhone: '+44-20-7946-0958',
        operatingHours: {
          monday: '09:00-17:00',
          tuesday: '09:00-17:00',
          wednesday: '09:00-17:00',
          thursday: '09:00-17:00',
          friday: '09:00-17:00',
          saturday: 'Closed',
          sunday: 'Closed'
        },
        capabilities: ['T-SHIRT', 'HOODIE'],
        capacity: 2000,
        shippingZones: ['EUROPE', 'UK'],
        isDefault: false,
        isActive: true
      }
    })
  ])

  // Create locations for Pressify
  const pressifyLocations = await Promise.all([
    prisma.factoryLocation.upsert({
      where: {
        factoryId_locationCode: {
          factoryId: pressify.id,
          locationCode: 'PRESS-NYC'
        }
      },
      update: {},
      create: {
        factoryId: pressify.id,
        locationName: 'Pressify New York Hub',
        locationType: 'HEADQUARTERS',
        locationCode: 'PRESS-NYC',
        addressLine1: '456 Print Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        contactName: 'Sarah Johnson',
        contactEmail: 'nyc@pressify.io',
        contactPhone: '+1-555-PRESS-002',
        operatingHours: {
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '10:00-14:00',
          sunday: 'Closed'
        },
        capabilities: ['MUG', 'POSTER', 'CANVAS'],
        capacity: 8000,
        shippingZones: ['US_EAST', 'CANADA_EAST'],
        isDefault: true,
        isActive: true
      }
    }),
    prisma.factoryLocation.upsert({
      where: {
        factoryId_locationCode: {
          factoryId: pressify.id,
          locationCode: 'PRESS-TX'
        }
      },
      update: {},
      create: {
        factoryId: pressify.id,
        locationName: 'Pressify Texas Facility',
        locationType: 'PRODUCTION',
        locationCode: 'PRESS-TX',
        addressLine1: '123 Print Plaza',
        city: 'Austin',
        state: 'TX',
        postalCode: '73301',
        country: 'USA',
        latitude: 30.2672,
        longitude: -97.7431,
        contactName: 'Carlos Rodriguez',
        contactEmail: 'texas@pressify.io',
        contactPhone: '+1-555-PRESS-003',
        operatingHours: {
          monday: '07:00-16:00',
          tuesday: '07:00-16:00',
          wednesday: '07:00-16:00',
          thursday: '07:00-16:00',
          friday: '07:00-16:00',
          saturday: 'Closed',
          sunday: 'Closed'
        },
        capabilities: ['PHONE_CASE', 'TOTE_BAG', 'POSTER'],
        capacity: 5000,
        shippingZones: ['US_CENTRAL', 'US_WEST', 'MEXICO'],
        isDefault: false,
        isActive: true
      }
    })
  ])

  console.log('✅ Created supplier locations:', {
    gearment: gearmentLocations.length,
    pressify: pressifyLocations.length
  })

  // Create factory products with more detailed supplier information
  const gearmentProducts = await Promise.all([
    prisma.factoryProduct.upsert({
      where: { 
        factoryId_productCode: {
          factoryId: gearment.id,
          productCode: 'GEAR-TSHIRT-001'
        }
      },
      update: {},
      create: {
        factoryId: gearment.id,
        productCode: 'GEAR-TSHIRT-001',
        productName: 'Gearment Classic Cotton T-Shirt',
        productType: 'T-SHIRT',
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        availableColors: ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Yellow'],
        availablePrintAreas: ['FRONT', 'BACK', 'LEFT_CHEST', 'RIGHT_CHEST'],
        material: '100% Combed Cotton',
        weight: '5.3 oz (180 GSM)',
        dimensions: {
          S: { chest: 18, length: 28, shoulder: 15.5 },
          M: { chest: 20, length: 29, shoulder: 17 },
          L: { chest: 22, length: 30, shoulder: 18.5 },
          XL: { chest: 24, length: 31, shoulder: 20 },
          '2XL': { chest: 26, length: 32, shoulder: 21.5 },
          '3XL': { chest: 28, length: 33, shoulder: 23 }
        },
        baseCost: 8.50,
        setupFee: 0,
        isActive: true
      }
    }),
    prisma.factoryProduct.upsert({
      where: { 
        factoryId_productCode: {
          factoryId: gearment.id,
          productCode: 'GEAR-HOODIE-001'
        }
      },
      update: {},
      create: {
        factoryId: gearment.id,
        productCode: 'GEAR-HOODIE-001',
        productName: 'Gearment Premium Pullover Hoodie',
        productType: 'HOODIE',
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        availableColors: ['Black', 'White', 'Navy', 'Gray', 'Charcoal', 'Forest Green'],
        availablePrintAreas: ['FRONT', 'BACK', 'LEFT_CHEST', 'RIGHT_CHEST', 'SLEEVE'],
        material: '80% Cotton, 20% Polyester Fleece',
        weight: '8.0 oz (271 GSM)',
        dimensions: {
          S: { chest: 20, length: 27, shoulder: 17 },
          M: { chest: 22, length: 28, shoulder: 18 },
          L: { chest: 24, length: 29, shoulder: 19 },
          XL: { chest: 26, length: 30, shoulder: 20 },
          '2XL': { chest: 28, length: 31, shoulder: 21 },
          '3XL': { chest: 30, length: 32, shoulder: 22 }
        },
        baseCost: 18.50,
        setupFee: 0,
        isActive: true
      }
    })
  ])

  // Create factory products for Pressify
  const pressifyProducts = await Promise.all([
    prisma.factoryProduct.upsert({
      where: { 
        factoryId_productCode: {
          factoryId: pressify.id,
          productCode: 'PRESS-MUG-001'
        }
      },
      update: {},
      create: {
        factoryId: pressify.id,
        productCode: 'PRESS-MUG-001',
        productName: 'Pressify Ceramic Coffee Mug 11oz',
        productType: 'MUG',
        availableSizes: ['11oz', '15oz'],
        availableColors: ['White', 'Black', 'Two-Tone Black', 'Two-Tone Blue', 'Two-Tone Red'],
        availablePrintAreas: ['WRAP_AROUND', 'FRONT_ONLY', 'BOTH_SIDES'],
        material: 'Grade A Ceramic',
        weight: '11 oz',
        dimensions: {
          '11oz': { height: 3.75, diameter: 3.2, volume: 11 },
          '15oz': { height: 4.5, diameter: 3.4, volume: 15 }
        },
        baseCost: 5.50,
        setupFee: 0,
        isActive: true
      }
    }),
    prisma.factoryProduct.upsert({
      where: { 
        factoryId_productCode: {
          factoryId: pressify.id,
          productCode: 'PRESS-POSTER-001'
        }
      },
      update: {},
      create: {
        factoryId: pressify.id,
        productCode: 'PRESS-POSTER-001',
        productName: 'Pressify Premium Matte Poster',
        productType: 'POSTER',
        availableSizes: ['8x10', '11x14', '16x20', '18x24', '24x36'],
        availableColors: ['Full-Color'],
        availablePrintAreas: ['FULL_BLEED', 'BORDERED'],
        material: '200gsm Premium Matte Paper',
        weight: '200 gsm',
        dimensions: {
          '8x10': { width: 8, height: 10 },
          '11x14': { width: 11, height: 14 },
          '16x20': { width: 16, height: 20 },
          '18x24': { width: 18, height: 24 },
          '24x36': { width: 24, height: 36 }
        },
        baseCost: 4.00,
        setupFee: 0,
        isActive: true
      }
    })
  ])

  console.log('✅ Created factory products:', {
    gearment: gearmentProducts.length,
    pressify: pressifyProducts.length
  })

  return {
    suppliers: [gearment, pressify],
    locations: [...gearmentLocations, ...pressifyLocations],
    products: [...gearmentProducts, ...pressifyProducts]
  }
}

async function main() {
  try {
    const result = await seedSuppliers()
    console.log('✅ Supplier seeding completed successfully!')
    console.log('📊 Summary:', {
      suppliers: result.suppliers.length,
      locations: result.locations.length,
      products: result.products.length
    })
  } catch (error) {
    console.error('❌ Error seeding suppliers:', error)
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