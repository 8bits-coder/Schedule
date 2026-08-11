"use client";
import { useState } from "react";
import { toast } from "sonner";
import { DeliveryDataResponse, SubmitDeliveryReceiptForm } from "@/actions/deliveryActions";
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
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";

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

interface ValidationErrorProps {
  errors?: Record<string, any>;
  field: string;
}

function ValidationError({ errors, field }: ValidationErrorProps) {
  if (!errors?.[field]) return null;
  return <p className="text-red-600 text-xs">{errors[field]._errors?.[0]}</p>;
}

export default function DeliveryForm({ items, workLocations, users: receivedPerson }: DeliveryDataResponse) {
  const { execute, result, isExecuting } = useAction(SubmitDeliveryReceiptForm, {
    onSettled() {
      if (result.serverError) {
        toast.error(result.serverError || "Failed to submit delivery receipt");
      }
    },
    onSuccess() {
      toast.success("Delivery receipt submitted successfully");
      setFormData(defaultFormData);
    },
    onError() {
      if (result.serverError) {
        toast.error(result.serverError || "Failed to submit delivery receipt");
      }
    },
  });

  const [formData, setFormData] = useState<typeof defaultFormData>(defaultFormData);

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
            value={formData.itemName}>
            <SelectTrigger className={cn(result.validationErrors?.itemId ? "border-red-600 bg-red-50" : "", "w-full")}>
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
          {ValidationError({ errors: result.validationErrors, field: "itemId" })}
          <Input
            type="text"
            placeholder="Serial Number"
            name="itemSerialNumber"
            value={formData.itemSerialNumber}
            onChange={handleChange}
            className={cn(result.validationErrors?.itemSerialNumber ? "border-red-600 bg-red-50" : "", "w-full")}
          />
          {ValidationError({ errors: result.validationErrors, field: "itemSerialNumber" })}
          <Select
            name="workLocationId"
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                workLocationId: value || "",
                workLocationName: workLocations.find((loc) => loc.id === value)?.name || "",
              }));
            }}
            value={formData.workLocationName}>
            <SelectTrigger
              className={cn(result.validationErrors?.workLocationId ? "border-red-600 bg-red-50" : "", "w-full")}>
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
          {ValidationError({ errors: result.validationErrors, field: "workLocationId" })}
          <Input
            type="text"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={cn(result.validationErrors?.quantity ? "border-red-600 bg-red-50" : "", "w-full")}
          />
          {ValidationError({ errors: result.validationErrors, field: "quantity" })}
          <Select
            name="receivedPersonId"
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                receivedPersonId: value || "",
                receivedPersonName: receivedPerson.find((user) => user.id === value)?.name || "",
              }));
            }}
            value={formData.receivedPersonName}>
            <SelectTrigger
              className={cn(result.validationErrors?.receivedPersonId ? "border-red-600 bg-red-50" : "", "w-full")}>
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
          {ValidationError({ errors: result.validationErrors, field: "receivedPersonId" })}
          <Input
            type="text"
            name="receivedPersonTitle"
            placeholder="Received Person Title"
            value={formData.receivedPersonTitle}
            onChange={handleChange}
            className={cn(result.validationErrors?.receivedPersonTitle ? "border-red-600 bg-red-50" : "", "w-full")}
          />
          {ValidationError({ errors: result.validationErrors, field: "receivedPersonTitle" })}
          <Input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            className={cn(result.validationErrors?.deliveryDate ? "border-red-600 bg-red-50" : "", "w-full")}
          />
          {ValidationError({ errors: result.validationErrors, field: "deliveryDate" })}
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </ContentWrapper>
  );
}
