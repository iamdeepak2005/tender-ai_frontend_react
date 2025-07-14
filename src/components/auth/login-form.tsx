"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { loginWithGoogle } from "@/lib/auth";
import { useToast } from "@/contexts/ToastContext";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hasHandledOAuth = useRef(false);

  useEffect(() => {
    if (hasHandledOAuth.current) return; // Prevent re-run
  
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const full_name = searchParams.get("full_name");
    const username = searchParams.get("username");
    const picture = searchParams.get("picture");
  
    if (token && id && email) {
      hasHandledOAuth.current = true; // ✅ Set once
      
      const user = {
        id,
        email,
        full_name,
        username,
        picture,
        access_token: token,
      };
  
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      addToast(`Welcome back, ${full_name || email}!`, "success");
      router.push("/dashboard");
  
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
  }, [searchParams, router, addToast]);  const handleGoogleLogin = () => {
    setIsLoading(true);
    loginWithGoogle();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For normal login (optional, not implemented)
    router.push("/dashboard");
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Icons.logo className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-center text-2xl">Login to TenderAI</CardTitle>
        <CardDescription className="text-center">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Login"
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
