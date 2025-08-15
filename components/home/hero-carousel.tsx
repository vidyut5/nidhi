"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  ChevronRight, 
  Play, 
  Zap, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Star,
  CheckCircle
} from "lucide-react"

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  stats: { label: string; value: string }[]
  features: string[]
  ctaPrimary: { text: string; link: string }
  ctaSecondary: { text: string; link: string }
  imageUrl: string
  theme: 'primary' | 'secondary' | 'accent'
}

const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Professional Electrical Solutions",
    subtitle: "India's Most Trusted Electrical Marketplace",
    description: "Connect with verified suppliers, get competitive prices, and ensure quality with our comprehensive electrical component marketplace.",
    stats: [
      { label: "Active Products", value: "10,000+" },
      { label: "Verified Suppliers", value: "2,500+" },
      { label: "Happy Customers", value: "50,000+" }
    ],
    features: [
      "100% Genuine Products",
      "Competitive Pricing",
      "Fast Delivery",
      "Expert Support"
    ],
    ctaPrimary: { text: "Start Shopping", link: "/search" },
    ctaSecondary: { text: "Become a Seller", link: "/sell" },
    imageUrl: "/hero-electrical.jpg",
    theme: 'primary'
  },
  {
    id: "2", 
    title: "Smart Home Revolution",
    subtitle: "Future-Ready Electrical Solutions",
    description: "Upgrade to intelligent electrical systems with IoT-enabled switches, smart lighting, and home automation solutions.",
    stats: [
      { label: "Smart Products", value: "1,200+" },
      { label: "Home Automations", value: "15,000+" },
      { label: "Energy Saved", value: "40%" }
    ],
    features: [
      "IoT Integration",
      "Energy Monitoring", 
      "Remote Control",
      "Voice Assistant Compatible"
    ],
    ctaPrimary: { text: "Explore Smart Home", link: "/category/automation" },
    ctaSecondary: { text: "View Demo", link: "/demo" },
    imageUrl: "/product-1.jpg",
    theme: 'secondary'
  },
  {
    id: "3",
    title: "Industrial Power Solutions", 
    subtitle: "Heavy-Duty Equipment & Motors",
    description: "Industrial-grade electrical equipment for manufacturing, construction, and large-scale operations with certified quality standards.",
    stats: [
      { label: "Industrial Products", value: "3,500+" },
      { label: "Enterprise Clients", value: "1,000+" },
      { label: "Project Success Rate", value: "99.5%" }
    ],
    features: [
      "IS/IEC Certified",
      "Bulk Pricing",
      "Technical Support",
      "Custom Solutions"
    ],
    ctaPrimary: { text: "Browse Industrial", link: "/category/industrial" },
    ctaSecondary: { text: "Get Quote", link: "/quote" },
    imageUrl: "/product-3.jpg", 
    theme: 'accent'
  }
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length)
    }, 7000)

    return () => clearInterval(timer)
  }, [isPlaying])

  const currentSlide = heroSlides[currentIndex]

  const themeStyles = {
    primary: {
      gradient: "from-blue-900/95 via-blue-800/90 to-indigo-900/95",
      accent: "text-blue-300",
      highlight: "bg-blue-500",
      button: "bg-blue-600 hover:bg-blue-700"
    },
    secondary: {
      gradient: "from-emerald-900/95 via-green-800/90 to-teal-900/95", 
      accent: "text-emerald-300",
      highlight: "bg-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700"
    },
    accent: {
      gradient: "from-purple-900/95 via-violet-800/90 to-indigo-900/95",
      accent: "text-purple-300", 
      highlight: "bg-purple-500",
      button: "bg-purple-600 hover:bg-purple-700"
    }
  }

  const theme = themeStyles[currentSlide.theme]

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[80vh] min-h-[600px] max-h-[800px]">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            fill
            className="object-cover scale-105 animate-in zoom-in-105 duration-1000"
            priority={currentIndex === 0}
            placeholder="blur"
            blurDataURL="/placeholder.svg"
          />
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br",
            theme.gradient
          )} />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container-wide">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 text-white">
                <div className="space-y-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {currentSlide.subtitle}
                  </Badge>
                  
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                    {currentSlide.title}
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl">
                    {currentSlide.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3">
                  {currentSlide.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-white/90">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm lg:text-base">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold"
                  >
                    <Link href={currentSlide.ctaPrimary.link}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {currentSlide.ctaPrimary.text}
                    </Link>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    asChild
                    className="border-white/50 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6 h-auto"
                  >
                    <Link href={currentSlide.ctaSecondary.link}>
                      <Play className="mr-2 h-5 w-5" />
                      {currentSlide.ctaSecondary.text}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Stats Panel */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-white text-xl font-semibold mb-2">Platform Stats</h3>
                      <p className="text-white/70">Trusted by thousands nationwide</p>
                    </div>
                    
                    <div className="grid gap-6">
                      {currentSlide.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-3xl font-bold text-white mb-1">
                            {stat.value}
                          </div>
                          <div className="text-white/70 text-sm">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <div className="flex items-center justify-center space-x-1 text-white/80">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm ml-2">4.9/5 Customer Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(true)}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === currentIndex 
                  ? "w-12 h-3 bg-white" 
                  : "w-3 h-3 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="h-3 w-3" />
                <span>Play</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Stats Bar */}
      <div className="lg:hidden bg-background border-t">
        <div className="container-wide py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {currentSlide.stats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}