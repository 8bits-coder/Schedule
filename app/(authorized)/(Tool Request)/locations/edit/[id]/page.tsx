"use client";
import { Delete, LocationById, Update } from "@/actions/locationActions";
import EditEntityPage from "../../../_components/EditEntityPage";

export default function EditLocationPage() {
  return (
    <EditEntityPage<LocationById>
      title="Edit Location"
      redirectPath="/locations"
      saveSuccessMessage="Location updated successfully!"
      deleteSuccessMessage="Location deleted successfully!"
      deleteConfirmationMessage="Are you sure you want to delete this location?"
      loadEntity={{ functionName: "getLocationById" }}
      saveEntity={{ functionName: "updateLocation" }}
      deleteEntity={{ name: "deleteLocation" }}
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
        </>
      )}
    />
  );
}
