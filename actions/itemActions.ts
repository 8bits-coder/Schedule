"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuthenticatedUserId } from "./user";

export async function Create(FormData: FormData) {
  await requireAuthenticatedUserId();
  const name = FormData.get("name") as string;
  const description = FormData.get("description") as string;
  if (!name) {
    throw new Error("Item name is required");
  }
  const item = await prisma.item.create({
    data: {
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

export async function GetAll() {
  await requireAuthenticatedUserId();

  return prisma.item.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function GetById(id: string) {
  await requireAuthenticatedUserId();
  const item = await prisma.item.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  if (!item) {
    throw new Error("Item not found");
  } else {
    return item;
  }
}

export async function Update(id: string, name: string, description: string) {
  await requireAuthenticatedUserId();
  const updatedItem = await prisma.item.update({
    where: { id },
    data: { name, description },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  if (!updatedItem) {
    throw new Error("Failed to update item");
  }
  revalidatePath("/items");
  return updatedItem;
}

export async function Delete(id: string) {
  await requireAuthenticatedUserId();
  const deletedItem = await prisma.item.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  if (!deletedItem) {
    throw new Error("Failed to delete item");
  }
  revalidatePath("/items");
  return true;
}

export type ItemResponse = Awaited<ReturnType<typeof GetAll>>;
export type ItemByIdResponse = Awaited<ReturnType<typeof GetById>>;
export type AddItemResponse = Awaited<ReturnType<typeof Create>>;
export type UpdateItemResponse = Awaited<ReturnType<typeof Update>>;
export type DeleteItemResponse = Awaited<ReturnType<typeof Delete>>;
