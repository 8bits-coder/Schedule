"use client";
import { useAuth } from "@/components/context/AuthContext";
import { cn } from "@/lib/utils";
import { RiLoader5Fill } from "react-icons/ri";
import { redirect } from "next/navigation";

export default function UnauthorizedPages({ children }: { children: React.ReactNode }) {
  const { user, isUserPending } = useAuth();

  if (isUserPending) {
    return (
      <div className={cn("h-full place-content-center grid justify-items-center")}>
        <RiLoader5Fill className="size-12 animate-spin" />
      </div>
    );
  }

  if (user) {
    redirect("/dashboard");
  }

  return children;
}
