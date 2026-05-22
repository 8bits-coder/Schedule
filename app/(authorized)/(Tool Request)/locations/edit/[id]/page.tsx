"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { DeleteLocation, GetLocationById, LocationById, UpdateLocation } from "@/actions/locationActions";
import { Spinner } from "@/components/ui/spinner";

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<LocationById>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItem = async () => {
    try {
      const response = await GetLocationById(id);
      setFormData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData) {
      setError("Form data is not loaded");
      setLoading(false);
      return;
    }

    try {
      const response = await UpdateLocation(formData.id, formData.name);

      if (!response) throw new Error("Failed to update item");
      toast.success("Location updated successfully!");
      router.push("/locations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex gap-x-2 items-center">
        <h1 className="text-2xl font-bold mb-4">Edit Location</h1>
      </div>

      {!formData ? (
        error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : (
          <div className=" h-full flex items-center justify-center">
            <Spinner className="size-8" />
          </div>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this item?")) {
                  try {
                    setLoading(true);
                    // Assuming you have a DeleteLocation action
                    await DeleteLocation(formData.id);
                    toast.success("Location deleted successfully!");
                    router.push("/locations");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "An error occurred");
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50">
              Delete Location
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
