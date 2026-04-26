"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function AddItem(FormData: FormData) {
  const name = FormData.get("name") as string;
  const description = FormData.get("description") as string;
  if (!name) {
    throw new Error("Item name is required");
  }
  const item = await prisma.item.create({
    data: {
      id: crypto.randomUUID(),
      name,
      description,
    },
  });

  if (!item) {
    throw new Error("Failed to create item");
  }
  revalidatePath("/items");
  return true;
}

export async function GetAllItems() {
  const items = await prisma.item.findMany();
  if (!items) {
    throw new Error("No items found");
  }
  return items;
}

export async function GetItemById(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
  });
  if (!item) {
    throw new Error("Item not found");
  } else {
    return item;
  }
}

export async function UpdateItem(
  id: string,
  name: string,
  description: string,
) {
  const updatedItem = await prisma.item.update({
    where: { id },
    data: { name, description },
  });
  if (!updatedItem) {
    throw new Error("Failed to update item");
  }
  revalidatePath("/items");
  return updatedItem;
}

export async function DeleteItem(id: string) {
  const deletedItem = await prisma.item.delete({
    where: { id },
  });
  if (!deletedItem) {
    throw new Error("Failed to delete item");
  }
  revalidatePath("/items");
  return deletedItem;
}
