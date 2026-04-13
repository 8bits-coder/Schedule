"use client";
import { useState } from "react";

type Settings = {
  notifications: boolean;
  darkMode: boolean;
  language: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    language: "en",
  });

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      language: e.target.value,
    }));
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-6 flex-1">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <label className="text-lg font-medium">Notifications</label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() => handleToggle("notifications")}
            className="w-5 h-5"
          />
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <label className="text-lg font-medium">Dark Mode</label>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={() => handleToggle("darkMode")}
            className="w-5 h-5"
          />
        </div>

        {/* Language */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <label className="text-lg font-medium">Language</label>
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            className="px-3 py-2 border rounded"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>
    </div>
  );
}
