"use server";
import prisma from "../lib/prisma";

export async function AddDeliveryReceipt(formData: FormData) {
  return prisma.deliveryReceipt.create({
    data: {
      id: crypto.randomUUID(),
      itemId: formData.get("itemId") as string,
      workLocationId: formData.get("workLocationId") as string,
      quantity: parseInt(formData.get("quantity") as string),
      receivedPersonId: formData.get("receivedPersonId") as string,
      deliveryPersonId: formData.get("deliveryPersonId") as string,
      deliveryDate: formData.get("deliveryDate") as string,
    },
  });
}

export async function GetDeliveryData() {
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
