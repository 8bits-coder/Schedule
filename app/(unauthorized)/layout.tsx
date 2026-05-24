"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { push } from "@/lib/router";
import { cn } from "@/lib/utils";
import { RiLoader5Fill } from "react-icons/ri";

export default function UnauthorizedPages({ children }: { children: React.ReactNode }) {
  const { user, isUserPending } = useAuth();

  useEffect(() => {
    if (!isUserPending && user) {
      push("/dashboard");
    }
  }, [isUserPending, user]);

  return <main className={cn({ "place-content-center": isUserPending })}>{isUserPending ? <RiLoader5Fill className="size-12 animate-spin" /> : children}</main>;
}
