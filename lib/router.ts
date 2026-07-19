"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AppRouter = ReturnType<typeof useRouter>;

let globalRouter: AppRouter | null = null;

export function GlobalRouterProvider() {
  const router = useRouter();

  useEffect(() => {
    globalRouter = router;

    return () => {
      globalRouter = null;
    };
  }, [router]);

  return null;
}

export function getRouter() {
  if (!globalRouter) {
    throw new Error("Global router is not initialized. Render <GlobalRouterProvider /> first.");
  }

  return globalRouter;
}

export function push(href: string) {
  globalRouter?.push(href);
}

export function replace(href: string) {
  globalRouter?.replace(href);
}

export function back() {
  globalRouter?.back();
}
