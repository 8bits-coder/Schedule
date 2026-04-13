"use client";

import { useAuth } from "@/components/context/AuthContext";
import TopBar from "./header/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isUserPending } = useAuth();

  // const isSessionLoading = isUserPending; //(user === null && pathname !== "/login" && pathname !== "/admin/login");

  if (isUserPending) {
    // return <div>Loading...</div>;
    return null;
  }

  return (
    <>
      <TopBar />
      {children}
      <footer className="text-center text-xs text-stone-400 py-4">
        &copy; {new Date().getFullYear()} ShiftManager. All rights reserved.
      </footer>
    </>
  );
}
