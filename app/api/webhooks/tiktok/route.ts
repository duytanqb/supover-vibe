import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

interface TikTokOrderWebhook {
  event_type: string
  shop_id: string
  order: {
    order_id: string
    order_status: string
    buyer_email: string
    create_time: number
    update_time: number
    payment: {
      total_amount: number
      currency: string
      payment_status: string
    }
    delivery: {
      shipping_address: {
        name: string
        phone: string
        address_line_1: string
        address_line_2?: string
        city: string
        state: string
        postal_code: string
        country: string
      }
    }
    line_items: Array<{
      product_id: string
      product_name: string
      sku_id: string
      quantity: number
      price: number
      platform_discount: number
      seller_discount: number
      customization?: {
        text?: string
        image_url?: string
        placement?: string
        color?: string
        size?: string
      }
    }>
  }
}

function mapTikTokStatus(tiktokStatus: string): OrderStatus {
  switch (tiktokStatus.toLowerCase()) {
    case 'awaiting_shipment':
    case 'partial_shipping':
      return OrderStatus.PROCESSING
    case 'in_transit':
      return OrderStatus.SHIPPED
    case 'delivered':
      return OrderStatus.DELIVERED
    case 'cancelled':
      return OrderStatus.CANCELLED
    default:
      return OrderStatus.PENDING
  }
}

function mapPaymentStatus(tiktokPaymentStatus: string): PaymentStatus {
  switch (tiktokPaymentStatus.toLowerCase()) {
    case 'paid':
      return PaymentStatus.PAID
    case 'pending':
      return PaymentStatus.PENDING
    case 'failed':
      return PaymentStatus.FAILED
    case 'refunded':
      return PaymentStatus.REFUNDED
    default:
      return PaymentStatus.PENDING
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhook: TikTokOrderWebhook = await request.json()
    
    if (webhook.event_type !== 'order_status_update' && webhook.event_type !== 'order_create') {
      return NextResponse.json({ received: true })
    }
    
    const store = await prisma.store.findFirst({
      where: {
        platform: 'TIKTOK_SHOP',
        sellerId: webhook.shop_id,
        isActive: true
      },
      include: {
        team: true
      }
    })
    
    if (!store) {
      console.warn(`Store not found for TikTok shop ID: ${webhook.shop_id}`)
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    
    const { order: tiktokOrder } = webhook
    const orderNumber = `TT-${tiktokOrder.order_id}`
    
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    })
    
    const shippingAddress = {
      name: tiktokOrder.delivery.shipping_address.name,
      phone: tiktokOrder.delivery.shipping_address.phone,
      address1: tiktokOrder.delivery.shipping_address.address_line_1,
      address2: tiktokOrder.delivery.shipping_address.address_line_2 || '',
      city: tiktokOrder.delivery.shipping_address.city,
      state: tiktokOrder.delivery.shipping_address.state,
      postalCode: tiktokOrder.delivery.shipping_address.postal_code,
      country: tiktokOrder.delivery.shipping_address.country
    }
    
    if (existingOrder) {
      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: mapTikTokStatus(tiktokOrder.order_status),
          paymentStatus: mapPaymentStatus(tiktokOrder.payment.payment_status),
          updatedAt: new Date()
        }
      })
      
      await prisma.orderStatusHistory.create({
        data: {
          orderId: existingOrder.id,
          status: mapTikTokStatus(tiktokOrder.order_status),
          reason: 'Updated from TikTok webhook'
        }
      })
      
      return NextResponse.json({ orderId: updatedOrder.id, action: 'updated' })
    }
    
    const subtotal = tiktokOrder.line_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = tiktokOrder.payment.total_amount
    
    const newOrder = await prisma.order.create({
      data: {
        storeId: store.id,
        orderNumber,
        customerName: tiktokOrder.delivery.shipping_address.name,
        customerEmail: tiktokOrder.buyer_email,
        shippingAddress,
        status: mapTikTokStatus(tiktokOrder.order_status),
        paymentStatus: mapPaymentStatus(tiktokOrder.payment.payment_status),
        subtotal,
        shippingCost: total - subtotal,
        tax: 0,
        total,
        currency: tiktokOrder.payment.currency,
        metadata: {
          platform: 'tiktok',
          originalOrderId: tiktokOrder.order_id,
          shopId: webhook.shop_id
        },
        items: {
          create: await Promise.all(tiktokOrder.line_items.map(async (item) => {
            let product = await prisma.product.findFirst({
              where: {
                storeId: store.id,
                sku: item.sku_id
              }
            })
            
            if (!product) {
              product = await prisma.product.create({
                data: {
                  storeId: store.id,
                  sku: item.sku_id,
                  name: item.product_name,
                  basePrice: item.price,
                  costPrice: item.price * 0.6,
                  metadata: {
                    autoCreated: true,
                    platform: 'tiktok',
                    originalProductId: item.product_id
                  }
                }
              })
            }
            
            return {
              productId: product.id,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity,
              artworkData: item.customization ? {
                text: item.customization.text,
                imageUrl: item.customization.image_url,
                placement: item.customization.placement,
                color: item.customization.color,
                size: item.customization.size
              } : undefined,
              printSpecs: item.customization ? {
                placement: item.customization.placement,
                method: 'dtg'
              } : undefined,
              metadata: {
                platformItemId: item.product_id,
                originalCustomization: item.customization
              }
            }
          }))
        },
        statusHistory: {
          create: {
            status: mapTikTokStatus(tiktokOrder.order_status),
            reason: 'Order received from TikTok'
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (webhook.event_type === 'order_create') {
      try {
        const processResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/orders/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrder.id, autoFulfill: true })
        })
        
        if (!processResponse.ok) {
          console.warn('Auto-fulfillment failed for order:', newOrder.id)
        }
      } catch (error) {
        console.warn('Auto-fulfillment error:', error)
      }
    }
    
    return NextResponse.json({ 
      orderId: newOrder.id, 
      action: 'created',
      itemsCount: newOrder.items.length
    })
  } catch (error) {
    console.error('TikTok webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}