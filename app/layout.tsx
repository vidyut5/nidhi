import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { NavbarEnhanced } from "@/components/layout/navbar-enhanced";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vidyut - Electrical Marketplace",
  description: "Your one-stop shop for electrical supplies and equipment",
  keywords: ["electrical", "marketplace", "components", "lighting", "tools", "industrial"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen">
            {/* Desktop Sidebar - Hidden on mobile */}
            <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
              <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64">
              {/* Enhanced Navbar for desktop, fallback for mobile */}
              <div className="hidden lg:block">
                <NavbarEnhanced />
              </div>
              <div className="lg:hidden">
                <Navbar />
              </div>

              {/* Main Content */}
              <main className="flex-1 pb-24 lg:pb-0">
                {children}
              </main>

              {/* Footer - Hidden on mobile where bottom nav is used */}
              <div className="hidden lg:block">
                <Footer />
              </div>
            </div>

            {/* Mobile Bottom Navigation - Hidden on desktop */}
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
