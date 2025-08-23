import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AnnouncementPanel } from "@/components/notifications/announcement-panel";
import { ChromeSwitcher } from "@/components/layout/chrome-switcher";
import { ErrorBoundary } from "@/components/error-boundary";
import { validateStartup } from "@/lib/startup-validation";

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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Run startup validation in development
  if (process.env.NODE_ENV === 'development') {
    validateStartup().catch(console.error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                Application Error
              </h1>
              <p className="text-red-600 dark:text-red-300 mb-4">
                Something went wrong with the application. Please refresh the page or contact support.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        }>
          <Providers>
            <AnnouncementPanel />
            <ChromeSwitcher>{children}</ChromeSwitcher>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
