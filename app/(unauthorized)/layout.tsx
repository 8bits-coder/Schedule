"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { push } from "@/lib/router";

export default function UnauthorizedPages({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserPending } = useAuth();

  useEffect(() => {
    if (!isUserPending && user) {
      push("/dashboard");
    }
  }, [isUserPending, user]);

  if (isUserPending || user) return null;

  return (
    <div className="max-w-7xl w-full mx-auto p-6 flex-1 bg-stone-50">
      {children}
    </div>
  );
}
