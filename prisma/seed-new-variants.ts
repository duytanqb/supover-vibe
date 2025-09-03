import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function generateVariantCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function seedNewVariants() {
  console.log('🚀 Starting complete database seeding with new variant structure...')

  // 1. Create basic data (users, teams, etc.)
  console.log('👥 Creating roles...')
  const roles = [
    { name: 'Super Admin', code: 'SUPER_ADMIN' as UserRole, description: 'Full system access' },
    { name: 'Admin', code: 'ADMIN' as UserRole, description: 'Administrative access' },
    { name: 'Seller', code: 'SELLER' as UserRole, description: 'Store and order management' },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    })
  }

  console.log('🏢 Creating teams...')
  const naTeam = await prisma.team.upsert({
    where: { code: 'NA_TEAM' },
    update: {},
    create: {
      name: 'North America Team',
      code: 'NA_TEAM',
      description: 'North American operations',
      region: 'North America'
    }
  })

  console.log('👤 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'superadmin@dragonmedia.com' },
    update: {},
    create: {
      username: 'superadmin',
      name: 'Super Admin',
      email: 'superadmin@dragonmedia.com',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  })

  // Assign role
  const superAdminRole = await prisma.role.findUnique({
    where: { code: 'SUPER_ADMIN' }
  })

  if (superAdminRole) {
    await prisma.userRoles.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    })
  }

  await prisma.teamMember.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      teamId: naTeam.id,
      isLeader: true,
    },
  })

  console.log('🏪 Creating stores...')
  const store = await prisma.store.create({
    data: {
      teamId: naTeam.id,
      name: 'DragonMedia Main Store',
      platform: 'SHOPIFY',
      storeUrl: 'https://dragonmedia.shopify.com',
      currency: 'USD',
      isActive: true,
      settings: {
        autoFulfill: true,
        orderPrefix: 'DM'
      }
    }
  })

  console.log('🏭 Creating factories...')
  const gearment = await prisma.factory.upsert({
    where: { code: 'GEAR' },
    update: {},
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
      qualityRating: 4.8,
      certifications: ['ISO_9001', 'OEKO_TEX']
    }
  })

  const pressify = await prisma.factory.upsert({
    where: { code: 'PRESS' },
    update: {},
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
      qualityRating: 4.6,
      certifications: ['ISO_14001']
    }
  })

  console.log('📍 Creating factory locations...')
  await Promise.all([
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
        contactName: 'John Smith',
        contactEmail: 'hq@gearment.com',
        contactPhone: '+1-555-GEAR-001',
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
        contactName: 'Sarah Johnson',
        contactEmail: 'nyc@pressify.io',
        contactPhone: '+1-555-PRESS-002',
        capabilities: ['MUG', 'POSTER', 'CANVAS'],
        capacity: 8000,
        shippingZones: ['US_EAST', 'CANADA_EAST'],
        isDefault: true,
        isActive: true
      }
    })
  ])

  console.log('🛍️ Creating products...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        storeId: store.id,
        sku: 'TSH-001',
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for custom designs',
        basePrice: 19.99,
        costPrice: 8.50,
        category: 'APPAREL',
        tags: ['shirt', 'cotton', 'basic'],
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        storeId: store.id,
        sku: 'HOD-001',
        name: 'Premium Pullover Hoodie',
        description: 'Cozy pullover hoodie with kangaroo pocket',
        basePrice: 39.99,
        costPrice: 18.50,
        category: 'APPAREL',
        tags: ['hoodie', 'cotton', 'premium'],
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        storeId: store.id,
        sku: 'MUG-001',
        name: 'Ceramic Coffee Mug',
        description: '11oz ceramic mug perfect for custom prints',
        basePrice: 14.99,
        costPrice: 5.50,
        category: 'DRINKWARE',
        tags: ['mug', 'ceramic', 'coffee'],
        isActive: true
      }
    })
  ])

  console.log('📦 Creating system variants with 5-character codes...')
  const systemVariants = await Promise.all([
    // T-Shirt variants
    prisma.systemVariant.create({
      data: {
        code: generateVariantCode(),
        productId: products[0].id,
        name: 'Small / Black',
        size: 'S',
        color: 'Black',
        material: 'Cotton',
        style: 'Crew Neck',
        price: 19.99,
        costPrice: 8.50,
        stock: 45,
        isActive: true
      }
    }),
    prisma.systemVariant.create({
      data: {
        code: generateVariantCode(),
        productId: products[0].id,
        name: 'Medium / Black',
        size: 'M',
        color: 'Black',
        material: 'Cotton',
        style: 'Crew Neck',
        price: 19.99,
        costPrice: 8.50,
        stock: 67,
        isActive: true
      }
    }),
    prisma.systemVariant.create({
      data: {
        code: generateVariantCode(),
        productId: products[0].id,
        name: 'Large / Black',
        size: 'L',
        color: 'Black',
        material: 'Cotton',
        style: 'Crew Neck',
        price: 19.99,
        costPrice: 8.50,
        stock: 23,
        isActive: true
      }
    }),
    // Hoodie variant
    prisma.systemVariant.create({
      data: {
        code: generateVariantCode(),
        productId: products[1].id,
        name: 'Medium / Black',
        size: 'M',
        color: 'Black',
        material: 'Cotton Blend',
        style: 'Pullover',
        price: 39.99,
        costPrice: 18.50,
        stock: 28,
        isActive: true
      }
    }),
    // Mug variants
    prisma.systemVariant.create({
      data: {
        code: generateVariantCode(),
        productId: products[2].id,
        name: '11oz / White',
        size: '11oz',
        color: 'White',
        material: 'Ceramic',
        style: 'Standard',
        price: 14.99,
        costPrice: 5.50,
        stock: 156,
        isActive: true
      }
    }),
    prisma.systemVariant.create({
      data: {
        code: generateVariantCode(),
        productId: products[2].id,
        name: '11oz / Black',
        size: '11oz',
        color: 'Black',
        material: 'Ceramic',
        style: 'Standard',
        price: 14.99,
        costPrice: 5.50,
        stock: 73,
        isActive: true
      }
    })
  ])

  console.log('🔗 Creating supplier variants...')
  await Promise.all([
    // Gearment supplier variants
    prisma.supplierVariant.create({
      data: {
        factoryId: gearment.id,
        systemVariantCode: systemVariants[0].code, // S-BLACK T-Shirt
        supplierProductCode: 'GEAR-TSHIRT-001',
        supplierVariantCode: 'SIZE-S-COLOR-BLACK',
        supplierSku: 'GEAR-TS-001-S-BLACK',
        supplierName: 'Classic Cotton Tee - Small Black',
        size: 'S',
        color: 'Black',
        material: 'Cotton',
        style: 'Crew Neck',
        supplierPrice: 8.50,
        minimumQuantity: 1,
        leadTime: 3,
        isAvailable: true,
        lastSyncedAt: new Date()
      }
    }),
    prisma.supplierVariant.create({
      data: {
        factoryId: gearment.id,
        systemVariantCode: systemVariants[1].code, // M-BLACK T-Shirt
        supplierProductCode: 'GEAR-TSHIRT-001',
        supplierVariantCode: 'SIZE-M-COLOR-BLACK',
        supplierSku: 'GEAR-TS-001-M-BLACK',
        supplierName: 'Classic Cotton Tee - Medium Black',
        size: 'M',
        color: 'Black',
        material: 'Cotton',
        style: 'Crew Neck',
        supplierPrice: 8.50,
        minimumQuantity: 1,
        leadTime: 3,
        isAvailable: true,
        lastSyncedAt: new Date()
      }
    }),
    prisma.supplierVariant.create({
      data: {
        factoryId: gearment.id,
        systemVariantCode: systemVariants[3].code, // M-BLACK Hoodie
        supplierProductCode: 'GEAR-HOODIE-001',
        supplierVariantCode: 'SIZE-M-COLOR-BLACK',
        supplierSku: 'GEAR-HD-001-M-BLACK',
        supplierName: 'Premium Pullover Hoodie - Medium Black',
        size: 'M',
        color: 'Black',
        material: 'Cotton Blend',
        style: 'Pullover',
        supplierPrice: 18.50,
        minimumQuantity: 1,
        leadTime: 4,
        isAvailable: true,
        lastSyncedAt: new Date()
      }
    }),
    // Pressify supplier variants
    prisma.supplierVariant.create({
      data: {
        factoryId: pressify.id,
        systemVariantCode: systemVariants[4].code, // 11OZ-WHITE Mug
        supplierProductCode: 'PRESS-MUG-001',
        supplierVariantCode: 'SIZE-11OZ-COLOR-WHITE',
        supplierSku: 'PRESS-MG-001-11OZ-WHITE',
        supplierName: 'Ceramic Coffee Mug - 11oz White',
        size: '11oz',
        color: 'White',
        material: 'Ceramic',
        style: 'Standard',
        supplierPrice: 5.50,
        minimumQuantity: 12,
        leadTime: 2,
        isAvailable: true,
        lastSyncedAt: new Date()
      }
    }),
    prisma.supplierVariant.create({
      data: {
        factoryId: pressify.id,
        systemVariantCode: systemVariants[5].code, // 11OZ-BLACK Mug
        supplierProductCode: 'PRESS-MUG-001',
        supplierVariantCode: 'SIZE-11OZ-COLOR-BLACK',
        supplierSku: 'PRESS-MG-001-11OZ-BLACK',
        supplierName: 'Ceramic Coffee Mug - 11oz Black',
        size: '11oz',
        color: 'Black',
        material: 'Ceramic',
        style: 'Standard',
        supplierPrice: 5.50,
        minimumQuantity: 12,
        leadTime: 2,
        isAvailable: true,
        lastSyncedAt: new Date()
      }
    })
  ])

  console.log('✅ Complete seeding finished!')
  console.log('📊 Summary:', {
    user: adminUser.email,
    store: store.name,
    factories: 2,
    products: products.length,
    systemVariants: systemVariants.length,
    supplierVariants: 5
  })

  console.log('🔑 System Variant Codes:')
  systemVariants.forEach((variant, index) => {
    console.log(`  ${variant.code} - ${variant.name}`)
  })

  return {
    user: adminUser,
    store,
    factories: [gearment, pressify],
    products,
    systemVariants
  }
}

async function main() {
  try {
    await seedNewVariants()
    console.log('🎉 All demo data created successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
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