import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)
    
    const endDate = new Date()
    const startDate = subDays(endDate, periodDays)
    const startOfToday = startOfDay(new Date())
    const startOfCurrentMonth = startOfMonth(new Date())
    const endOfCurrentMonth = endOfMonth(new Date())
    
    // Fetch current KPIs
    const [
      totalRevenue,
      totalOrders,
      activeStores,
      activeProducts,
      currentMonthRevenue,
      previousMonthRevenue,
      todayOrders,
      pendingOrders
    ] = await Promise.all([
      // Total revenue (period)
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: {
            notIn: ['CANCELLED', 'REFUNDED']
          }
        },
        _sum: { total: true },
        _avg: { total: true }
      }),
      
      // Total orders (period)
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Active stores
      prisma.store.count({
        where: { isActive: true }
      }),
      
      // Active products
      prisma.product.count({
        where: { isActive: true }
      }),
      
      // Current month revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth
          },
          status: {
            notIn: ['CANCELLED', 'REFUNDED']
          }
        },
        _sum: { total: true }
      }),
      
      // Previous month revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: subDays(startOfCurrentMonth, 30),
            lt: startOfCurrentMonth
          },
          status: {
            notIn: ['CANCELLED', 'REFUNDED']
          }
        },
        _sum: { total: true }
      }),
      
      // Today's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      
      // Pending orders
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      })
    ])
    
    // Calculate growth rates
    const currentMonthRev = Number(currentMonthRevenue._sum.total) || 0
    const previousMonthRev = Number(previousMonthRevenue._sum.total) || 0
    const revenueGrowth = previousMonthRev > 0 
      ? ((currentMonthRev - previousMonthRev) / previousMonthRev) * 100 
      : 0
    
    // Fetch top performers
    const [topStores, topProducts, topSellers] = await Promise.all([
      // Top stores by revenue
      prisma.store.findMany({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate
              },
              status: {
                notIn: ['CANCELLED', 'REFUNDED']
              }
            }
          }
        },
        include: {
          orders: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              },
              status: {
                notIn: ['CANCELLED', 'REFUNDED']
              }
            },
            select: {
              total: true
            }
          }
        },
        take: 5
      }),
      
      // Top products by sales
      prisma.product.findMany({
        where: {
          orderItems: {
            some: {
              order: {
                createdAt: {
                  gte: startDate,
                  lte: endDate
                },
                status: {
                  notIn: ['CANCELLED', 'REFUNDED']
                }
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              orderItems: true
            }
          },
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: startDate,
                  lte: endDate
                },
                status: {
                  notIn: ['CANCELLED', 'REFUNDED']
                }
              }
            },
            select: {
              quantity: true,
              totalPrice: true
            }
          }
        },
        take: 5,
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        }
      }),
      
      // Top sellers (team leaders)
      prisma.team.findMany({
        include: {
          stores: {
            include: {
              orders: {
                where: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
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
                  name: true,
                  username: true
                }
              }
            }
          }
        },
        take: 5
      })
    ])
    
    // Process top stores
    const topStoresData = topStores.map(store => ({
      id: store.id,
      name: store.name,
      platform: store.platform,
      revenue: store.orders.reduce((sum, order) => sum + Number(order.total), 0),
      orderCount: store.orders.length
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    
    // Process top products
    const topProductsData = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      soldQuantity: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      revenue: product.orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
    }))
    
    // Process top sellers
    const topSellersData = topSellers
      .filter(team => team.members.length > 0)
      .map(team => {
        const revenue = team.stores.reduce((sum, store) => 
          sum + store.orders.reduce((orderSum, order) => 
            orderSum + Number(order.total), 0
          ), 0
        )
        const orderCount = team.stores.reduce((sum, store) => 
          sum + store.orders.length, 0
        )
        
        return {
          id: team.members[0]?.user.id,
          name: team.members[0]?.user.name || team.members[0]?.user.username,
          team: team.name,
          revenue,
          orderCount
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    // Fetch trend data from cache
    const trendData = await prisma.analyticsCache.findMany({
      where: {
        metricType: 'TOTAL_REVENUE',
        dimension: 'OVERALL',
        date: {
          gte: startDate,
          lte: endDate
        },
        period: 'DAILY'
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    const orderTrendData = await prisma.analyticsCache.findMany({
      where: {
        metricType: 'ORDER_COUNT',
        dimension: 'OVERALL',
        date: {
          gte: startDate,
          lte: endDate
        },
        period: 'DAILY'
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    // Platform breakdown
    const platformBreakdown = await prisma.store.groupBy({
      by: ['platform'],
      where: {
        orders: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      },
      _count: {
        id: true
      }
    })
    
    return NextResponse.json({
      kpis: {
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        avgOrderValue: Number(totalRevenue._avg.total) || 0,
        totalOrders,
        todayOrders,
        pendingOrders,
        activeStores,
        activeProducts,
        revenueGrowth: revenueGrowth.toFixed(2)
      },
      topPerformers: {
        stores: topStoresData,
        products: topProductsData,
        sellers: topSellersData
      },
      trends: {
        revenue: trendData.map(item => ({
          date: item.date,
          value: Number(item.value)
        })),
        orders: orderTrendData.map(item => ({
          date: item.date,
          value: Number(item.value)
        }))
      },
      platformBreakdown: platformBreakdown.map(item => ({
        platform: item.platform,
        count: item._count.id
      }))
    })
    
  } catch (error) {
    console.error('Error fetching executive analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}