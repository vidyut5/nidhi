"use client"

import { Suspense } from 'react'
import CategoryListing from '@/components/category/category-listing'
import { demoCategories } from '@/lib/demo-data'

// Generate static params for static export
export async function generateStaticParams() {
  return demoCategories.map((category) => ({
    slug: category.slug,
  }))
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="container-wide py-8">Loading...</div>}>
      <CategoryListing />
    </Suspense>
  )
}