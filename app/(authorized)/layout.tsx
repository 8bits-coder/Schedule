"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { push } from "@/lib/router";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";

export default function AuthorizedPages({ children }: { children: React.ReactNode }) {
  const { user, isUserPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserPending && !user) {
      push("/login");
    }
  }, [isUserPending, user]);

  if (isUserPending || !user) return null;

  return (
    <div className="h-full p-2 overflow-hidden pb-12">
      {window.location.href !== "/" && (
        <div className="">
          <Button onClick={() => router.back()} variant={"link"} size={"icon"} className="group">
            <ArrowLeftCircle className="size-8 group-hover:stroke-violet-800 transition-colors duration-300" />
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
