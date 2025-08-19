import OrderTrackingClient from './order-tracking-client'

// Generate static params for static export
export async function generateStaticParams() {
  // Generate demo order IDs for static export
  return Array.from({ length: 10 }, (_, i) => ({
    orderId: `demo-order-${i + 1}`,
  }))
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  return <OrderTrackingClient orderId={orderId} />
}



