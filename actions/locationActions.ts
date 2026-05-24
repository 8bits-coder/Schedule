"use server";
import prisma from "@/lib/prisma";
import { WorkLocation } from "@/prisma/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function AddLocation(FormData: FormData): Promise<WorkLocation> {
  const name = FormData.get("name") as string;
  const description = FormData.get("description") as string;
  if (!name) {
    throw new Error("Location name is required");
  }
  const location = await prisma.workLocation.create({
    data: {
      id: crypto.randomUUID(),
      name,
    },
  });

  if (!location) {
    throw new Error("Failed to create location");
  }
  revalidatePath("/location");
  return location;
}

export async function GetAllLocations(): Promise<WorkLocation[]> {
  const locations = await prisma.workLocation.findMany();
  if (!locations) {
    throw new Error("No locations found");
  }
  return locations;
}

export async function GetLocationById(id: string): Promise<WorkLocation> {
  const location = await prisma.workLocation.findUnique({
    where: { id },
  });
  if (!location) {
    throw new Error("Location not found");
  } else {
    return location;
  }
}

export async function UpdateLocation(id: string, name: string): Promise<WorkLocation> {
  const updatedLocation = await prisma.workLocation.update({
    where: { id },
    data: { name },
  });
  if (!updatedLocation) {
    throw new Error("Failed to update location");
  }
  revalidatePath("/locations");
  return updatedLocation;
}

export async function DeleteLocation(id: string): Promise<WorkLocation> {
  const deletedLocation = await prisma.workLocation.delete({
    where: { id },
  });
  if (!deletedLocation) {
    throw new Error("Failed to delete location");
  }
  revalidatePath("/items");
  return deletedLocation;
}

export type LocationResponse = Awaited<ReturnType<typeof GetAllLocations>>;
export type LocationById = Awaited<ReturnType<typeof GetLocationById>>;
export type AddLocationResponse = Awaited<ReturnType<typeof AddLocation>>;
export type UpdateLocationResponse = Awaited<ReturnType<typeof UpdateLocation>>;
export type DeleteLocationResponse = Awaited<ReturnType<typeof DeleteLocation>>;
