"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Award,
  Plus,
  Minus,
  Package,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface ProductInfoProps {
  product: {
    id: string
    name: string
    brand?: string
    model?: string
    price: number
    originalPrice?: number
    description: string
    shortDescription?: string
    stock: number
    rating: number
    reviewCount: number
    salesCount?: number
      colors?: string
  sizes?: string
    specifications?: any
    warranty?: string
    returnPolicy?: string
    seller: {
      id: string
      name: string
      rating: number
    }
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")

  const safeParse = <T,>(input: unknown, fallback: T): T => {
    if (!input || typeof input !== 'string') return fallback
    try {
      const parsed = JSON.parse(input)
      return parsed as T
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('product-info: failed to parse JSON field', e)
      }
      return fallback
    }
  }
  const colors = safeParse<string[]>(product.colors, [])
  const sizes = safeParse<string[]>(product.sizes, [])
  const specifications = safeParse<Record<string, string>>(product.specifications, {})

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const isInStock = product.stock > 0
  const isLowStock = product.stock <= 10 && product.stock > 0

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {product.brand && (
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
          )}
          {product.model && (
            <Badge variant="outline" className="text-xs">
              Model: {product.model}
            </Badge>
          )}
        </div>
        
        <h1 className="text-2xl lg:text-3xl font-bold mb-3">
          {product.name}
        </h1>

        {product.shortDescription && (
          <p className="text-muted-foreground text-lg mb-4">
            {product.shortDescription}
          </p>
        )}

        {/* Rating & Reviews */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount.toLocaleString()} reviews)
          </span>
          {product.salesCount && (
            <span className="text-sm text-muted-foreground">
              • {product.salesCount.toLocaleString()} sold
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <Badge variant="destructive">
                {discount}% OFF
              </Badge>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Inclusive of all taxes • Free shipping on orders above ₹500
        </p>
      </div>

      <Separator />

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        {isInStock ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-600 font-medium">In Stock</span>
            {isLowStock && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Only {product.stock} left!
              </Badge>
            )}
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-600 font-medium">Out of Stock</span>
          </>
        )}
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color: string) => (
              <Button
                key={color}
                variant={selectedColor === color ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedColor(color)}
                className="min-w-20"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Size</Label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size: string) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Quantity Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quantity</Label>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (val >= 1 && val <= product.stock) {
                  setQuantity(val)
                }
              }}
              className="w-16 h-8 text-center border-0 focus-visible:ring-0"
              min="1"
              max={product.stock}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={increaseQuantity}
              disabled={quantity >= product.stock}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            Max: {product.stock} available
          </span>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full h-12 text-lg" 
          disabled={!isInStock || (colors.length > 0 && !selectedColor)}
          aria-disabled={!isInStock || (colors.length > 0 && !selectedColor)}
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isInStock ? (colors.length > 0 && !selectedColor ? 'Select a color' : 'Add to Cart') : 'Out of Stock'}
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Separator />

      {/* Delivery & Services */}
      <div className="space-y-4">
        <h3 className="font-semibold">Delivery & Services</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-muted-foreground">
                Standard delivery in 3-5 business days
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-muted-foreground">
                {product.returnPolicy || '30-day return policy'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Warranty</p>
              <p className="text-xs text-muted-foreground">
                {product.warranty || 'Manufacturer warranty included'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Quality Assured</p>
              <p className="text-xs text-muted-foreground">
                Genuine products with quality guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Seller Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Seller Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{product.seller.name}</p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < Math.floor(product.seller.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.seller.rating} seller rating
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            Ships from seller location
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Usually ships within 1-2 business days
          </div>
        </CardContent>
      </Card>

      {/* Key Specifications Preview */}
      {Object.keys(specifications).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Key Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(specifications).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{value as string}</span>
                </div>
              ))}
              {Object.keys(specifications).length > 4 && (
                <p className="text-xs text-muted-foreground mt-2">
                  View complete specifications below
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
