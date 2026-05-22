"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DeleteItem, GetItemById, ItemByIdResponse, UpdateItem } from "@/actions/itemActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<ItemByIdResponse>({
    id,
    name: "",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItem = async () => {
    try {
      const response = await GetItemById(id);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await UpdateItem(formData.id, formData.name, formData.description || "");

      if (!response) throw new Error("Failed to update item");
      toast.success("Item updated successfully!");
      router.push("/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex gap-x-2 items-center">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => router.push("/items")}>
          <ArrowLeft className="" />
        </Button>
        <h1 className="text-2xl font-bold mb-4">Edit Item</h1>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={formData.description || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" rows={4} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (confirm("Are you sure you want to delete this item?")) {
              try {
                setLoading(true);
                // Assuming you have a DeleteItem action
                await DeleteItem(formData.id);
                toast.success("Item deleted successfully!");
                router.push("/items");
              } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
              } finally {
                setLoading(false);
              }
            }
          }}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50">
          Delete Item
        </button>
      </form>
    </div>
  );
}
