import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

interface ShopifyOrderWebhook {
  id: number
  order_number: string
  email: string
  created_at: string
  updated_at: string
  cancelled_at?: string
  financial_status: string
  fulfillment_status?: string
  total_price: string
  subtotal_price: string
  total_tax: string
  total_discounts: string
  currency: string
  customer: {
    first_name: string
    last_name: string
    email: string
  }
  billing_address: {
    first_name: string
    last_name: string
    address1: string
    address2?: string
    city: string
    province: string
    country: string
    zip: string
    phone?: string
  }
  shipping_address: {
    first_name: string
    last_name: string
    address1: string
    address2?: string
    city: string
    province: string
    country: string
    zip: string
    phone?: string
  }
  line_items: Array<{
    id: number
    product_id: number
    variant_id: number
    title: string
    sku: string
    quantity: number
    price: string
    properties?: Array<{
      name: string
      value: string
    }>
  }>
}

function mapShopifyStatus(financialStatus: string, fulfillmentStatus?: string): OrderStatus {
  if (fulfillmentStatus === 'fulfilled') return OrderStatus.DELIVERED
  if (fulfillmentStatus === 'partial') return OrderStatus.IN_PRODUCTION
  if (fulfillmentStatus === 'shipped') return OrderStatus.SHIPPED
  
  switch (financialStatus.toLowerCase()) {
    case 'paid':
      return OrderStatus.PROCESSING
    case 'pending':
      return OrderStatus.PENDING
    case 'refunded':
      return OrderStatus.REFUNDED
    case 'voided':
      return OrderStatus.CANCELLED
    default:
      return OrderStatus.PENDING
  }
}

function mapPaymentStatus(financialStatus: string): PaymentStatus {
  switch (financialStatus.toLowerCase()) {
    case 'paid':
      return PaymentStatus.PAID
    case 'pending':
      return PaymentStatus.PENDING
    case 'partially_paid':
      return PaymentStatus.PARTIAL
    case 'refunded':
      return PaymentStatus.REFUNDED
    case 'voided':
    case 'abandoned':
      return PaymentStatus.FAILED
    default:
      return PaymentStatus.PENDING
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhook: ShopifyOrderWebhook = await request.json()
    const shopDomain = request.headers.get('x-shopify-shop-domain')
    
    if (!shopDomain) {
      return NextResponse.json({ error: 'Missing shop domain' }, { status: 400 })
    }
    
    const store = await prisma.store.findFirst({
      where: {
        platform: 'SHOPIFY',
        storeUrl: { contains: shopDomain },
        isActive: true
      },
      include: {
        team: true
      }
    })
    
    if (!store) {
      console.warn(`Store not found for Shopify domain: ${shopDomain}`)
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    
    const orderNumber = `SH-${webhook.order_number}`
    
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    })
    
    const shippingAddress = {
      name: `${webhook.shipping_address.first_name} ${webhook.shipping_address.last_name}`,
      phone: webhook.shipping_address.phone || '',
      address1: webhook.shipping_address.address1,
      address2: webhook.shipping_address.address2 || '',
      city: webhook.shipping_address.city,
      state: webhook.shipping_address.province,
      postalCode: webhook.shipping_address.zip,
      country: webhook.shipping_address.country
    }
    
    const billingAddress = {
      name: `${webhook.billing_address.first_name} ${webhook.billing_address.last_name}`,
      phone: webhook.billing_address.phone || '',
      address1: webhook.billing_address.address1,
      address2: webhook.billing_address.address2 || '',
      city: webhook.billing_address.city,
      state: webhook.billing_address.province,
      postalCode: webhook.billing_address.zip,
      country: webhook.billing_address.country
    }
    
    if (existingOrder) {
      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: mapShopifyStatus(webhook.financial_status, webhook.fulfillment_status),
          paymentStatus: mapPaymentStatus(webhook.financial_status),
          updatedAt: new Date()
        }
      })
      
      await prisma.orderStatusHistory.create({
        data: {
          orderId: existingOrder.id,
          status: mapShopifyStatus(webhook.financial_status, webhook.fulfillment_status),
          reason: 'Updated from Shopify webhook'
        }
      })
      
      return NextResponse.json({ orderId: updatedOrder.id, action: 'updated' })
    }
    
    const subtotal = parseFloat(webhook.subtotal_price)
    const tax = parseFloat(webhook.total_tax)
    const discount = parseFloat(webhook.total_discounts)
    const total = parseFloat(webhook.total_price)
    const shipping = total - subtotal - tax + discount
    
    const newOrder = await prisma.order.create({
      data: {
        storeId: store.id,
        orderNumber,
        customerName: `${webhook.customer.first_name} ${webhook.customer.last_name}`,
        customerEmail: webhook.customer.email,
        shippingAddress,
        billingAddress,
        status: mapShopifyStatus(webhook.financial_status, webhook.fulfillment_status),
        paymentStatus: mapPaymentStatus(webhook.financial_status),
        subtotal,
        shippingCost: shipping,
        tax,
        discount,
        total,
        currency: webhook.currency,
        metadata: {
          platform: 'shopify',
          originalOrderId: webhook.id.toString(),
          shopDomain
        },
        items: {
          create: await Promise.all(webhook.line_items.map(async (item) => {
            let product = await prisma.product.findFirst({
              where: {
                storeId: store.id,
                sku: item.sku
              }
            })
            
            if (!product) {
              product = await prisma.product.create({
                data: {
                  storeId: store.id,
                  sku: item.sku,
                  name: item.title,
                  basePrice: parseFloat(item.price),
                  costPrice: parseFloat(item.price) * 0.6,
                  metadata: {
                    autoCreated: true,
                    platform: 'shopify',
                    originalProductId: item.product_id.toString(),
                    originalVariantId: item.variant_id.toString()
                  }
                }
              })
            }
            
            const customization = item.properties?.reduce((acc, prop) => {
              acc[prop.name] = prop.value
              return acc
            }, {} as Record<string, string>)
            
            return {
              productId: product.id,
              quantity: item.quantity,
              unitPrice: parseFloat(item.price),
              totalPrice: parseFloat(item.price) * item.quantity,
              artworkData: customization?.image_url ? {
                imageUrl: customization.image_url,
                text: customization.text,
                placement: customization.placement,
                color: customization.color,
                size: customization.size
              } : undefined,
              printSpecs: customization ? {
                placement: customization.placement || 'front',
                method: 'dtg',
                color: customization.color,
                size: customization.size
              } : undefined,
              metadata: {
                platformItemId: item.id.toString(),
                originalProperties: item.properties
              }
            }
          }))
        },
        statusHistory: {
          create: {
            status: mapShopifyStatus(webhook.financial_status, webhook.fulfillment_status),
            reason: 'Order received from Shopify'
          }
        }
      }
    })
    
    if (webhook.financial_status === 'paid' && !webhook.fulfillment_status) {
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
      itemsCount: webhook.line_items.length
    })
  } catch (error) {
    console.error('Shopify webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}