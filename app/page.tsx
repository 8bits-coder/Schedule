"use client";
import { useAuth } from "@/components/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto py-4 space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.name || "Manager"}</h1>
        <p className="text-lg text-gray-600">Manage your team shifts efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:shadow-lg transition-shadow duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
          <p className="text-gray-700 font-medium">Active Shifts</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 hover:shadow-lg transition-shadow duration-300">
          <div className="text-3xl font-bold text-green-600 mb-2">24</div>
          <p className="text-gray-700 font-medium">Team Members</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:shadow-lg transition-shadow duration-300">
          <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
          <p className="text-gray-700 font-medium">Pending Requests</p>
        </div>
      </div>

      <div className="bg-linear-to-r from-purple-50 to-blue-50 p-8 rounded-lg border border-purple-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900">We Make</h2>
        <div className="h-12 overflow-hidden">
          <div className="animate-flip-vertical flex flex-col">
            <span className="text-3xl font-bold text-purple-600 h-12 flex items-center">work</span>
            <span className="text-3xl font-bold text-blue-600 h-12 flex items-center">lifestyle</span>
            <span className="text-3xl font-bold text-purple-600 h-12 flex items-center">everything</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">...better for everyone</h2>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in-delay">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">Shift {item}</span>
              <span className="text-sm text-gray-500">9:00 AM - 5:00 PM</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
