"use client";

import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <main className={cn("h-full justify-items-center mx-auto max-w-4/5 dark:bg-black sm:items-start")}>
        {children}
      </main>
    </div>
  );
}
