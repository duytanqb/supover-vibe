import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Cash Advance Database Integration Tests', () => {
  let testUserId: string
  let testTeamId: string
  let testWalletId: string

  beforeAll(async () => {
    // Setup test data
    const team = await prisma.team.create({
      data: {
        name: 'Test Team',
        code: 'TEST01',
        isActive: true,
      },
    })
    testTeamId = team.id

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        isActive: true,
      },
    })
    testUserId = user.id

    const wallet = await prisma.sellerWallet.create({
      data: {
        userId: testUserId,
        teamId: testTeamId,
        advanceLimit: 5000,
      },
    })
    testWalletId = wallet.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.walletTransaction.deleteMany({})
    await prisma.advanceRepayment.deleteMany({})
    await prisma.cashAdvance.deleteMany({})
    await prisma.sellerWallet.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.team.deleteMany({})
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clear advances between tests
    await prisma.cashAdvance.deleteMany({})
  })

  describe('Advance Creation', () => {
    it('should create advance with correct relationships', async () => {
      const advance = await prisma.cashAdvance.create({
        data: {
          advanceNumber: 'ADV-TEST-001',
          userId: testUserId,
          teamId: testTeamId,
          type: 'FULFILLMENT',
          amount: 1000,
          reason: 'Test advance',
          status: 'PENDING',
        },
        include: {
          user: true,
          team: true,
        },
      })

      expect(advance).toBeDefined()
      expect(advance.advanceNumber).toBe('ADV-TEST-001')
      expect(advance.amount).toBe(1000)
      expect(advance.user.id).toBe(testUserId)
      expect(advance.team.id).toBe(testTeamId)
    })

    it('should enforce unique advance numbers', async () => {
      await prisma.cashAdvance.create({
        data: {
          advanceNumber: 'ADV-TEST-002',
          userId: testUserId,
          teamId: testTeamId,
          type: 'RESOURCE',
          amount: 500,
          reason: 'First advance',
        },
      })

      await expect(
        prisma.cashAdvance.create({
          data: {
            advanceNumber: 'ADV-TEST-002', // Duplicate
            userId: testUserId,
            teamId: testTeamId,
            type: 'OTHER',
            amount: 300,
            reason: 'Duplicate advance',
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('Advance Status Transitions', () => {
    it('should update advance status correctly', async () => {
      const advance = await prisma.cashAdvance.create({
        data: {
          advanceNumber: 'ADV-TEST-003',
          userId: testUserId,
          teamId: testTeamId,
          type: 'FULFILLMENT',
          amount: 1500,
          reason: 'Status test',
          status: 'PENDING',
        },
      })

      // Approve
      const approved = await prisma.cashAdvance.update({
        where: { id: advance.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: testUserId,
        },
      })
      expect(approved.status).toBe('APPROVED')

      // Disburse
      const disbursed = await prisma.cashAdvance.update({
        where: { id: advance.id },
        data: {
          status: 'DISBURSED',
          disbursedAt: new Date(),
          disbursedBy: testUserId,
          outstandingAmount: 1500,
        },
      })
      expect(disbursed.status).toBe('DISBURSED')
      expect(disbursed.outstandingAmount).toBe(1500)
    })
  })

  describe('Advance Repayments', () => {
    it('should track repayments and update outstanding amount', async () => {
      const advance = await prisma.cashAdvance.create({
        data: {
          advanceNumber: 'ADV-TEST-004',
          userId: testUserId,
          teamId: testTeamId,
          type: 'FULFILLMENT',
          amount: 2000,
          reason: 'Repayment test',
          status: 'DISBURSED',
          outstandingAmount: 2000,
        },
      })

      // First repayment
      await prisma.advanceRepayment.create({
        data: {
          advanceId: advance.id,
          userId: testUserId,
          amount: 500,
          method: 'MANUAL',
        },
      })

      const afterFirst = await prisma.cashAdvance.update({
        where: { id: advance.id },
        data: {
          repaidAmount: 500,
          outstandingAmount: 1500,
          status: 'PARTIALLY_REPAID',
        },
      })
      expect(afterFirst.outstandingAmount).toBe(1500)

      // Second repayment
      await prisma.advanceRepayment.create({
        data: {
          advanceId: advance.id,
          userId: testUserId,
          amount: 1500,
          method: 'AUTO',
        },
      })

      const afterSecond = await prisma.cashAdvance.update({
        where: { id: advance.id },
        data: {
          repaidAmount: 2000,
          outstandingAmount: 0,
          status: 'REPAID',
        },
      })
      expect(afterSecond.outstandingAmount).toBe(0)
      expect(afterSecond.status).toBe('REPAID')
    })
  })

  describe('Wallet Integration', () => {
    it('should update wallet on disbursement', async () => {
      const advance = await prisma.cashAdvance.create({
        data: {
          advanceNumber: 'ADV-TEST-005',
          userId: testUserId,
          teamId: testTeamId,
          type: 'RESOURCE',
          amount: 1000,
          reason: 'Wallet test',
          status: 'APPROVED',
        },
      })

      // Simulate disbursement with wallet update
      await prisma.$transaction(async (tx) => {
        await tx.cashAdvance.update({
          where: { id: advance.id },
          data: {
            status: 'DISBURSED',
            disbursedAt: new Date(),
            outstandingAmount: 1000,
          },
        })

        await tx.sellerWallet.update({
          where: { id: testWalletId },
          data: {
            totalAdvances: { increment: 1000 },
          },
        })

        await tx.walletTransaction.create({
          data: {
            walletId: testWalletId,
            type: 'DEBIT',
            amount: 1000,
            balanceBefore: 0,
            balanceAfter: -1000,
            description: `Advance ${advance.advanceNumber} disbursed`,
            referenceType: 'CashAdvance',
            referenceId: advance.id,
          },
        })
      })

      const wallet = await prisma.sellerWallet.findUnique({
        where: { id: testWalletId },
      })
      expect(wallet?.totalAdvances).toBe(1000)
    })
  })

  describe('Query Performance', () => {
    it('should efficiently query advances with filters', async () => {
      // Create multiple advances
      const advances = []
      for (let i = 0; i < 10; i++) {
        advances.push({
          advanceNumber: `ADV-PERF-${i.toString().padStart(3, '0')}`,
          userId: testUserId,
          teamId: testTeamId,
          type: i % 2 === 0 ? 'FULFILLMENT' : 'RESOURCE',
          amount: 1000 + (i * 100),
          reason: `Performance test ${i}`,
          status: i < 5 ? 'PENDING' : 'APPROVED',
        })
      }

      await prisma.cashAdvance.createMany({ data: advances })

      // Test filtered query
      const pendingAdvances = await prisma.cashAdvance.findMany({
        where: {
          userId: testUserId,
          status: 'PENDING',
        },
        include: {
          user: true,
          team: true,
        },
        orderBy: {
          requestedAt: 'desc',
        },
      })

      expect(pendingAdvances).toHaveLength(5)
      expect(pendingAdvances[0].status).toBe('PENDING')
    })
  })
})