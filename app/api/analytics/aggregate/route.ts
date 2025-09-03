import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsAggregator } from '@/lib/analytics/aggregator'
import { subDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, days } = body
    
    // Create an instance of the aggregator
    const aggregator = new AnalyticsAggregator()
    
    if (days) {
      // Aggregate multiple days
      const daysToAggregate = parseInt(days)
      const dates = []
      
      for (let i = 0; i < daysToAggregate; i++) {
        const targetDate = subDays(new Date(), i)
        dates.push(targetDate)
        await aggregator.aggregateDailyMetrics(targetDate)
      }
      
      return NextResponse.json({
        success: true,
        message: `Aggregated metrics for ${daysToAggregate} days`,
        dates: dates.map(d => d.toISOString())
      })
    } else {
      // Aggregate single day
      const targetDate = date ? new Date(date) : new Date()
      await aggregator.aggregateDailyMetrics(targetDate)
      
      return NextResponse.json({
        success: true,
        message: `Aggregated metrics for ${targetDate.toISOString()}`
      })
    }
  } catch (error: any) {
    console.error('Error aggregating analytics:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Failed to aggregate analytics',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}