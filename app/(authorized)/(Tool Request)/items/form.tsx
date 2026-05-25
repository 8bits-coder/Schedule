"use client";
import { AddItem } from "@/actions/itemActions";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ItemForm = () => {
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    AddItem(formData)
      .then(() => {
        toast.success("Item added successfully!");
        setShowForm(false);
      })
      .catch((error) => {
        toast.error("Error adding item: " + error.message);
      });
  }
  return (
    <div>
      <button
        title={cn(showForm ? "Close Form" : "Add New Item")}
        onClick={() => setShowForm(!showForm)}
        className={cn("px-4 py-2 bg-indigo-600 text-white rounded-full", showForm ? "hover:bg-rose-600" : "hover:bg-lime-600")}>
        <Plus className={cn(showForm && "rotate-45", "transition duration-500")} />
      </button>

      {showForm && (
        <form className="mt-6 p-6 border rounded bg-gray-50" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <input type="text" name="name" className="w-full px-3 py-2 border rounded" placeholder="Enter item name" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Item Description</label>
            <input type="text" name="description" className="w-full px-3 py-2 border rounded" placeholder="Enter item description" />
          </div>

          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Add Item
          </button>
        </form>
      )}
    </div>
  );
};

export default ItemForm;
