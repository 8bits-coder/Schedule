"use server";
import prisma from "../lib/prisma";
import { DeliveryReceipt } from "@/prisma/generated/prisma/client";
import { requireAuthenticatedUserId } from "./user";

export async function SubmitReceipt(
  formData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any },
) {
  const userId = await requireAuthenticatedUserId();

  return prisma.deliveryReceipt.create({
    data: {
      id: crypto.randomUUID(),
      itemId: formData.itemId,
      itemSerialNumber: formData.itemSerialNumber,
      workLocationId: formData.workLocationId,
      quantity: formData.quantity,
      receivedPersonId: formData.receivedPersonId,
      receivedPersonTitle: formData.receivedPersonTitle,
      deliveryPersonId: userId,
      deliveryDate: formData.deliveryDate,
    },
  });
}

const BASE_SELECT = {
  id: true,
  name: true,
} as const;

export async function LoadEntities() {
  await requireAuthenticatedUserId();

  const [users, items, workLocations] = await Promise.all([
    prisma.user.findMany({ select: BASE_SELECT, orderBy: { name: "asc" } }),
    prisma.item.findMany({ select: BASE_SELECT, orderBy: { name: "asc" } }),
    prisma.workLocation.findMany({ select: BASE_SELECT, orderBy: { name: "asc" } }),
  ]);

  return { users, items, workLocations };
}

export type DeliveryDataResponse = Awaited<ReturnType<typeof LoadEntities>>;

export async function LoadReceipts() {
  const userId = await requireAuthenticatedUserId();

  return prisma.deliveryReceipt.findMany({
    where: {
      deliveryPersonId: userId,
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

export type DeliveryReceiptType = Awaited<ReturnType<typeof LoadReceipts>>[number];
