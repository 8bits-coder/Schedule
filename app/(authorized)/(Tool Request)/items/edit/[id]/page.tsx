"use client";
import { Delete, ItemByIdResponse, Update } from "@/actions/itemActions";
import EditEntityPage from "../../../_components/EditEntityPage";

export default function EditItemPage() {
  return (
    <EditEntityPage<ItemByIdResponse>
      title="Edit Item"
      redirectPath="/items"
      saveSuccessMessage="Item updated successfully!"
      deleteSuccessMessage="Item deleted successfully!"
      deleteConfirmationMessage="Are you sure you want to delete this item?"
      loadEntity={{ functionName: "getItemById" }}
      saveEntity={{ functionName: "updateItem" }}
      deleteEntity={{ name: "deleteItem" }}
      renderFields={({ formData, handleChange }) => (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>
        </>
      )}
    />
  );
}
