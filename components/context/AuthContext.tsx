"use client";

import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { User } from "@/prisma/generated/prisma/client";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isPending: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const user = useMemo(() => data?.user as User, [data?.user]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error(error);
        },
      },
    );
  };

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isPending, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
