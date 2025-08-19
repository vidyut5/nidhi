import { products } from '@/lib/dummy-data'
import ProductDetailClient from './product-detail-client'

// Generate static params for static export
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient productId={params.id} />
}