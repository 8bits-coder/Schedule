"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { authClient } from "@/lib/auth-client";
import { AuthUser } from "@/types/session";
import { push } from "@/lib/router";
import { Role } from "@/prisma/generated/prisma/enums";

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isUserPending: boolean;
  isRequestSubmitting: boolean;
  loginError: string | null;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const user: AuthUser | null = data?.user ?? null;
  const isManager = user?.role === Role.ADMIN;
  const [isRequestSubmitting, setRequestSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => {
        setLoginError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const login = (email: string, password: string) => {
    return authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoginError(null);
          setRequestSubmitting(true);
        },
        onResponse: () => {
          setRequestSubmitting(false);
        },
        onSuccess: () => {
          push("/");
        },
        onError: (error) => {
          setLoginError(
            error?.error?.message ?? "An error occurred while logging in.",
          );
        },
      },
    );
  };

  const logout = () => {
    return authClient.signOut(
      {},
      {
        onSuccess: () => push("/"),
        onError: () => {
          console.error("An error occurred while logging out.");
        },
      },
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isUserPending: isPending,
        isRequestSubmitting,
        loginError,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
