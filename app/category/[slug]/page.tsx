"use client"

import { Suspense } from 'react'
import CategoryListing from '@/components/category/category-listing'

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="container-wide py-8">Loading...</div>}>
      <CategoryListing />
    </Suspense>
  )
}