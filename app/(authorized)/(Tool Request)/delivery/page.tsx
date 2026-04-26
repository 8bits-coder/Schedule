"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddDeliveryReceipt, GetDeliveryData } from "@/actions/deliveryActions";

interface DeliveryFormData {
  itemId: string;
  workLocationId: string;
  quantity: number;
  receivedPersonId: string;
  deliveryPersonId: string;
  deliveryDate: string;
}

export default function DeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState<{ id: string; name: string }[]>([]);
  const [workLocationId, setWorkLocationId] = useState<
    { id: string; name: string }[]
  >([]);
  const [receivedPersonId, setReceivedPersonId] = useState<
    { id: string; name: string }[]
  >([]);
  const [formData, setFormData] = useState<DeliveryFormData>({
    itemId: "",
    workLocationId: "",
    quantity: 0,
    receivedPersonId: "",
    deliveryPersonId: "",
    deliveryDate: "",
  });

  const fetchItem = async () => {
    try {
      const { users, items, workLocations } = await GetDeliveryData();
      setItemId(items);
      setWorkLocationId(workLocations);
      setReceivedPersonId(users);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };
  useEffect(() => {
    fetchItem();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AddDeliveryReceipt(new FormData(e.currentTarget));

      if (response) {
        router.push("/delivery?success=true");
      }
    } catch (error) {
      console.error("Error submitting delivery receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Delivery Receipt</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select an Item</option>
          {itemId?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          name="workLocationId"
          value={formData.workLocationId}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select a Work Location</option>
          {workLocationId?.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />

        <select
          name="receivedPersonId"
          value={formData.receivedPersonId}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select a Received Person</option>
          {receivedPersonId?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          name="deliveryPersonId"
          value={formData.deliveryPersonId}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select a Delivery Person</option>
          {receivedPersonId?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Delivery"}
        </button>
      </form>
    </div>
  );
}
