"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Zap, Search, Home, Building2, ShoppingBag, Store, MessageSquare, HelpCircle, TrendingUp, User, Settings as SettingsIcon, Shield } from "lucide-react"
import { cn } from "@/lib/utils";
import { useSession, signIn, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
const LocationPicker = dynamic(() => import("@/components/location/location-picker").then(m => m.LocationPicker), { ssr: false });

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/sell", label: "Sell" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Vidyut
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/admin"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname.startsWith('/admin') ? "text-foreground" : "text-foreground/60"
              )}
            >
              Admin
            </Link>
          </nav>
        </div>
        
        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="mr-6 flex items-center space-x-2">
               <Zap className="h-6 w-6" />
               <span className="font-bold">Vidyut</span>
            </Link>
            <div className="pt-4 pb-2">
              <LocationPicker />
            </div>
            {/* Auth shortcuts for mobile side menu */}
            <div className="pt-4 border-t">
              {session ? (
                <div className="flex flex-col space-y-3">
                  <Link href="/profile" className="text-lg font-medium text-foreground/80 hover:text-foreground">Profile</Link>
                  <Link href="/orders" className="text-lg font-medium text-foreground/80 hover:text-foreground">My Orders</Link>
                  <Link href="/messages" className="text-lg font-medium text-foreground/80 hover:text-foreground">Messages</Link>
                  <button className="text-left text-lg font-medium text-blue-600 hover:underline" onClick={() => {
                    window.dispatchEvent(new Event('open-support'))
                  }}>Support</button>
                  <Button onClick={() => signOut()} variant="outline" className="mt-1 w-fit">Logout</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/signin" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
                  <Link href="/auth/signup" className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Sign Up</Link>
                </div>
              )}
            </div>
            <div className="pt-6 space-y-1">
              <nav className="space-y-1">
                <Link href="/">
                  <Button variant={pathname === '/' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <Home className="h-4 w-4 mr-3" />
                    Home
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant={pathname === '/search' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <Search className="h-4 w-4 mr-3" />
                    Search Products
                  </Button>
                </Link>
                <Link href="/brands">
                  <Button variant={pathname === '/brands' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <Building2 className="h-4 w-4 mr-3" />
                    Browse Brands
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant={pathname === '/orders' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <ShoppingBag className="h-4 w-4 mr-3" />
                    My Orders
                    <Badge variant="secondary" className="ml-auto">3</Badge>
                  </Button>
                </Link>
                <Link href="/sell/dashboard">
                  <Button variant={pathname.startsWith('/sell') ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <Store className="h-4 w-4 mr-3" />
                    Sell
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant={pathname === '/messages' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Messages
                  </Button>
                </Link>
                <Link href="/guidelines">
                  <Button variant={pathname === '/guidelines' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Guidelines
                  </Button>
                </Link>
                <Link href="/trending">
                  <Button variant={pathname === '/trending' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                    <TrendingUp className="h-4 w-4 mr-3" />
                    Trending
                  </Button>
                </Link>
                <button
                  className="w-full"
                  onClick={() => window.dispatchEvent(new Event('open-support'))}
                >
                  <span className="sr-only">Open support</span>
                </button>
              </nav>

              {/* Account */}
              <div className="pt-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">Account</div>
                <nav className="space-y-1">
                  <Link href="/profile">
                    <Button variant={pathname === '/profile' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant={pathname === '/settings' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                      <SettingsIcon className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button variant={pathname === '/help' ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                      <HelpCircle className="h-4 w-4 mr-3" />
                      Help
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant={pathname.startsWith('/admin') ? 'secondary' : 'ghost'} className="w-full justify-start h-10">
                      <Shield className="h-4 w-4 mr-3" />
                      Admin
                    </Button>
                  </Link>
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center logo for mobile */}
        <Link href="/" className="md:hidden ml-2 flex items-center space-x-2">
          <Zap className="h-6 w-6" />
          <span className="font-bold">Vidyut</span>
        </Link>

        {/* Right: search trigger for mobile */}
        <div className="flex flex-1 items-center justify-end md:justify-end">
          <Button
            variant="ghost"
            className="h-9 w-9 md:hidden"
            onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
