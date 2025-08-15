"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  ShoppingBag,
  Store,
  User,
  Settings,
  HelpCircle,
  BarChart3,
  Package,
  Users,
  TrendingUp,
  Zap,
  Lightbulb,
  Wrench,
  Building2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Command,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  

  const mainNavItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Search Products",
      href: "/search",
      icon: Search,
    },
    {
      title: "Browse Brands",
      href: "/brands",
      icon: Building2,
    },
    {
      title: "My Orders",
      href: "/orders",
      icon: ShoppingBag,
      badge: "3",
    },
    {
      title: "Sell",
      href: "/sell/dashboard",
      icon: Store,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Guidelines",
      href: "/guidelines",
      icon: HelpCircle,
    },
    {
      title: "Trending",
      href: "/trending",
      icon: TrendingUp,
    },
  ]

  type NavItem = { title: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string }
  const categoryItems: NavItem[] = []

  const sellerItems: NavItem[] = []

  const accountItems = [
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Help",
      href: "/help",
      icon: HelpCircle,
    },
  ]

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Vidyut</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Command Palette Shortcut */}
      {!collapsed && (
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-sm text-muted-foreground"
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true
              });
              document.dispatchEvent(event);
            }}
          >
            <Command className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <div className="ml-auto flex space-x-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                ⌘K
              </kbd>
            </div>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="space-y-6 p-4">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Navigation
              </h3>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {categoryItems.length > 0 && <Separator />}

          {categoryItems.length > 0 && (
            <div>
              {!collapsed && (
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Categories
                </h3>
              )}
              <nav className="space-y-1">
                {categoryItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && <span>{item.title}</span>}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {sellerItems.length > 0 && <Separator />}

          {sellerItems.length > 0 && (
            <div>
              {!collapsed && (
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Seller Tools
                </h3>
              )}
              <nav className="space-y-1">
                {sellerItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && <span>{item.title}</span>}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {(categoryItems.length > 0 || sellerItems.length > 0) && <Separator />}

          {/* Account */}
          <div>
            {!collapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Account
              </h3>
            )}
            <nav className="space-y-1">
              {accountItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
