"use server";
import { auth } from "@/lib/auth";
import prisma from "../lib/prisma";
import { headers } from "next/headers";

export async function AddDeliveryReceipt(formData: FormData) {
  const user = await auth.api
    .getSession({
      headers: await headers(),
    })
    .then((session) => session?.user);
  if (!user) {
    throw new Error("Unauthorized");
  }

  return prisma.deliveryReceipt.create({
    data: {
      id: crypto.randomUUID(),
      itemId: formData.get("itemId") as string,
      itemSerialNumber: formData.get("itemSerialNumber") as string,
      workLocationId: formData.get("workLocationId") as string,
      quantity: parseInt(formData.get("quantity") as string),
      receivedPersonId: formData.get("receivedPersonId") as string,
      receivedPersonTitle: formData.get("receivedPersonTitle") as string,
      deliveryPersonId: user.id,
      deliveryDate: formData.get("deliveryDate") as string,
    },
  });
}

export async function GetDeliveryData() {
  const user = await auth.api.getSession({
    headers: await headers(),
  });
  if (!user) {
    throw new Error("Unauthorized");
  }
  const [users, items, workLocations] = await Promise.all([
    prisma.user
      .findMany()
      .then((users) => users.map((user) => ({ id: user.id, name: user.name }))),
    prisma.item
      .findMany()
      .then((items) => items.map((item) => ({ id: item.id, name: item.name }))),
    prisma.workLocation
      .findMany()
      .then((locations) =>
        locations.map((loc) => ({ id: loc.id, name: loc.name })),
      ),
  ]);
  return { users, items, workLocations };
}
