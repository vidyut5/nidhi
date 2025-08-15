"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  Share2,
  ZoomIn,
  Star,
  TrendingUp,
} from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  productName: string
  isFeatured?: boolean
  discount?: number
  isNew?: boolean
  className?: string
}

export function ProductGallery({ 
  images, 
  productName, 
  isFeatured, 
  discount, 
  isNew,
  className 
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const selectImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <Card className="relative overflow-hidden group">
        <div className="relative aspect-square">
          <Image
            src={images[currentIndex] || '/placeholder.svg'}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              isZoomed && "scale-150 cursor-zoom-out",
              !isZoomed && "cursor-zoom-in"
            )}
            priority
            onClick={() => setIsZoomed(!isZoomed)}
            placeholder="blur"
            blurDataURL="/placeholder.svg"
          />

          {/* Overlays */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {isFeatured && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white">
                <TrendingUp className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {discount && discount > 0 && (
              <Badge variant="destructive" className="bg-red-500/90 text-white">
                -{discount}% OFF
              </Badge>
            )}
            {isNew && (
              <Badge variant="default" className="bg-green-500/90 text-white">
                NEW
              </Badge>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="sm" className="h-10 w-10 rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" className="h-10 w-10 rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-10 w-10 rounded-full"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {isZoomed ? <ZoomIn className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <Card
              key={index}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 cursor-pointer border-2 transition-colors overflow-hidden",
                index === currentIndex 
                  ? "border-primary" 
                  : "border-transparent hover:border-muted-foreground"
              )}
              onClick={() => selectImage(index)}
            >
              <Image
                src={image || '/placeholder.svg'}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="/placeholder.svg"
              />
            </Card>
          ))}
        </div>
      )}

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground text-center">
        Click image to zoom • Use arrows to navigate
      </div>
    </div>
  )
}

