"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/sell/dashboard", label: "Sell", icon: PlusSquare },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t h-16 z-50">
      <div className="flex justify-around items-center h-full">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-sm font-medium transition-colors",
              pathname === href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
