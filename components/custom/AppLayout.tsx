"use client";

import { useAuth } from "@/components/context/AuthContext";
import TopBar from "./header/TopBar";
import BodyWrapper from "./BodyWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isUserPending } = useAuth();

  if (isUserPending) {
    return null;
  }

  return (
    <>
      <TopBar />
      <BodyWrapper>{children}</BodyWrapper>
      <footer className="text-center text-xs text-stone-400 py-4">&copy; {new Date().getFullYear()} ShiftManager. All rights reserved.</footer>
    </>
  );
}
