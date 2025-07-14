"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function OAuthSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const hasHandled = useRef(false); // prevents infinite loop

  useEffect(() => {
    if (hasHandled.current) return;

    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const full_name = searchParams.get("full_name");
    const username = searchParams.get("username");
    const picture = searchParams.get("picture");

    if (token && id && email) {
      hasHandled.current = true;

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

      // Clean the URL and redirect to dashboard
      window.history.replaceState({}, document.title, "/");
      router.push("/dashboard");
    }
  }, [searchParams, router, addToast]);

  return <p>Logging in, please wait...</p>;
}
