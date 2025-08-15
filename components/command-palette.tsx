"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Home,
  ShoppingBag,
  Package,
  Store,
  TrendingUp,
  Heart,
  History,
  HelpCircle,
  LogOut,
  Bell,
  Shield,
  Zap,
  Globe,
  Lightbulb,
  Wrench,
  MonitorSpeaker,
  Building2,
  Users,
  BarChart3,
  ShoppingCart,
  Star,
  MessageSquare,
  Filter,
  SortAsc,
} from "lucide-react"

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open = false, onOpenChange }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(open)
  const router = useRouter()

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
        onOpenChange?.(!isOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [onOpenChange, isOpen])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  const runCommand = (command: () => void) => {
    setIsOpen(false)
    command()
  }

  // Avoid rendering the dialog until after mount to skip SSR/hydration cost
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Products</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/orders"))}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sell"))}>
            <Store className="mr-2 h-4 w-4" />
            <span>Sell Products</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Categories">
          <CommandItem onSelect={() => runCommand(() => router.push("/search?category=electrical"))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Electrical Components</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?category=lighting"))}>
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>Lighting Solutions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?category=tools"))}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Tools & Equipment</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?category=industrial"))}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Industrial Equipment</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?category=automation"))}>
            <MonitorSpeaker className="mr-2 h-4 w-4" />
            <span>Automation Systems</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/new"))}>
            <Package className="mr-2 h-4 w-4" />
            <span>List New Product</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?filter=trending"))}>
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>View Trending Products</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/profile/wishlist"))}>
            <Heart className="mr-2 h-4 w-4" />
            <span>My Wishlist</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/orders?status=recent"))}>
            <History className="mr-2 h-4 w-4" />
            <span>Recent Orders</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/dashboard"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Seller Dashboard</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => router.push("/profile/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/profile/notifications"))}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/profile/security"))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/help"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Seller Tools">
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/analytics"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Sales Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/inventory"))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Manage Inventory</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/customers"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Customer Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/reviews"))}>
            <Star className="mr-2 h-4 w-4" />
            <span>Product Reviews</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sell/messages"))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Customer Messages</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Search Filters">
          <CommandItem onSelect={() => runCommand(() => router.push("/search?sort=price-low"))}>
            <SortAsc className="mr-2 h-4 w-4" />
            <span>Sort by Price: Low to High</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?sort=price-high"))}>
            <SortAsc className="mr-2 h-4 w-4 rotate-180" />
            <span>Sort by Price: High to Low</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?sort=rating"))}>
            <Star className="mr-2 h-4 w-4" />
            <span>Sort by Rating</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?sort=newest"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Sort by Newest</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search?filter=in-stock"))}>
            <Filter className="mr-2 h-4 w-4" />
            <span>Show In Stock Only</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  
  const toggle = () => setOpen(prev => !prev)
  
  return { open, setOpen, toggle }
}

