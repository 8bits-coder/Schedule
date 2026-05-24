"use client";

import { useAuth } from "@/components/context/AuthContext";
import { cn } from "@/lib/utils";
import { RiLoader5Fill } from "react-icons/ri";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isUserPending } = useAuth();

  return (
    <div className="flex-1">
      <main className={cn("h-full justify-items-center", { "place-content-center": !isUserPending }, "mx-auto max-w-4/5 dark:bg-black sm:items-start")}>
        {!isUserPending ? <RiLoader5Fill className="size-12 animate-spin" /> : children}
      </main>
    </div>
  );
}
