"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, LogOut, UmbrellaIcon, ShieldCheck, Settings, Home } from "lucide-react";
import { usePathname } from "next/navigation";
const navItems = (pendingCount = 0) => [
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
    href: "/request",
    label: "Requests",
    icon: ShieldCheck,
    managerOnly: true,
    badge: 0,
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
];

export default function TopBar() {
  const { user, logout, isUserPending } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isManager = user?.role === "ADMIN"; // Adjust based on your user model

  const filteredNavItems = navItems().filter((item) => !item.managerOnly || isManager);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isUserPending) return;

  return (
    <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto not-sm:px-2 flex items-center justify-between py-4">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-8">
          <div className="size-10 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            <CalendarDays className="size-6 text-white" />
          </div>
          <span className="font-semibold text-stone-800">ShiftManager</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {filteredNavItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`w-max relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all
                      ${active ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"}`}>
                <Icon className="size-5" />
                {label}
                {badge ? (
                  <span className="ml-1 size-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">{badge}</span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {isManager && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm">
              {/* <ShieldCheck className="size-4" /> */}
              Manager
            </div>
          )}

          {/* User Profile Dropdown */}
          {user ? (
            <div className="relative">
              <div className="flex items-center gap-2.5 mr-3">
                <button onClick={toggleDropdown} className="flex items-center gap-2 hover:opacity-75 rounded-full overflow-hidden size-10 hover:cursor-pointer">
                  {user.image ? (
                    <Image src={user.image} alt="User Avatar" width={40} height={40} className="object-cover size-full" />
                  ) : (
                    <div className="w-10 h-10 bg-linear-150 from-violet-500 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </button>

                <div className="hidden sm:block text-right">
                  <div className="font-semibold text-stone-800">{user?.name}</div>
                  <div className="text-xs text-stone-400">{user?.email}</div>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-8/12 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden p-1">
                  <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <Separator className="my-1" />
                  <button
                    onClick={logout}
                    className="flex items-center w-full gap-1.5 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                    title="Sign out">
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
