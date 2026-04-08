"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import {
  CalendarDays,
  Users,
  LogOut,
  UmbrellaIcon,
  ShieldCheck,
  Settings,
  Home,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { clearAuthCookie } from "@/lib/cookie";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isUserPending } = useAuth();

  const isManager = user?.role === "ADMIN"; // Adjust based on your user model
  const isSessionLoading = isUserPending; //(user === null && pathname !== "/login" && pathname !== "/admin/login");

  if (isSessionLoading) {
    // return <div>Loading...</div>;
    return null;
  }

  const pendingCount = 3;

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      managerOnly: false,
      badge: 0,
    },
    {
      href: "/schedule",
      label: "Schedule",
      icon: CalendarDays,
      managerOnly: false,
      badge: 0,
    },
    {
      href: "/timeoff",
      label: "Time Off",
      icon: UmbrellaIcon,
      managerOnly: false,
      badge: pendingCount > 0 ? pendingCount : 0,
    },
    {
      href: "/employees",
      label: "Employees",
      icon: Users,
      managerOnly: true,
      badge: 0,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      managerOnly: true,
      badge: 0,
    },
  ].filter((item) => !item.managerOnly || isManager); // For now, all items are visible. Adjust as needed.

  return (
    <>
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
        {/* <div className="mx-auto max-w-[1600px] px-6 flex items-center gap-1 h-14"> */}

        <nav className="max-w-4/5 mx-auto flex items-center justify-between px-6 py-4">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-8">
            <div className="size-9 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <CalendarDays className="size-5 text-white" />
            </div>
            <span className="font-bold text-stone-800 tracking-tight">
              ShiftManager
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all
                      ${
                        active
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                      }`}
                >
                  <Icon className="size-4" />
                  {label}
                  {badge ? (
                    <span className="ml-1 size-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isManager && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold mr-3">
                <ShieldCheck className="size-3.5" />
                Manager
              </div>
            )}

            <div className="flex items-center gap-2.5 mr-3">
              <div
                className={`size-8 rounded-full bg-linear-to-br ${user?.image} from-violet-500 to-pink-400 flex items-center justify-center text-white font-bold text-xs shadow-sm`}
              >
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="hidden sm:block text-right">
                <div className=" font-semibold text-stone-800 leading-tight">
                  {user?.name}
                </div>
                <div className="text-xs text-stone-400">{user?.email}</div>
              </div>
            </div>

            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                title="Sign out"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </nav>
      </header>
      {children}
      <footer className="text-center text-xs text-stone-400 py-4">
        &copy; {new Date().getFullYear()} ShiftManager. All rights reserved.
      </footer>
    </>
  );
}
