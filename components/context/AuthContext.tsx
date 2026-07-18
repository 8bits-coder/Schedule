"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getRouter } from "@/lib/router";

interface AuthContextValue {
  login: (email: string, password: string) => void;
  logout: () => void;
  isRequestSubmitting: boolean;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = getRouter();
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
          // router.push("/");
          router.refresh();
        },
        onError: (error) => {
          setLoginError(error?.error?.message ?? "An error occurred while logging in.");
        },
      },
    );
  };

  const logout = () => {
    return authClient.signOut(
      {},
      {
        // onSuccess: () => router.push("/"),
        onSuccess: () => router.refresh(),
        onError: () => {
          console.error("An error occurred while logging out.");
        },
      },
    );
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isRequestSubmitting,
        loginError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
