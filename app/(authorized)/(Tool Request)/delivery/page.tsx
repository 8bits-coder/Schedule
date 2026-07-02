"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeliveryDataResponse, LoadEntities } from "@/actions/deliveryActions";
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
import { DeliveryReceipt } from "@/prisma/generated/prisma/client";
import BodyWrapper from "@/components/custom_ui/BodyWrapper";
import { executeTask } from "@/actions/functions";

const defaultFormData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any } = {
  itemId: "",
  itemName: "",
  itemSerialNumber: "",
  deliveryPersonId: "",
  receivedPersonTitle: "",
  workLocationId: "",
  workLocationName: "",
  quantity: 1,
  receivedPersonId: "",
  receivedPersonName: "",
  deliveryDate: "",
};

export default function DeliveryPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DeliveryDataResponse["items"]>([]);
  const [workLocations, setWorkLocations] = useState<DeliveryDataResponse["workLocations"]>([]);
  const [receivedPerson, setReceivedPerson] = useState<DeliveryDataResponse["users"]>([]);
  const [formData, setFormData] = useState<typeof defaultFormData>(defaultFormData);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = (await executeTask<DeliveryDataResponse>("getDeliveryData", {})).data;
        if (response) {
          setItems(response.items);
          setWorkLocations(response.workLocations);
          setReceivedPerson(response.users);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
      }
    };
    fetchItem();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await executeTask("addDeliveryReceipt", formData);

      if (response) {
        setFormData(defaultFormData);
        toast.success("Delivery receipt added successfully!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BodyWrapper>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Delivery Receipt</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="itemId"
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                itemId: value || "",
                itemName: items.find((item) => item.id === value)?.name || "",
              }))
            }
            value={formData.itemName}
            required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Items</SelectLabel>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Serial Number"
            name="itemSerialNumber"
            value={formData.itemSerialNumber}
            onChange={handleChange}
            required
          />

          <Select
            name="workLocationId"
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                workLocationId: value || "",
                workLocationName: workLocations.find((loc) => loc.id === value)?.name || "",
              }));
            }}
            value={formData.workLocationName}
            required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Work Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Work Locations</SelectLabel>
                {workLocations?.map((loc) => (
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
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                receivedPersonId: value || "",
                receivedPersonName: receivedPerson.find((user) => user.id === value)?.name || "",
              }));
            }}
            value={formData.receivedPersonName}
            required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Received Person" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Received Persons</SelectLabel>
                {receivedPerson?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            type="text"
            name="receivedPersonTitle"
            placeholder="Received Person Title"
            value={formData.receivedPersonTitle}
            onChange={handleChange}
            required
          />

          <Input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </BodyWrapper>
  );
}
