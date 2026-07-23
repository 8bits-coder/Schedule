"use client";

import { cn } from "@/lib/utils";
import { colorClasses, NavigationItems } from "@/utility/classes/Links";
import { Button } from "@base-ui/react";
import Link from "next/link";

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Tool Request</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NavigationItems.map((page) => (
            <Link href={page.link} key={page.name}>
              <Button
                className={cn(
                  colorClasses[page.color],
                  "w-full px-6 py-4 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105",
                )}>
                {page.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
