import { demoSellers } from '@/lib/demo-data'
import SellerProfileClient from './seller-profile-client'

// Generate static params for static export
export async function generateStaticParams() {
  return demoSellers.map((seller) => ({
    slug: seller.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export default function SellerPublicProfile({ params }: { params: { slug: string } }) {
  return <SellerProfileClient slug={params.slug} />
}


