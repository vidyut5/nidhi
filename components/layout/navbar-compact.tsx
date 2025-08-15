"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Heart, Search, Zap } from "lucide-react";
import { useState } from "react";

const LocationPicker = dynamic(() => import("@/components/location/location-picker").then(m => m.LocationPicker), { ssr: false });

export function NavbarCompact() {
  const [notifications] = useState(0);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-14 items-center">
        {/* Logo intentionally omitted on desktop since sidebar shows branding */}

        {/* Search (fixed width, non-growing) */}
        <div className="flex-none w-[280px] sm:w-[340px] md:w-[420px] lg:w-[480px] xl:w-[520px] 2xl:w-[560px] mr-2">
          <Button
            variant="outline"
            className="w-full justify-start text-sm text-muted-foreground rounded-full px-3"
            onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search products...</span>
            <span className="ml-auto hidden sm:flex">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
            </span>
          </Button>
        </div>

        {/* Fill space */}
        <div className="flex-1" />

        {/* Right icons cluster (never shrinks) */}
        <div className="flex items-center gap-2 flex-none">
          <div className="hidden md:block">
            <LocationPicker />
          </div>
          <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{notifications}</Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/wishlist" className="h-8 w-8 p-0" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/auth/signin" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hidden sm:block">Sign In</Link>
          <Link href="/auth/signup" className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 hidden sm:block">Sign Up</Link>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" aria-label="Account">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
}


