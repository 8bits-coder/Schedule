"use client";
import { AddLocation } from "@/actions/locationActions";
import { useState } from "react";
import { toast } from "sonner";

const LocationForm = () => {
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    AddLocation(formData)
      .then(() => {
        toast.success("Location added successfully!");
        setShowForm(false);
      })
      .catch((error) => {
        toast.error("Error adding location: " + error.message);
      });
  }
  return (
    <div className="p-8">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {showForm ? "Cancel" : "Add New Location"}
      </button>

      {showForm && (
        <form
          className="mt-6 p-6 border rounded bg-gray-50"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Location Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter item name"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Item
          </button>
        </form>
      )}
    </div>
  );
};

export default LocationForm;
