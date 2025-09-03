import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

export const prisma = new PrismaClient()

/**
 * Create a test user with specified role
 */
export async function createTestUser(role: 'ADMIN' | 'SELLER' | 'USER' = 'USER') {
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: 'hashed_password',
      name: `Test ${role} User`,
      isActive: true,
    },
  })

  // Create role assignment
  const roleRecord = await prisma.role.findFirst({
    where: { code: role },
  })

  if (roleRecord) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id,
      },
    })
  }

  return user
}

/**
 * Create a test team
 */
export async function createTestTeam() {
  return await prisma.team.create({
    data: {
      name: `Test Team ${Date.now()}`,
      code: `TEST${Date.now()}`,
      isActive: true,
    },
  })
}

/**
 * Create a test cash advance
 */
export async function createTestAdvance(userId: string, teamId: string) {
  return await prisma.cashAdvance.create({
    data: {
      advanceNumber: `ADV-TEST-${Date.now()}`,
      userId,
      teamId,
      type: 'FULFILLMENT',
      amount: 1000,
      reason: 'Test advance',
      status: 'PENDING',
    },
  })
}

/**
 * Create a test wallet
 */
export async function createTestWallet(userId: string, teamId: string) {
  return await prisma.sellerWallet.create({
    data: {
      userId,
      teamId,
      balance: 0,
      availableBalance: 0,
      advanceLimit: 5000,
    },
  })
}

/**
 * Generate a test JWT token
 */
export function generateTestToken(userId: string, role: string = 'USER') {
  return jwt.sign(
    {
      userId,
      role,
      email: 'test@example.com',
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  // Delete in correct order to respect foreign key constraints
  await prisma.walletTransaction.deleteMany({})
  await prisma.advanceRepayment.deleteMany({})
  await prisma.cashAdvance.deleteMany({})
  await prisma.sellerWallet.deleteMany({})
  await prisma.userRole.deleteMany({})
  await prisma.teamMember.deleteMany({})
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test-',
      },
    },
  })
  await prisma.team.deleteMany({
    where: {
      code: {
        contains: 'TEST',
      },
    },
  })
}

/**
 * Setup test database
 */
export async function setupTestDatabase() {
  // Ensure required roles exist
  const roles = ['SUPER_ADMIN', 'ADMIN', 'SELLER', 'USER']
  
  for (const roleCode of roles) {
    await prisma.role.upsert({
      where: { code: roleCode },
      update: {},
      create: {
        code: roleCode,
        name: roleCode.replace('_', ' ').toLowerCase(),
        description: `${roleCode} role`,
      },
    })
  }
}

/**
 * Mock API request
 */
export function mockApiRequest(
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
) {
  return {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  }
}

/**
 * Assert API response
 */
export async function assertApiResponse(
  response: Response,
  expectedStatus: number,
  expectedBody?: any
) {
  expect(response.status).toBe(expectedStatus)
  
  if (expectedBody) {
    const body = await response.json()
    expect(body).toMatchObject(expectedBody)
  }
}

/**
 * Wait for condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  return false
}

/**
 * Create test data for full flow
 */
export async function createFullTestSetup() {
  const team = await createTestTeam()
  const admin = await createTestUser('ADMIN')
  const seller = await createTestUser('SELLER')
  
  // Add seller to team
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: seller.id,
      role: 'MEMBER',
      joinedAt: new Date(),
    },
  })
  
  const wallet = await createTestWallet(seller.id, team.id)
  const advance = await createTestAdvance(seller.id, team.id)
  
  return {
    team,
    admin,
    seller,
    wallet,
    advance,
    adminToken: generateTestToken(admin.id, 'ADMIN'),
    sellerToken: generateTestToken(seller.id, 'SELLER'),
  }
}