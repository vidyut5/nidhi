import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-production'

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://vidyut.com'
    const currentDate = new Date().toISOString()
    
    const prisma = db.getClient()
    
    // Fetch data for sitemap
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        take: 1000 // Limit for performance
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true }
      })
    ])
    
    // Static pages
    const staticPages = [
      { url: '', priority: '1.0' },
      { url: 'categories', priority: '0.9' },
      { url: 'brands', priority: '0.8' },
      { url: 'trending', priority: '0.8' }
    ]
    
    // Generate XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
    
    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
    })
    
    // Add products
    products.forEach(product => {
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`
    })
    
    // Add categories
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`
    })
    
    sitemap += `
</urlset>`
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
    
  } catch (error) {
    console.error('Sitemap error:', error)
    
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXTAUTH_URL || 'https://vidyut.com'}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`
    
    return new NextResponse(basicSitemap, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}