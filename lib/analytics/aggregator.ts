import { prisma } from '@/lib/prisma'
import { SnapshotType } from '@prisma/client'
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear } from 'date-fns'

// Define MetricType locally to avoid import issues
type MetricType = 'TOTAL_REVENUE' | 'ORDER_COUNT' | 'AVG_ORDER_VALUE' | 
  'PRODUCT_SALES' | 'PRODUCT_REVENUE' | 'PRODUCT_MARGIN' |
  'STORE_REVENUE' | 'STORE_ORDERS' | 'STORE_CONVERSION' |
  'SELLER_REVENUE' | 'SELLER_ORDERS' | 'SELLER_PERFORMANCE' |
  'FACTORY_PRODUCTION' | 'FACTORY_DEFECT_RATE' | 'FACTORY_FULFILLMENT_TIME' |
  'CUSTOMER_COUNT' | 'CUSTOMER_RETENTION' | 'CUSTOMER_LIFETIME_VALUE'

export class AnalyticsAggregator {
  /**
   * Aggregate daily metrics for all dimensions
   */
  async aggregateDailyMetrics(date: Date = new Date()) {
    const start = startOfDay(date)
    const end = endOfDay(date)
    
    console.log(`🔄 Aggregating metrics for ${start.toISOString()}`)
    
    // Aggregate revenue metrics
    await this.aggregateRevenueMetrics(start, end, 'DAILY')
    
    // Aggregate store metrics
    await this.aggregateStoreMetrics(start, end, 'DAILY')
    
    // Aggregate product metrics
    await this.aggregateProductMetrics(start, end, 'DAILY')
    
    // Aggregate seller metrics
    await this.aggregateSellerMetrics(start, end, 'DAILY')
    
    // Aggregate factory metrics
    await this.aggregateFactoryMetrics(start, end, 'DAILY')
    
    // Create daily snapshot
    await this.createSnapshot(start, 'DAILY')
    
    console.log(`✅ Daily aggregation completed`)
  }
  
  /**
   * Aggregate revenue metrics
   */
  async aggregateRevenueMetrics(start: Date, end: Date, period: string) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end
        },
        status: {
          notIn: ['CANCELLED', 'REFUNDED']
        }
      },
      select: {
        total: true,
        storeId: true
      }
    })
    
    const totalRevenue = orders.reduce((sum, order) => 
      sum + Number(order.total), 0
    )
    
    const orderCount = orders.length
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
    
    // Store overall metrics
    await this.upsertMetric(
      'TOTAL_REVENUE',
      'OVERALL',
      null,
      start,
      period,
      totalRevenue,
      orderCount
    )
    
    await this.upsertMetric(
      'ORDER_COUNT',
      'OVERALL',
      null,
      start,
      period,
      orderCount,
      orderCount
    )
    
    await this.upsertMetric(
      'AVG_ORDER_VALUE',
      'OVERALL',
      null,
      start,
      period,
      avgOrderValue,
      orderCount
    )
  }
  
  /**
   * Aggregate store-level metrics
   */
  async aggregateStoreMetrics(start: Date, end: Date, period: string) {
    const stores = await prisma.store.findMany({
      include: {
        orders: {
          where: {
            createdAt: {
              gte: start,
              lt: end
            },
            status: {
              notIn: ['CANCELLED', 'REFUNDED']
            }
          },
          select: {
            total: true
          }
        }
      }
    })
    
    for (const store of stores) {
      const revenue = store.orders.reduce((sum, order) => 
        sum + Number(order.total), 0
      )
      const orderCount = store.orders.length
      
      await this.upsertMetric(
        'STORE_REVENUE',
        'STORE',
        store.id,
        start,
        period,
        revenue,
        orderCount
      )
      
      await this.upsertMetric(
        'STORE_ORDERS',
        'STORE',
        store.id,
        start,
        period,
        orderCount,
        orderCount
      )
    }
  }
  
  /**
   * Aggregate product-level metrics
   */
  async aggregateProductMetrics(start: Date, end: Date, period: string) {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lt: end
          },
          status: {
            notIn: ['CANCELLED', 'REFUNDED']
          }
        }
      },
      include: {
        product: {
          select: {
            id: true,
            basePrice: true,
            costPrice: true
          }
        }
      }
    })
    
    // Group by product
    const productMetrics = new Map<string, {
      revenue: number
      quantity: number
      profit: number
    }>()
    
    orderItems.forEach(item => {
      const existing = productMetrics.get(item.productId) || {
        revenue: 0,
        quantity: 0,
        profit: 0
      }
      
      const revenue = Number(item.totalPrice)
      const cost = Number(item.product.costPrice) * item.quantity
      const profit = revenue - cost
      
      productMetrics.set(item.productId, {
        revenue: existing.revenue + revenue,
        quantity: existing.quantity + item.quantity,
        profit: existing.profit + profit
      })
    })
    
    // Store metrics
    for (const [productId, metrics] of productMetrics) {
      await this.upsertMetric(
        'PRODUCT_REVENUE',
        'PRODUCT',
        productId,
        start,
        period,
        metrics.revenue,
        metrics.quantity
      )
      
      await this.upsertMetric(
        'PRODUCT_SALES',
        'PRODUCT',
        productId,
        start,
        period,
        metrics.quantity,
        metrics.quantity
      )
      
      const margin = metrics.revenue > 0 ? (metrics.profit / metrics.revenue) * 100 : 0
      await this.upsertMetric(
        'PRODUCT_MARGIN',
        'PRODUCT',
        productId,
        start,
        period,
        margin,
        metrics.quantity
      )
    }
  }
  
  /**
   * Aggregate seller (team leader) metrics
   */
  async aggregateSellerMetrics(start: Date, end: Date, period: string) {
    const teams = await prisma.team.findMany({
      include: {
        stores: {
          include: {
            orders: {
              where: {
                createdAt: {
                  gte: start,
                  lt: end
                },
                status: {
                  notIn: ['CANCELLED', 'REFUNDED']
                }
              },
              select: {
                total: true
              }
            }
          }
        },
        members: {
          where: {
            isLeader: true
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
    
    for (const team of teams) {
      const leader = team.members.find(m => m.isLeader)
      if (!leader) continue
      
      const orders = team.stores.flatMap(store => store.orders)
      const revenue = orders.reduce((sum, order) => 
        sum + Number(order.total), 0
      )
      const orderCount = orders.length
      
      await this.upsertMetric(
        'SELLER_REVENUE',
        'SELLER',
        leader.user.id,
        start,
        period,
        revenue,
        orderCount
      )
      
      await this.upsertMetric(
        'SELLER_ORDERS',
        'SELLER',
        leader.user.id,
        start,
        period,
        orderCount,
        orderCount
      )
    }
  }
  
  /**
   * Aggregate factory metrics
   */
  async aggregateFactoryMetrics(start: Date, end: Date, period: string) {
    const factories = await prisma.factory.findMany({
      include: {
        fulfillments: {
          where: {
            createdAt: {
              gte: start,
              lt: end
            }
          }
        },
        qualityChecks: {
          where: {
            createdAt: {
              gte: start,
              lt: end
            }
          },
          select: {
            status: true
          }
        }
      }
    })
    
    for (const factory of factories) {
      const productionCount = factory.fulfillments.length
      
      const totalChecks = factory.qualityChecks.length
      const failedChecks = factory.qualityChecks.filter(
        qc => qc.status === 'FAILED'
      ).length
      const defectRate = totalChecks > 0 ? (failedChecks / totalChecks) * 100 : 0
      
      await this.upsertMetric(
        'FACTORY_PRODUCTION',
        'FACTORY',
        factory.id,
        start,
        period,
        productionCount,
        productionCount
      )
      
      await this.upsertMetric(
        'FACTORY_DEFECT_RATE',
        'FACTORY',
        factory.id,
        start,
        period,
        defectRate,
        totalChecks
      )
    }
  }
  
  /**
   * Create a data snapshot
   */
  async createSnapshot(date: Date, type: SnapshotType) {
    const start = startOfDay(date)
    const end = endOfDay(date)
    
    // Get aggregated data
    const [
      orders,
      products,
      customers,
      revenue
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: start, lt: end }
        }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lt: end },
          status: { notIn: ['CANCELLED', 'REFUNDED'] }
        },
        _sum: { total: true },
        _avg: { total: true }
      })
    ])
    
    const metrics = await prisma.analyticsCache.findMany({
      where: {
        date: start,
        period: 'DAILY'
      }
    })
    
    await prisma.dataSnapshot.upsert({
      where: {
        snapshotType_date: {
          snapshotType: type,
          date: start
        }
      },
      update: {
        totalRevenue: revenue._sum.total || 0,
        totalOrders: orders,
        totalProducts: products,
        totalCustomers: customers,
        avgOrderValue: revenue._avg.total || 0,
        metrics: metrics as any,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      },
      create: {
        snapshotType: type,
        date: start,
        totalRevenue: revenue._sum.total || 0,
        totalOrders: orders,
        totalProducts: products,
        totalCustomers: customers,
        avgOrderValue: revenue._avg.total || 0,
        metrics: metrics as any,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      }
    })
  }
  
  /**
   * Upsert a metric value
   */
  private async upsertMetric(
    metricType: MetricType,
    dimension: string,
    dimensionId: string | null,
    date: Date,
    period: string,
    value: number,
    count?: number
  ) {
    try {
      // First try to find existing record
      const existing = await prisma.analyticsCache.findFirst({
        where: {
          metricType,
          dimension,
          dimensionId: dimensionId || null,
          date,
          period
        }
      })
      
      if (existing) {
        // Update existing record
        await prisma.analyticsCache.update({
          where: { id: existing.id },
          data: {
            value,
            count,
            computedAt: new Date()
          }
        })
      } else {
        // Create new record
        await prisma.analyticsCache.create({
          data: {
            metricType,
            dimension,
            dimensionId,
            date,
            period,
            value,
            count
          }
        })
      }
    } catch (error) {
      console.error('Error upserting metric:', error)
    }
  }
  
  /**
   * Get cached metrics
   */
  async getCachedMetrics(
    metricType: MetricType,
    dimension: string,
    dimensionId: string | null,
    startDate: Date,
    endDate: Date,
    period: string = 'DAILY'
  ) {
    return prisma.analyticsCache.findMany({
      where: {
        metricType,
        dimension,
        dimensionId,
        date: {
          gte: startDate,
          lte: endDate
        },
        period
      },
      orderBy: {
        date: 'asc'
      }
    })
  }
}