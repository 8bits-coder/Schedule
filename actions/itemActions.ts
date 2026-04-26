"use server";
import prisma from "@/lib/prisma";

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
  return true;
}

export async function GetAllItems() {
  const items = await prisma.item.findMany();
  if (!items) {
    throw new Error("No items found");
  }
  return items;
}
