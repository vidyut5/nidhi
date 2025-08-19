import OrderTrackingClient from './order-tracking-client'

// Generate static params for static export
export async function generateStaticParams() {
  // Generate demo order IDs for static export
  return Array.from({ length: 10 }, (_, i) => ({
    orderId: `demo-order-${i + 1}`,
  }))
}

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  return <OrderTrackingClient orderId={params.orderId} />
}



