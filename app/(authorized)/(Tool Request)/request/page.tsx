"use client";

import Link from "next/link";

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Tool Request</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/delivery">
            <button className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105">
              Delivery
            </button>
          </Link>

          <Link href="/items">
            <button className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105">
              Items
            </button>
          </Link>

          <Link href="/locations">
            <button className="w-full px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105">
              Locations
            </button>
          </Link>

          <Link href="/receipts">
            <button className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105">
              Receipts
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
