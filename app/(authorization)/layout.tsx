"use client";
import { useAuth } from "@/components/context/AuthContext";
import { redirect } from "next/navigation";

export default function AuthPage({ children }: { children: React.ReactNode }) {
  const { user, isUserPending } = useAuth();

  if (isUserPending) return null;

  if (!isUserPending && user) {
    return redirect("/dashboard");
  }

  return <>{children}</>;
}
