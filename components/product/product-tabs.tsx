"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  CheckCircle,
  User,
  Calendar,
  Package,
  Zap,
  Shield,
  Wrench,
} from "lucide-react"

interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  user: { name: string; verified: boolean }
  createdAt: string
  helpful: number
  images?: string[]
}

interface ProductTabsProps {
  product: {
    id: string
    name: string
    description: string
    specifications?: string
    warranty?: string
    returnPolicy?: string
  }
  reviews?: Review[]
  className?: string
}

export function ProductTabs({ product, reviews = [], className }: ProductTabsProps) {
  let specifications: Record<string, string> = {}
  if (product.specifications) {
    try {
      const parsed = JSON.parse(product.specifications)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const specObj: Record<string, string> = {}
        for (const [k, v] of Object.entries(parsed)) {
          specObj[String(k)] = String(v as unknown as string)
        }
        specifications = specObj
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('product-tabs: failed to parse specifications', e)
      }
      specifications = {}
    }
  }

  // Mock reviews data for demo
  const mockReviews: Review[] = [
    {
      id: "1",
      rating: 5,
      title: "Excellent Quality Product",
      comment: "This is exactly what I was looking for. The build quality is excellent and it arrived quickly. The smart features work perfectly with my home automation system. Would definitely recommend to others.",
      user: {
        name: "Rajesh Kumar",
        verified: true,
      },
      createdAt: "2024-01-15",
      helpful: 12,
      images: ["/product-1.jpg"],
    },
    {
      id: "2", 
      rating: 4,
      title: "Good value for money",
      comment: "Works as expected. Installation was straightforward and the app connectivity is reliable. Only minor issue is the indicator light could be brighter.",
      user: {
        name: "Priya Sharma",
        verified: true,
      },
      createdAt: "2024-01-10",
      helpful: 8,
      images: [],
    },
    {
      id: "3",
      rating: 5,
      title: "Professional grade quality",
      comment: "I'm an electrician and have installed many of these. This brand consistently delivers reliable products. The energy monitoring feature is very accurate.",
      user: {
        name: "Amit Electricals",
        verified: true,
      },
      createdAt: "2024-01-05",
      helpful: 15,
      images: [],
    },
  ]
  const allReviews = (reviews.length > 0
    ? reviews
    : (process.env.NODE_ENV !== 'production' ? mockReviews : []))
  const total = allReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = allReviews.length ? total / allReviews.length : 0

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              size === "sm" ? "h-3 w-3" : "h-4 w-4",
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="details" className={cn("w-full", className)}>
      <TabsList className="grid grid-cols-3 w-full max-w-md">
        <TabsTrigger value="details" className="flex items-center">
          <Package className="mr-2 h-4 w-4" />
          Details
        </TabsTrigger>
        <TabsTrigger value="specifications" className="flex items-center">
          <Wrench className="mr-2 h-4 w-4" />
          Specs
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center">
          <Star className="mr-2 h-4 w-4" />
          Reviews ({allReviews.length})
        </TabsTrigger>
      </TabsList>

      {/* Product Details */}
      <TabsContent value="details" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Warranty & Returns
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>{product.warranty || "2 years manufacturer warranty"}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>{product.returnPolicy || "30-day hassle-free returns"}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Free replacement for manufacturing defects</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Key Features
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Energy efficient design</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Easy installation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Universal compatibility</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Professional grade quality</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Specifications */}
      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(specifications).length > 0 ? (
              <div className="grid gap-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="font-medium text-muted-foreground">{key}</span>
                    <span className="font-medium text-right">{value as string}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Detailed specifications will be updated soon.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reviews */}
      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          {/* Reviews Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Customer Reviews
                </span>
                <Badge variant="secondary">
                  {allReviews.length} reviews
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center justify-center mt-1">
                    {renderStars(averageRating, "md")}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Average rating
                  </p>
                </div>
                
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = allReviews.filter(r => r.rating === stars).length
                    const percentage = allReviews.length ? (count / allReviews.length) * 100 : 0
                    
                    return (
                      <div key={stars} className="flex items-center space-x-2 text-sm">
                        <span className="w-8">{stars}★</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-muted-foreground">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Reviews */}
          <div className="space-y-4">
            {allReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.user.name}</span>
                            {review.user.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Review Content */}
                    <div>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>

                    {/* Review Actions */}
                    <div className="flex items-center space-x-4 pt-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsDown className="mr-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Write Review Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Share Your Experience</h3>
                <p className="text-muted-foreground mb-4">
                  Help other customers by writing a detailed review
                </p>
                <Button>Write a Review</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}



