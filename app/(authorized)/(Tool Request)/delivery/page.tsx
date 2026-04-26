"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddDeliveryReceipt, GetDeliveryData } from "@/actions/deliveryActions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        setFormData({
          itemId: "",
          workLocationId: "",
          quantity: 0,
          receivedPersonId: "",
          deliveryPersonId: "",
          deliveryDate: "",
        });
        toast.success("Delivery receipt added successfully!");
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
        <Select
          name="itemId"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, itemId: value }))
          }
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an Item" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Items</SelectLabel>
              {itemId?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          name="workLocationId"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, workLocationId: value }))
          }
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Work Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Work Locations</SelectLabel>
              {workLocationId?.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="text"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <Select
          name="receivedPersonId"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, receivedPersonId: value }))
          }
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Received Person" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Received Persons</SelectLabel>
              {receivedPersonId?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          name="deliveryPersonId"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, deliveryPersonId: value }))
          }
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Delivery Person" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Delivery Persons</SelectLabel>
              {receivedPersonId?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="date"
          name="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
