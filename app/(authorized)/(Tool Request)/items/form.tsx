"use client";
import { createFormSubmitHandler } from "../_components/createFormSubmitHandler";
import { Create } from "@/actions/itemActions";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

const ItemForm = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = createFormSubmitHandler({
    action: Create,
    successMessage: "Item added successfully!",
    errorPrefix: "Error adding item: ",
    onSuccess: () => setShowForm(false),
  });
  return (
    <div className="max-w-max bg-gray-200 border border-gray-300 drop-shadow-lg rounded-xl p-4">
      <button
        title={cn(showForm ? "Close Form" : "Add New Item")}
        onClick={() => setShowForm(!showForm)}
        className={cn(
          "px-4 py-2 bg-indigo-600 text-white rounded-lg  outline-none ring-2 ring-indigo-500 ring-offset-2 transition duration-300 ease-in-out",
          showForm ? "hover:bg-rose-600 hover:ring-rose-500" : "hover:bg-indigo-700 hover:ring-indigo-600",
        )}>
        <Plus className={cn(showForm && "rotate-45", "transition duration-500")} />
      </button>

      {showForm && (
        <div className={cn("max-w-md p-6 rounded-xl mt-4", showForm && "border bg-white shadow-md")}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Item Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Item Description</label>
              <input
                type="text"
                name="description"
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter item description"
              />
            </div>

            <button type="submit" className="mt-4 w-full px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700">
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ItemForm;
