"use client";
import { createFormSubmitHandler } from "../../_components/createFormSubmitHandler";
import { Create } from "@/actions/locationActions";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

const LocationForm = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = createFormSubmitHandler({
    action: Create,
    successMessage: "Location added successfully!",
    errorPrefix: "Error adding location: ",
    onSuccess: () => setShowForm(false),
  });
  return (
    <div>
      <button
        title={cn(showForm ? "Close Form" : "Add New Location")}
        onClick={() => setShowForm(!showForm)}
        className={cn(
          "px-4 py-2 bg-indigo-600 text-white rounded-full",
          showForm ? "hover:bg-rose-600" : "hover:bg-lime-600",
        )}>
        <Plus className={cn(showForm && "rotate-45", "transition duration-500")} />
      </button>

      {showForm && (
        <form className="mt-6 p-6 border rounded bg-gray-50" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Location Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter location name"
            />
          </div>

          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save Item
          </button>
        </form>
      )}
    </div>
  );
};

export default LocationForm;
