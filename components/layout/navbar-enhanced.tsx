"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
const LocationPicker = dynamic(() => import("@/components/location/location-picker").then(m => m.LocationPicker), { ssr: false });
// Removed DensityToggle, Cart, and theme toggle per request
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Bell,
  Heart,
  Package,
  Settings,
  LogOut,
  
  Zap,
  Command,
} from "lucide-react";
 

export function NavbarEnhanced() {
  const [notifications] = useState(0);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-14 items-center">
        {/* Mobile Menu Button - Only visible on mobile when sidebar is hidden */}
        <Button
          variant="ghost"
          className="mr-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Logo - Only visible on mobile or when sidebar is collapsed */}
        <Link className="mr-6 flex items-center space-x-2 lg:hidden" href="/">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Vidyut</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile as sidebar handles this */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium mr-6">
          <Link
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="/trending"
          >
            Trending
          </Link>
          <Link
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="/categories"
          >
            Categories
          </Link>
          <Link
            className="transition-colors hover:text-foreground/80 text-foreground/60"
            href="/enterprise"
          >
            Enterprise
          </Link>
          <Link
            className="transition-colors hover:text-foreground/80 text-foreground"
            href="/admin"
          >
            Admin
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Search Bar + Location */}
          <div className="flex-none w-[300px] sm:w-[360px] md:w-[420px] lg:w-[460px] xl:w-[500px] 2xl:w-[560px] flex items-center gap-2 mr-2">
            <div className="hidden md:block">
              <LocationPicker />
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm text-muted-foreground rounded-full px-3"
              onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search products...</span>
              <div className="ml-auto hidden sm:flex">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </Button>
          </div>

          {/* Action Buttons (reduced) */}
          <div className="flex items-center space-x-2 flex-none">
            {/* Mobile location */}
            <div className="md:hidden">
              <LocationPicker />
            </div>
            {/* Removed theme & density toggles */}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wishlist" className="h-8 w-8 p-0">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* Removed cart button */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Guest</p>
                    <p className="text-xs leading-none text-muted-foreground"></p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
