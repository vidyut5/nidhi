"use client";

export const dynamic = 'force-dynamic'

import { useRef, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'

function SignInInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrlParam = searchParams?.get('callbackUrl') ?? undefined;

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();
    if (!emailTrimmed || !passwordTrimmed) {
      setError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        redirect: false,
        email: emailTrimmed,
        password: passwordTrimmed,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      const urlFromProvider = typeof result?.url === 'string' ? result.url : undefined;
      const sanitizeInternal = (u?: string): string | undefined => {
        if (!u) return undefined;
        try {
          const trimmed = u.trim();
          if (!trimmed) return undefined;
          // Only allow internal paths starting with single '/'
          if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
          // Disallow absolute URLs to avoid open redirects
          return undefined;
        } catch {
          return undefined;
        }
      };
      const target = sanitizeInternal(urlFromProvider) || sanitizeInternal(callbackUrlParam) || "/profile";
      router.replace(target);
    } catch (err) {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" aria-busy={loading}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                aria-describedby={error ? "signin-error" : undefined}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                aria-describedby={error ? "signin-error" : undefined}
              />
            </div>
            {error && (
              <p
                id="signin-error"
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                aria-atomic="true"
                aria-live="assertive"
                className="text-sm font-medium text-destructive"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading} aria-disabled={loading}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SignInInner />
    </Suspense>
  )
}
