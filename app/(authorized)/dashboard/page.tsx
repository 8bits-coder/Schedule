"use client";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-2">Card {item}</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <p className="text-gray-500">No data available</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Link 1</li>
              <li>• Link 2</li>
              <li>• Link 3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
