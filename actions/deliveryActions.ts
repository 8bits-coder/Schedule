"use server";
import { auth } from "@/lib/auth";
import prisma from "../lib/prisma";
import { headers } from "next/headers";
import { DeliveryReceipt } from "@/prisma/generated/prisma/client";

export async function AddDeliveryReceipt(formData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any }) {
  const user = await auth.api
    .getSession({
      headers: await headers(),
    })
    .then((session) => session?.user);

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return prisma.deliveryReceipt.create({
    data: {
      id: crypto.randomUUID(),
      itemId: formData.itemId,
      itemSerialNumber: formData.itemSerialNumber,
      workLocationId: formData.workLocationId,
      quantity: formData.quantity,
      receivedPersonId: formData.receivedPersonId,
      receivedPersonTitle: formData.receivedPersonTitle,
      deliveryPersonId: user.id,
      deliveryDate: formData.deliveryDate,
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
    prisma.user.findMany().then((users) => users.map((user) => ({ id: user.id, name: user.name }))),
    prisma.item.findMany().then((items) => items.map((item) => ({ id: item.id, name: item.name }))),
    prisma.workLocation.findMany().then((locations) => locations.map((loc) => ({ id: loc.id, name: loc.name }))),
  ]);
  return { users, items, workLocations };
}

export async function GetDeliveryReceipts() {
  const user = await auth.api.getSession({
    headers: await headers(),
  });
  if (!user?.user?.id) {
    throw new Error("Unauthorized");
  }
  return prisma.deliveryReceipt.findMany({
    where: {
      deliveryPersonId: user.user.id,
    },
    include: {
      item: {
        select: {
          name: true,
        },
      },
      receivedPerson: {
        select: {
          name: true,
        },
      },
      workLocation: {
        select: {
          name: true,
        },
      },
    },
  });
}

export type DeliveryReceiptType = Awaited<ReturnType<typeof GetDeliveryReceipts>>[number];
