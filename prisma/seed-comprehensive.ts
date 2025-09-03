import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Generate unique 9-character order code
function generateOrderCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 9; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function main() {
  console.log('🌱 Starting comprehensive seeding...')

  // Clean database
  console.log('🧹 Cleaning database...')
  await prisma.$transaction([
    prisma.qualityDefect.deleteMany(),
    prisma.qualityCheck.deleteMany(),
    prisma.review.deleteMany(),
    prisma.ticketMessage.deleteMany(),
    prisma.supportTicket.deleteMany(),
    prisma.notificationTemplate.deleteMany(),
    prisma.communication.deleteMany(),
    prisma.inventoryMovement.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.returnStatusHistory.deleteMany(),
    prisma.return.deleteMany(),
    prisma.shipmentException.deleteMany(),
    prisma.trackingEvent.deleteMany(),
    prisma.enhancedShipment.deleteMany(),
    prisma.customerNote.deleteMany(),
    prisma.address.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.fulfillment.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.shipment.deleteMany(),
    prisma.production.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.productDesign.deleteMany(),
    prisma.design.deleteMany(),
    prisma.product.deleteMany(),
    prisma.store.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.impersonationSession.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.systemSettings.deleteMany(),
    prisma.session.deleteMany(),
    prisma.userRoles.deleteMany(),
    prisma.rolePermissions.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany(),
    prisma.factory.deleteMany(),
  ])

  // Create Roles
  console.log('👥 Creating roles...')
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Super Admin',
        code: 'SUPER_ADMIN',
        description: 'Full system access'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Admin',
        code: 'ADMIN',
        description: 'Administrative access'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Seller',
        code: 'SELLER',
        description: 'Store and product management'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Designer',
        code: 'DESIGNER',
        description: 'Design creation and management'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Fulfiller',
        code: 'FULFILLER',
        description: 'Order fulfillment operations'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Finance',
        code: 'FINANCE',
        description: 'Financial management'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Support',
        code: 'SUPPORT',
        description: 'Customer support operations'
      }
    }),
    prisma.role.create({
      data: {
        name: 'Leader',
        code: 'LEADER',
        description: 'Team leadership'
      }
    })
  ])

  // Create Permissions
  console.log('🔐 Creating permissions...')
  const permissions = await Promise.all([
    // User permissions
    prisma.permission.create({
      data: {
        name: 'users.read',
        description: 'View users',
        resource: 'users',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'users.write',
        description: 'Create and edit users',
        resource: 'users',
        action: 'write'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete'
      }
    }),
    // Order permissions
    prisma.permission.create({
      data: {
        name: 'orders.read',
        description: 'View orders',
        resource: 'orders',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'orders.write',
        description: 'Create and edit orders',
        resource: 'orders',
        action: 'write'
      }
    }),
    // Customer permissions
    prisma.permission.create({
      data: {
        name: 'customers.read',
        description: 'View customers',
        resource: 'customers',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'customers.write',
        description: 'Create and edit customers',
        resource: 'customers',
        action: 'write'
      }
    }),
    // Support permissions
    prisma.permission.create({
      data: {
        name: 'tickets.read',
        description: 'View support tickets',
        resource: 'tickets',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'tickets.write',
        description: 'Create and manage tickets',
        resource: 'tickets',
        action: 'write'
      }
    })
  ])

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...')
  const superAdminRole = roles.find(r => r.code === 'SUPER_ADMIN')!
  const adminRole = roles.find(r => r.code === 'ADMIN')!
  const supportRole = roles.find(r => r.code === 'SUPPORT')!

  await Promise.all([
    // Super Admin gets all permissions
    ...permissions.map(permission =>
      prisma.rolePermissions.create({
        data: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      })
    ),
    // Admin gets most permissions
    ...permissions.filter(p => !p.name.includes('delete')).map(permission =>
      prisma.rolePermissions.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      })
    ),
    // Support gets ticket permissions
    ...permissions.filter(p => p.name.includes('tickets') || p.name.includes('customers.read')).map(permission =>
      prisma.rolePermissions.create({
        data: {
          roleId: supportRole.id,
          permissionId: permission.id
        }
      })
    )
  ])

  // Create Users
  console.log('👤 Creating users...')
  const hashedPassword = await hash('password123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'superadmin',
        email: 'superadmin@supover.com',
        name: 'Super Administrator',
        password: hashedPassword,
        phone: '+1234567890',
        userRoles: {
          create: {
            roleId: superAdminRole.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@supover.com',
        name: 'Administrator',
        password: hashedPassword,
        phone: '+1234567891',
        userRoles: {
          create: {
            roleId: adminRole.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        username: 'seller1',
        email: 'seller1@supover.com',
        name: 'John Seller',
        password: hashedPassword,
        phone: '+1234567892',
        userRoles: {
          create: {
            roleId: roles.find(r => r.code === 'SELLER')!.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        username: 'designer1',
        email: 'designer1@supover.com',
        name: 'Sarah Designer',
        password: hashedPassword,
        phone: '+1234567893',
        userRoles: {
          create: {
            roleId: roles.find(r => r.code === 'DESIGNER')!.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        username: 'support1',
        email: 'support1@supover.com',
        name: 'Mike Support',
        password: hashedPassword,
        phone: '+1234567894',
        userRoles: {
          create: {
            roleId: supportRole.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        username: 'fulfiller1',
        email: 'fulfiller1@supover.com',
        name: 'Lisa Fulfiller',
        password: hashedPassword,
        phone: '+1234567895',
        userRoles: {
          create: {
            roleId: roles.find(r => r.code === 'FULFILLER')!.id
          }
        }
      }
    })
  ])

  // Create Teams
  console.log('👥 Creating teams...')
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Team Alpha',
        code: 'ALPHA',
        description: 'Primary sales team',
        region: 'North America',
        members: {
          create: [
            {
              userId: users.find(u => u.username === 'seller1')!.id,
              isLeader: true
            },
            {
              userId: users.find(u => u.username === 'designer1')!.id,
              isLeader: false
            }
          ]
        }
      }
    }),
    prisma.team.create({
      data: {
        name: 'Team Beta',
        code: 'BETA',
        description: 'Secondary sales team',
        region: 'Europe',
        members: {
          create: [
            {
              userId: users.find(u => u.username === 'support1')!.id,
              isLeader: false
            }
          ]
        }
      }
    })
  ])

  // Create Factories
  console.log('🏭 Creating factories...')
  const factories = await Promise.all([
    prisma.factory.create({
      data: {
        name: 'Main Production Facility',
        code: 'FAC001',
        capacity: 10000,
        address: {
          line1: '123 Factory Lane',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        settings: {
          workingHours: '8:00-17:00',
          timezone: 'America/Los_Angeles'
        }
      }
    }),
    prisma.factory.create({
      data: {
        name: 'East Coast Factory',
        code: 'FAC002',
        capacity: 7500,
        address: {
          line1: '456 Industrial Blvd',
          city: 'Newark',
          state: 'NJ',
          postalCode: '07101',
          country: 'USA'
        },
        settings: {
          workingHours: '7:00-16:00',
          timezone: 'America/New_York'
        }
      }
    })
  ])

  // Create Stores
  console.log('🏪 Creating stores...')
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        teamId: teams[0].id,
        name: 'TikTok Shop - Main',
        platform: 'TIKTOK_SHOP',
        storeUrl: 'https://shop.tiktok.com/@mainstore',
        apiKey: 'tiktok_api_key_123',
        apiSecret: 'tiktok_secret_456',
        sellerId: 'TIKTOK_SELLER_001',
        region: 'US',
        currency: 'USD'
      }
    }),
    prisma.store.create({
      data: {
        teamId: teams[0].id,
        name: 'Shopify Store',
        platform: 'SHOPIFY',
        storeUrl: 'https://supover.myshopify.com',
        apiKey: 'shopify_api_key_789',
        apiSecret: 'shopify_secret_012',
        sellerId: 'SHOPIFY_SELLER_001',
        region: 'US',
        currency: 'USD'
      }
    }),
    prisma.store.create({
      data: {
        teamId: teams[1].id,
        name: 'Etsy Boutique',
        platform: 'ETSY',
        storeUrl: 'https://etsy.com/shop/supover',
        apiKey: 'etsy_api_key_345',
        apiSecret: 'etsy_secret_678',
        sellerId: 'ETSY_SELLER_001',
        region: 'EU',
        currency: 'EUR'
      }
    })
  ])

  // Create Customers
  console.log('👨‍👩‍👧‍👦 Creating customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1234567800',
        status: 'VIP',
        source: 'TIKTOK_SHOP',
        totalSpent: 2500.00,
        orderCount: 15,
        averageOrderValue: 166.67,
        tags: ['vip', 'frequent_buyer'],
        addresses: {
          create: [
            {
              type: 'BOTH',
              isDefault: true,
              line1: '123 Main St',
              line2: 'Apt 4B',
              city: 'New York',
              state: 'NY',
              postalCode: '10001',
              country: 'USA',
              recipientName: 'John Doe',
              phone: '+1234567800'
            }
          ]
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        phone: '+1234567801',
        status: 'ACTIVE',
        source: 'SHOPIFY',
        totalSpent: 750.00,
        orderCount: 5,
        averageOrderValue: 150.00,
        tags: ['returning_customer'],
        addresses: {
          create: [
            {
              type: 'SHIPPING',
              isDefault: true,
              line1: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              postalCode: '90001',
              country: 'USA',
              recipientName: 'Jane Smith',
              phone: '+1234567801'
            },
            {
              type: 'BILLING',
              isDefault: false,
              line1: '789 Billing St',
              city: 'Los Angeles',
              state: 'CA',
              postalCode: '90002',
              country: 'USA',
              recipientName: 'Jane Smith'
            }
          ]
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'robert.johnson@example.com',
        name: 'Robert Johnson',
        phone: '+1234567802',
        status: 'ACTIVE',
        source: 'ETSY',
        totalSpent: 320.00,
        orderCount: 2,
        averageOrderValue: 160.00,
        tags: ['new_customer'],
        addresses: {
          create: [
            {
              type: 'BOTH',
              isDefault: true,
              line1: '321 Pine Rd',
              city: 'Chicago',
              state: 'IL',
              postalCode: '60601',
              country: 'USA',
              recipientName: 'Robert Johnson',
              phone: '+1234567802'
            }
          ]
        }
      }
    }),
    prisma.customer.create({
      data: {
        email: 'mary.williams@example.com',
        name: 'Mary Williams',
        phone: '+1234567803',
        status: 'INACTIVE',
        source: 'AMAZON',
        totalSpent: 125.00,
        orderCount: 1,
        averageOrderValue: 125.00,
        tags: ['one_time_buyer'],
        addresses: {
          create: [
            {
              type: 'BOTH',
              isDefault: true,
              line1: '654 Elm Way',
              city: 'Houston',
              state: 'TX',
              postalCode: '77001',
              country: 'USA',
              recipientName: 'Mary Williams',
              phone: '+1234567803'
            }
          ]
        }
      }
    })
  ])

  // Create Products
  console.log('📦 Creating products...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        storeId: stores[0].id,
        sku: 'TSHIRT-001',
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt',
        basePrice: 29.99,
        costPrice: 12.00,
        weight: 0.2,
        dimensions: { length: 30, width: 20, height: 2 },
        category: 'Apparel',
        tags: ['t-shirt', 'cotton', 'premium']
      }
    }),
    prisma.product.create({
      data: {
        storeId: stores[0].id,
        sku: 'HOODIE-001',
        name: 'Comfort Hoodie',
        description: 'Soft and warm hoodie for all seasons',
        basePrice: 49.99,
        costPrice: 22.00,
        weight: 0.5,
        dimensions: { length: 35, width: 25, height: 5 },
        category: 'Apparel',
        tags: ['hoodie', 'comfort', 'warm']
      }
    }),
    prisma.product.create({
      data: {
        storeId: stores[1].id,
        sku: 'MUG-001',
        name: 'Ceramic Coffee Mug',
        description: '11oz ceramic mug with custom design',
        basePrice: 14.99,
        costPrice: 5.00,
        weight: 0.4,
        dimensions: { length: 10, width: 10, height: 12 },
        category: 'Drinkware',
        tags: ['mug', 'ceramic', 'coffee']
      }
    }),
    prisma.product.create({
      data: {
        storeId: stores[2].id,
        sku: 'POSTER-001',
        name: 'Art Print Poster',
        description: '18x24 inch high-quality art print',
        basePrice: 24.99,
        costPrice: 8.00,
        weight: 0.1,
        dimensions: { length: 61, width: 46, height: 0.1 },
        category: 'Wall Art',
        tags: ['poster', 'art', 'print']
      }
    })
  ])

  // Create Designs
  console.log('🎨 Creating designs...')
  const designs = await Promise.all([
    prisma.design.create({
      data: {
        teamId: teams[0].id,
        name: 'Mountain Sunset',
        fingerprint: 'fp_mountain_sunset_001',
        fileUrl: 'https://cdn.example.com/designs/mountain_sunset.png',
        thumbnailUrl: 'https://cdn.example.com/designs/thumb_mountain_sunset.png',
        printReadyFile: 'https://cdn.example.com/designs/print_mountain_sunset.pdf',
        status: 'APPROVED',
        designerId: users.find(u => u.username === 'designer1')!.id,
        sellerId: users.find(u => u.username === 'seller1')!.id,
        tags: ['nature', 'sunset', 'mountain'],
        artworkData: {
          colorSpace: 'RGB',
          resolution: 300,
          dimensions: { width: 4000, height: 4000 }
        }
      }
    }),
    prisma.design.create({
      data: {
        teamId: teams[0].id,
        name: 'Abstract Waves',
        fingerprint: 'fp_abstract_waves_002',
        fileUrl: 'https://cdn.example.com/designs/abstract_waves.png',
        thumbnailUrl: 'https://cdn.example.com/designs/thumb_abstract_waves.png',
        status: 'APPROVED',
        designerId: users.find(u => u.username === 'designer1')!.id,
        tags: ['abstract', 'waves', 'modern'],
        artworkData: {
          colorSpace: 'CMYK',
          resolution: 300,
          dimensions: { width: 3500, height: 3500 }
        }
      }
    }),
    prisma.design.create({
      data: {
        teamId: teams[1].id,
        name: 'Vintage Logo',
        fingerprint: 'fp_vintage_logo_003',
        fileUrl: 'https://cdn.example.com/designs/vintage_logo.png',
        thumbnailUrl: 'https://cdn.example.com/designs/thumb_vintage_logo.png',
        status: 'IN_REVIEW',
        tags: ['vintage', 'logo', 'retro'],
        artworkData: {
          colorSpace: 'RGB',
          resolution: 300,
          dimensions: { width: 2000, height: 2000 }
        }
      }
    })
  ])

  // Create Orders with all related data
  console.log('📋 Creating orders...')
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        storeId: stores[0].id,
        customerId: customers[0].id,
        orderNumber: 'ORD-2024-001',
        orderCode: generateOrderCode(),
        customerName: customers[0].name,
        customerEmail: customers[0].email,
        shippingAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        subtotal: 79.98,
        shippingCost: 9.99,
        tax: 7.20,
        total: 97.17,
        currency: 'USD',
        items: {
          create: [
            {
              productId: products[0].id,
              designId: designs[0].id,
              quantity: 2,
              unitPrice: 29.99,
              totalPrice: 59.98
            },
            {
              productId: products[1].id,
              designId: designs[1].id,
              quantity: 1,
              unitPrice: 49.99,
              totalPrice: 49.99
            }
          ]
        },
        statusHistory: {
          create: [
            {
              status: 'PENDING',
              createdAt: new Date('2024-01-01T10:00:00Z')
            },
            {
              status: 'PROCESSING',
              createdAt: new Date('2024-01-01T10:30:00Z')
            },
            {
              status: 'IN_PRODUCTION',
              createdAt: new Date('2024-01-01T14:00:00Z')
            },
            {
              status: 'SHIPPED',
              createdAt: new Date('2024-01-03T09:00:00Z')
            },
            {
              status: 'DELIVERED',
              createdAt: new Date('2024-01-05T15:00:00Z')
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        storeId: stores[1].id,
        customerId: customers[1].id,
        orderNumber: 'ORD-2024-002',
        orderCode: generateOrderCode(),
        customerName: customers[1].name,
        customerEmail: customers[1].email,
        shippingAddress: {
          line1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        status: 'IN_PRODUCTION',
        paymentStatus: 'PAID',
        subtotal: 44.97,
        shippingCost: 5.99,
        tax: 4.05,
        total: 55.01,
        currency: 'USD',
        items: {
          create: [
            {
              productId: products[2].id,
              quantity: 3,
              unitPrice: 14.99,
              totalPrice: 44.97
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        storeId: stores[0].id,
        customerId: customers[2].id,
        orderNumber: 'ORD-2024-003',
        orderCode: generateOrderCode(),
        customerName: customers[2].name,
        customerEmail: customers[2].email,
        shippingAddress: {
          line1: '321 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'USA'
        },
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: 29.99,
        shippingCost: 4.99,
        tax: 2.70,
        total: 37.68,
        currency: 'USD',
        items: {
          create: [
            {
              productId: products[0].id,
              designId: designs[0].id,
              quantity: 1,
              unitPrice: 29.99,
              totalPrice: 29.99
            }
          ]
        }
      }
    })
  ])

  // Create Enhanced Shipments
  console.log('🚚 Creating enhanced shipments...')
  const shipments = await Promise.all([
    prisma.enhancedShipment.create({
      data: {
        orderId: orders[0].id,
        carrier: 'USPS',
        service: 'PRIORITY',
        trackingNumber: 'USPS123456789',
        trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=USPS123456789',
        status: 'DELIVERED',
        estimatedDelivery: new Date('2024-01-05T12:00:00Z'),
        actualDelivery: new Date('2024-01-05T15:00:00Z'),
        shippingCost: 9.99,
        weight: 0.7,
        fromAddress: {
          line1: '123 Factory Lane',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        toAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        statusHistory: [
          { status: 'LABEL_CREATED', timestamp: '2024-01-03T08:00:00Z' },
          { status: 'PICKED_UP', timestamp: '2024-01-03T10:00:00Z' },
          { status: 'IN_TRANSIT', timestamp: '2024-01-03T14:00:00Z' },
          { status: 'OUT_FOR_DELIVERY', timestamp: '2024-01-05T09:00:00Z' },
          { status: 'DELIVERED', timestamp: '2024-01-05T15:00:00Z' }
        ],
        trackingEvents: {
          create: [
            {
              status: 'Package picked up',
              description: 'Package was picked up by USPS',
              location: 'Los Angeles, CA',
              timestamp: new Date('2024-01-03T10:00:00Z')
            },
            {
              status: 'In transit',
              description: 'Package is in transit to destination',
              location: 'Phoenix, AZ',
              timestamp: new Date('2024-01-04T06:00:00Z')
            },
            {
              status: 'Out for delivery',
              description: 'Package is out for delivery',
              location: 'New York, NY',
              timestamp: new Date('2024-01-05T09:00:00Z')
            },
            {
              status: 'Delivered',
              description: 'Package was delivered to recipient',
              location: 'New York, NY',
              timestamp: new Date('2024-01-05T15:00:00Z')
            }
          ]
        }
      }
    })
  ])

  // Create Inventory
  console.log('📊 Creating inventory...')
  const inventory = await Promise.all([
    prisma.inventory.create({
      data: {
        sku: 'BLANK-TSHIRT-M',
        factoryId: factories[0].id,
        type: 'BLANK_PRODUCT',
        name: 'Blank T-Shirt Medium',
        quantity: 500,
        reservedQuantity: 50,
        availableQuantity: 450,
        reorderPoint: 100,
        reorderQuantity: 500,
        maxStock: 1000,
        warehouse: 'Warehouse A',
        location: 'A-12-3',
        unitCost: 5.00,
        totalValue: 2500.00,
        movements: {
          create: [
            {
              type: 'INBOUND',
              quantity: 500,
              referenceType: 'PURCHASE_ORDER',
              referenceId: 'PO-2024-001',
              reason: 'Initial stock',
              previousQuantity: 0,
              newQuantity: 500,
              performedBy: users.find(u => u.username === 'fulfiller1')!.id
            }
          ]
        }
      }
    }),
    prisma.inventory.create({
      data: {
        sku: 'INK-BLACK',
        factoryId: factories[0].id,
        type: 'RAW_MATERIAL',
        name: 'Black Printing Ink',
        quantity: 50,
        reservedQuantity: 5,
        availableQuantity: 45,
        reorderPoint: 10,
        reorderQuantity: 50,
        warehouse: 'Warehouse A',
        location: 'B-5-2',
        unitCost: 25.00,
        totalValue: 1250.00
      }
    })
  ])

  // Create Support Tickets
  console.log('🎫 Creating support tickets...')
  const tickets = await Promise.all([
    prisma.supportTicket.create({
      data: {
        ticketNumber: 'TKT-2024-001',
        customerId: customers[0].id,
        orderId: orders[0].id,
        subject: 'Order delivery confirmation',
        description: 'I would like to confirm my order was delivered successfully.',
        category: 'ORDER_ISSUE',
        priority: 'LOW',
        status: 'RESOLVED',
        assignedTo: users.find(u => u.username === 'support1')!.id,
        assignedAt: new Date('2024-01-05T16:00:00Z'),
        resolution: 'Order confirmed delivered on January 5, 2024 at 3:00 PM',
        resolvedAt: new Date('2024-01-05T16:30:00Z'),
        resolvedBy: users.find(u => u.username === 'support1')!.id,
        rating: 5,
        feedback: 'Great support, very helpful!',
        messages: {
          create: [
            {
              senderId: customers[0].id,
              senderType: 'CUSTOMER',
              message: 'Hi, I received a notification that my order was delivered but I want to confirm.',
              attachments: []
            },
            {
              senderId: users.find(u => u.username === 'support1')!.id,
              senderType: 'AGENT',
              message: 'Hello! I can confirm your order ORD-2024-001 was successfully delivered today at 3:00 PM to your address in New York.',
              attachments: []
            },
            {
              senderId: customers[0].id,
              senderType: 'CUSTOMER',
              message: 'Perfect, thank you for confirming!',
              attachments: []
            }
          ]
        }
      }
    }),
    prisma.supportTicket.create({
      data: {
        ticketNumber: 'TKT-2024-002',
        customerId: customers[1].id,
        subject: 'Product customization question',
        description: 'Can I get a custom design on the mugs I ordered?',
        category: 'GENERAL_INQUIRY',
        priority: 'MEDIUM',
        status: 'OPEN',
        messages: {
          create: [
            {
              senderId: customers[1].id,
              senderType: 'CUSTOMER',
              message: 'I would like to add a custom logo to my mug order. Is this possible?',
              attachments: []
            }
          ]
        }
      }
    })
  ])

  // Create Reviews
  console.log('⭐ Creating reviews...')
  await Promise.all([
    prisma.review.create({
      data: {
        customerId: customers[0].id,
        orderId: orders[0].id,
        productId: products[0].id,
        rating: 5,
        title: 'Excellent quality!',
        comment: 'The t-shirt quality exceeded my expectations. The print is vibrant and the fabric is very soft.',
        photos: ['https://cdn.example.com/reviews/review1_photo1.jpg'],
        isVerified: true,
        helpfulCount: 15,
        notHelpfulCount: 1
      }
    }),
    prisma.review.create({
      data: {
        customerId: customers[0].id,
        orderId: orders[0].id,
        productId: products[1].id,
        rating: 4,
        title: 'Good hoodie, runs a bit small',
        comment: 'Love the design and quality, but I recommend sizing up.',
        photos: [],
        isVerified: true,
        helpfulCount: 8,
        notHelpfulCount: 2,
        response: 'Thank you for your feedback! We appreciate the sizing note and will update our size chart accordingly.',
        respondedBy: users.find(u => u.username === 'support1')!.id,
        respondedAt: new Date('2024-01-06T10:00:00Z')
      }
    })
  ])

  // Create Quality Checks
  console.log('✅ Creating quality checks...')
  await Promise.all([
    prisma.qualityCheck.create({
      data: {
        orderId: orders[0].id,
        factoryId: factories[0].id,
        checkType: 'FINAL',
        status: 'PASSED',
        score: 95,
        checkedBy: users.find(u => u.username === 'fulfiller1')!.id,
        checkedAt: new Date('2024-01-03T08:00:00Z'),
        notes: 'All items passed final quality inspection',
        photos: ['https://cdn.example.com/qc/qc1_photo1.jpg']
      }
    }),
    prisma.qualityCheck.create({
      data: {
        orderId: orders[1].id,
        factoryId: factories[0].id,
        checkType: 'IN_PRODUCTION',
        status: 'CONDITIONAL_PASS',
        score: 85,
        checkedBy: users.find(u => u.username === 'fulfiller1')!.id,
        checkedAt: new Date('2024-01-07T14:00:00Z'),
        notes: 'Minor color variation detected, within acceptable range',
        photos: [],
        defects: {
          create: [
            {
              category: 'COLOR',
              severity: 'MINOR',
              description: 'Slight color variation in print',
              location: 'Front center',
              photos: [],
              resolution: 'Accepted within tolerance',
              resolvedAt: new Date('2024-01-07T14:30:00Z')
            }
          ]
        }
      }
    })
  ])

  // Create Returns
  console.log('↩️ Creating returns...')
  await prisma.return.create({
    data: {
      orderId: orders[0].id,
      customerId: customers[0].id,
      rmaNumber: 'RMA-2024-001',
      reason: 'SIZE_ISSUE',
      reasonDetails: 'Hoodie is too small, need a larger size',
      status: 'REFUNDED',
      orderItems: [
        {
          productId: products[1].id,
          quantity: 1
        }
      ],
      refundMethod: 'ORIGINAL_PAYMENT',
      refundAmount: 49.99,
      refundedAt: new Date('2024-01-10T12:00:00Z'),
      requestedAt: new Date('2024-01-06T10:00:00Z'),
      approvedAt: new Date('2024-01-06T14:00:00Z'),
      receivedAt: new Date('2024-01-09T10:00:00Z'),
      completedAt: new Date('2024-01-10T12:00:00Z'),
      inspectionNotes: 'Item in good condition, size issue confirmed',
      inspectedBy: users.find(u => u.username === 'fulfiller1')!.id,
      inspectedAt: new Date('2024-01-09T11:00:00Z'),
      customerPhotos: ['https://cdn.example.com/returns/return1_customer.jpg'],
      inspectionPhotos: ['https://cdn.example.com/returns/return1_inspection.jpg'],
      statusHistory: {
        create: [
          {
            status: 'REQUESTED',
            changedBy: customers[0].id,
            createdAt: new Date('2024-01-06T10:00:00Z')
          },
          {
            status: 'APPROVED',
            changedBy: users.find(u => u.username === 'support1')!.id,
            comment: 'Return approved, sending label',
            createdAt: new Date('2024-01-06T14:00:00Z')
          },
          {
            status: 'REFUNDED',
            changedBy: users.find(u => u.username === 'admin')!.id,
            comment: 'Refund processed',
            createdAt: new Date('2024-01-10T12:00:00Z')
          }
        ]
      }
    }
  })

  // Create Communication Templates
  console.log('📧 Creating communication templates...')
  await Promise.all([
    prisma.notificationTemplate.create({
      data: {
        name: 'order_confirmation',
        type: 'EMAIL',
        subject: 'Order Confirmation - {{orderNumber}}',
        content: 'Thank you for your order {{customerName}}! Your order {{orderNumber}} has been confirmed.',
        variables: ['customerName', 'orderNumber', 'orderTotal']
      }
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'shipping_notification',
        type: 'EMAIL',
        subject: 'Your Order Has Shipped - {{orderNumber}}',
        content: 'Good news {{customerName}}! Your order {{orderNumber}} has been shipped. Track it here: {{trackingUrl}}',
        variables: ['customerName', 'orderNumber', 'trackingNumber', 'trackingUrl']
      }
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'return_approved',
        type: 'EMAIL',
        subject: 'Return Approved - RMA {{rmaNumber}}',
        content: 'Your return request has been approved. Please use the attached label to ship the items back.',
        variables: ['customerName', 'rmaNumber', 'returnLabel']
      }
    })
  ])

  // Create Communications
  console.log('💬 Creating communications...')
  await Promise.all([
    prisma.communication.create({
      data: {
        customerId: customers[0].id,
        type: 'EMAIL',
        subject: 'Order Confirmation - ORD-2024-001',
        content: 'Thank you for your order John Doe! Your order ORD-2024-001 has been confirmed.',
        template: 'order_confirmation',
        status: 'DELIVERED',
        sentAt: new Date('2024-01-01T10:00:00Z'),
        deliveredAt: new Date('2024-01-01T10:01:00Z'),
        openedAt: new Date('2024-01-01T12:00:00Z'),
        tags: ['order', 'confirmation']
      }
    }),
    prisma.communication.create({
      data: {
        customerId: customers[0].id,
        type: 'EMAIL',
        subject: 'Your Order Has Shipped - ORD-2024-001',
        content: 'Good news John Doe! Your order ORD-2024-001 has been shipped.',
        template: 'shipping_notification',
        status: 'DELIVERED',
        sentAt: new Date('2024-01-03T09:00:00Z'),
        deliveredAt: new Date('2024-01-03T09:01:00Z'),
        tags: ['shipping', 'tracking']
      }
    }),
    prisma.communication.create({
      data: {
        customerId: customers[1].id,
        type: 'SMS',
        content: 'Your order is being produced and will ship soon!',
        status: 'SENT',
        sentAt: new Date('2024-01-07T10:00:00Z'),
        tags: ['order', 'update']
      }
    })
  ])

  // Create Customer Notes
  console.log('📝 Creating customer notes...')
  await Promise.all([
    prisma.customerNote.create({
      data: {
        customerId: customers[0].id,
        userId: users.find(u => u.username === 'support1')!.id,
        note: 'VIP customer - always provide expedited support',
        isInternal: true
      }
    }),
    prisma.customerNote.create({
      data: {
        customerId: customers[0].id,
        userId: users.find(u => u.username === 'admin')!.id,
        note: 'Prefers email communication over phone',
        isInternal: true
      }
    }),
    prisma.customerNote.create({
      data: {
        customerId: customers[1].id,
        userId: users.find(u => u.username === 'support1')!.id,
        note: 'Interested in bulk orders for corporate gifts',
        isInternal: false
      }
    })
  ])

  // Create System Settings
  console.log('⚙️ Creating system settings...')
  await Promise.all([
    prisma.systemSettings.create({
      data: {
        key: 'order.auto_fulfill',
        value: 'true',
        category: 'fulfillment',
        description: 'Automatically start fulfillment for paid orders'
      }
    }),
    prisma.systemSettings.create({
      data: {
        key: 'shipping.default_carrier',
        value: 'USPS',
        category: 'shipping',
        description: 'Default shipping carrier for new orders'
      }
    }),
    prisma.systemSettings.create({
      data: {
        key: 'support.sla_hours',
        value: '24',
        category: 'support',
        description: 'Default SLA response time in hours'
      }
    }),
    prisma.systemSettings.create({
      data: {
        key: 'inventory.low_stock_threshold',
        value: '20',
        category: 'inventory',
        description: 'Percentage threshold for low stock alerts'
      }
    })
  ])

  console.log('✅ Comprehensive seeding completed successfully!')
  
  // Print summary
  console.log('\n📊 Summary:')
  console.log(`- Users: ${users.length}`)
  console.log(`- Teams: ${teams.length}`)
  console.log(`- Stores: ${stores.length}`)
  console.log(`- Customers: ${customers.length}`)
  console.log(`- Products: ${products.length}`)
  console.log(`- Designs: ${designs.length}`)
  console.log(`- Orders: ${orders.length}`)
  console.log(`- Factories: ${factories.length}`)
  console.log(`- Support Tickets: ${tickets.length}`)
  console.log('\n🔑 Default login credentials:')
  console.log('Username: superadmin | Password: password123')
  console.log('Username: admin | Password: password123')
  console.log('Username: seller1 | Password: password123')
  console.log('Username: support1 | Password: password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })