"use client";
import { useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";
import { DeliveryDataResponse, Create, SubmitDeliveryReceiptForm } from "@/actions/deliveryActions";
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
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { executeTask } from "@/actions/functions";
import { useAction } from "next-safe-action/hooks";

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
  const { execute, result, isExecuting } = useAction(SubmitDeliveryReceiptForm, {
    onError() {
      if (result.serverError) {
        toast.error(result.serverError || "Failed to submit delivery receipt");
      }
      if (result.validationErrors) {
        toast.error("Validation error: " + JSON.stringify(result.validationErrors));
      }
    },
  });
  const [items, setAllItems] = useState<DeliveryDataResponse["items"]>([]);
  const [workLocations, setAllWorkLocations] = useState<DeliveryDataResponse["workLocations"]>([]);
  const [receivedPerson, setAllReceivedPerson] = useState<DeliveryDataResponse["users"]>([]);
  const [formData, setFormData] = useState<typeof defaultFormData>(defaultFormData);

  useEffect(() => {
    const fetchItem = async () => {
      const response = await executeTask("getDeliveryData");
      if (response.error) {
        toast.error(response.error || "Failed to fetch delivery data");
        return;
      }
      if (response.success && response.data) {
        setAllItems(response.data.items);
        setAllWorkLocations(response.data.workLocations);
        setAllReceivedPerson(response.data.users);
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

    execute(formData);
  };

  return (
    <ContentWrapper>
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

          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </ContentWrapper>
  );
}
