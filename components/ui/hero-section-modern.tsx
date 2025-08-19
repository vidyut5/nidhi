'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { cn } from '@/lib/utils'
import { ChevronRight, Zap, Search, Building2, TrendingUp, Users, ShoppingBag } from 'lucide-react'

export function HeroSectionModern() {
    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
                
                <div className="py-16 md:py-20 lg:py-24 relative">
                    <div className="container-wide">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                            {/* Content */}
                            <div className="space-y-8 lg:col-span-2">
                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-in fade-in-0 slide-in-from-left-4 duration-700">
                                        India's Largest{' '}
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Electricity Information
                                        </span>{' '}
                                        Platform for B2B, D2C and C2C
                                    </h1>
                                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-200">
                                        Produced by <span className="font-semibold text-foreground">Madhu Powertech Private Limited</span>
                                    </p>
                                    
                                    {/* Quick Stats */}
                                    <div className="flex flex-wrap gap-6 pt-4 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-400">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                                <Users className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <span>2,500+ Suppliers</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                <ShoppingBag className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span>10,000+ Products</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                                <TrendingUp className="h-3 w-3 text-purple-600" />
                                            </div>
                                            <span>500+ Cities Served</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-600">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-12 rounded-full pl-5 pr-3 text-base bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                                        <Link href="/search">
                                            <Search className="mr-2 h-4 w-4" />
                                            <span className="text-nowrap">Start Shopping</span>
                                            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="h-12 rounded-full px-5 text-base hover:scale-105 transition-all duration-200 hover:bg-accent/50">
                                        <Link href="/sell/dashboard">
                                            <Building2 className="mr-2 h-4 w-4" />
                                            <span className="text-nowrap">Become a Seller</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Hero Image */}
                            <div className="relative lg:col-span-3 group animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-300">
                                <div className="aspect-square md:aspect-[4/3] lg:aspect-[5/3] xl:aspect-[2/1] max-w-lg md:max-w-xl lg:max-w-none mx-auto lg:mx-0 rounded-3xl overflow-hidden border border-border shadow-2xl relative transition-all duration-500 group-hover:shadow-3xl group-hover:scale-[1.02]">
                                    <Image 
                                        src="/hero%20image.jpg" 
                                        alt="Electrical Products Showcase - Switches, Outlets, Fans, and Components" 
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
                                    />
                                    {/* Subtle overlay with hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent transition-opacity duration-500 group-hover:from-black/5" />
                                    
                                    {/* Floating badge */}
                                    <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                        <Zap className="h-3 w-3" />
                                        Premium Quality
                                    </div>
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Partners Section */}
            <section className="bg-muted/30 py-8">
                <div className="container-wide">
                    <div className="flex flex-col items-center md:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <p className="text-sm text-muted-foreground font-medium">Trusted by leading brands</p>
                        </div>
                        <div className="flex-1 relative">
                            <InfiniteSlider
                                speedOnHover={20}
                                speed={40}
                                gap={80}
                                className="py-4">
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Havells</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Legrand</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Schneider</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Philips</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Siemens</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">ABB</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Crompton</div>
                                </div>
                                <div className="flex items-center justify-center min-w-[120px]">
                                    <div className="text-lg font-bold text-muted-foreground/60">Anchor</div>
                                </div>
                            </InfiniteSlider>

                            <ProgressiveBlur
                                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                direction="left"
                                blurIntensity={1}
                            />
                            <ProgressiveBlur
                                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                direction="right"
                                blurIntensity={1}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}