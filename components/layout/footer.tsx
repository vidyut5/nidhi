import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-20 md:flex-row md:py-0">
        <div className="flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4 text-red-600" />
          <span>
            Made with love in India by <a href="https://nexes.us" target="_blank" rel="noreferrer" className="font-medium hover:underline">Nexes</a>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="text-sm font-medium hover:underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm font-medium hover:underline underline-offset-4">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
