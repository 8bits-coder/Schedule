"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { push } from "@/lib/router";
import { cn } from "@/lib/utils";
import { RiLoader5Fill } from "react-icons/ri";

export default function AuthorizedPages({ children }: { children: React.ReactNode }) {
  const { user, isUserPending } = useAuth();

  useEffect(() => {
    if (!isUserPending && !user) {
      push("/login");
    }
  }, [isUserPending, user]);

  return <div className={cn({ "place-content-center": isUserPending })}>{isUserPending ? <RiLoader5Fill className="size-12 animate-spin" /> : children}</div>;
}
