"use client";

import { useState } from "react";
import type { ComponentType, ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, CalendarDays, LucideProps } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  href: string;
  label: string;
  //   icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  badge: number;
};

export type TopBarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

export default function TopBarClient({
  user,
  navItems,
  isManager,
}: {
  user: TopBarUser | null;
  navItems: NavItem[];
  isManager: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    await authClient.signOut(
      {},
      {
        onRequest: () => setIsSigningOut(true),
        onResponse: () => setIsSigningOut(false),
        onSuccess: () => {
          setIsDropdownOpen(false);
          router.push("/login");
          router.refresh();
        },
        onError: () => {
          setIsSigningOut(false);
          console.error("An error occurred while logging out.");
        },
      },
    );
  };

  return (
    <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto not-sm:px-2 flex items-center justify-between py-4">
        <div className="flex items-center gap-2 mr-8">
          <div className="size-10 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            <CalendarDays className="size-6 text-white" />
          </div>
          <span className="font-semibold text-stone-800">ShiftManager</span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map(
            ({
              href,
              label,
              //   icon: Icon,
              badge,
            }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`w-max relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all
                      ${active ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"}`}>
                  {/* <Icon className="size-5" /> */}
                  {label}
                  {badge ? (
                    <span className="ml-1 size-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            },
          )}
        </div>

        <div className="flex items-center gap-2">
          {isManager && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm">
              Manager
            </div>
          )}

          {user ? (
            <div className="relative">
              <div className="flex items-center gap-2.5 mr-3">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 hover:opacity-75 rounded-full overflow-hidden size-10 hover:cursor-pointer">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="object-cover size-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-linear-150 from-violet-500 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </button>

                <div className="hidden sm:block text-right">
                  <div className="font-semibold text-stone-800">{user.name}</div>
                  <div className="text-xs text-stone-400">{user.email}</div>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-8/12 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden p-1">
                  <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <Separator className="my-1" />
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center w-full gap-1.5 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all disabled:opacity-60"
                    title="Sign out">
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">{isSigningOut ? "Signing out..." : "Sign out"}</span>
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
