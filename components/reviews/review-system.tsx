'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag,
  CheckCircle,
  Camera,
  Send
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  images?: string[]
  isVerifiedPurchase: boolean
  createdAt: Date
  helpful: number
  notHelpful: number
  replies?: Review[]
}

interface ReviewSystemProps {
  productId: string
  productName: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  canReview?: boolean
}

const sampleReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Rajesh Kumar',
    userAvatar: '/placeholder-avatar.jpg',
    rating: 5,
    title: 'Excellent quality switch!',
    content: 'Amazing product! The WiFi connectivity works flawlessly and the energy monitoring feature is very useful. Installation was straightforward with clear instructions. The app interface is intuitive and provides detailed energy consumption data. Highly recommended for smart home enthusiasts.',
    images: ['/product-1.jpg'],
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    helpful: 12,
    notHelpful: 1
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Priya Sharma',
    rating: 4,
    title: 'Good product with minor issues',
    content: 'Overall satisfied with the purchase. The switch works well and the smart features are as advertised. However, the initial setup took longer than expected due to network connectivity issues. Once configured, it has been working reliably. Good value for money.',
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    helpful: 8,
    notHelpful: 0
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Amit Patel',
    rating: 3,
    title: 'Average performance',
    content: 'The switch is okay but not exceptional. Works as described but the app could be more user-friendly. Sometimes there are delays in response. Customer service was helpful when I had questions.',
    isVerifiedPurchase: false,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    helpful: 3,
    notHelpful: 2
  }
]

export function ReviewSystem({
  productId,
  productName,
  reviews = sampleReviews,
  averageRating = 4.5,
  totalReviews = 342,
  canReview = true
}: ReviewSystemProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: ''
  })

  const ratingDistribution = [
    { stars: 5, count: 201, percentage: 59 },
    { stars: 4, count: 89, percentage: 26 },
    { stars: 3, count: 31, percentage: 9 },
    { stars: 2, count: 14, percentage: 4 },
    { stars: 1, count: 7, percentage: 2 }
  ]

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : i < rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    )
  }

  const [errors, setErrors] = useState<{ rating?: string; title?: string; content?: string }>({})
  const handleSubmitReview = () => {
    const title = newReview.title.trim()
    const content = newReview.content.trim()
    const rating = newReview.rating
    const nextErrors: { rating?: string; title?: string; content?: string } = {}
    if (rating <= 0) nextErrors.rating = 'Please select a rating'
    if (!title) nextErrors.title = 'Title is required'
    if (!content) nextErrors.content = 'Review content is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Submit here (stub)
    setShowReviewForm(false)
    setNewReview({ rating: 0, title: '', content: '' })
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating}</div>
              {renderStars(averageRating, 'lg')}
              <div className="text-sm text-muted-foreground mt-2">
                Based on {totalReviews} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-sm w-6">{item.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <Progress value={item.percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {canReview && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full md:w-auto"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Write a Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                    className="p-1 h-8 w-8"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        i < newReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      )}
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Review Title</label>
              <Input
                placeholder="Summarize your experience"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                placeholder="Share your experience with this product..."
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button onClick={handleSubmitReview}>
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.userAvatar} />
                  <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                </Avatar>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(review.createdAt)}
                    </span>
                  </div>

                  <h4 className="font-semibold mb-2">{review.title}</h4>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {review.content}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-2 text-sm">
                    <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      ({review.notHelpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Reviews */}
      {reviews.length < totalReviews && (
        <div className="text-center">
          <Button variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}

