"use client";
import { useAuth } from "@/components/context/AuthContext";
import { redirect } from "next/navigation";

export default function UnauthorizedPages({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserPending } = useAuth();

  if (isUserPending) return null;

  if (!isUserPending && user) {
    return redirect("/dashboard");
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-6 flex-1 bg-stone-50">
      {children}
    </div>
  );
}
