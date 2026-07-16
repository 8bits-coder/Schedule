"use server";
import prisma from "@/lib/prisma";
import { Prisma, WorkLocation } from "@/prisma/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuthenticatedUserId } from "./user";

const LOCATION_LIST_PATH = "/locations";
const LOCATION_NAME_MAX_LENGTH = 120;
const LOCATION_NAME_MIN_LENGTH = 5;

function normalizeRequiredString(value: FormDataEntryValue | string | null, fieldName: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }

  return normalized;
}

function validateLocationId(id: string): string {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error("Location id is required");
  }
  return normalizedId;
}

function validateLocationName(name: string): string {
  const normalizedName = normalizeRequiredString(name, "Location name");

  if (normalizedName.length > LOCATION_NAME_MAX_LENGTH) {
    throw new Error(`Location name must be ${LOCATION_NAME_MAX_LENGTH} characters or fewer`);
  }

  if (normalizedName.length < LOCATION_NAME_MIN_LENGTH) {
    throw new Error(`Location name must be at least ${LOCATION_NAME_MIN_LENGTH} character`);
  }

  return normalizedName;
}

function getPrismaErrorMessage(error: unknown, operation: "create" | "update" | "delete"): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A location with this name already exists";
    }

    if (error.code === "P2025") {
      return operation === "delete" ? "Location not found or already deleted" : "Location not found";
    }
  }

  return error instanceof Error ? error.message : `Failed to ${operation} location`;
}

export async function Create(FormData: FormData): Promise<WorkLocation> {
  await requireAuthenticatedUserId();

  const name = validateLocationName(normalizeRequiredString(FormData.get("name"), "Location name"));

  try {
    const location = await prisma.workLocation.create({
      data: {
        id: crypto.randomUUID(),
        name,
      },
    });

    revalidatePath(LOCATION_LIST_PATH);
    return location;
  } catch (error) {
    throw new Error(getPrismaErrorMessage(error, "create"));
  }
}

export async function GetAll(): Promise<WorkLocation[]> {
  await requireAuthenticatedUserId();

  return prisma.workLocation.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function GetById(id: string): Promise<WorkLocation> {
  await requireAuthenticatedUserId();

  const locationId = validateLocationId(id);

  const location = await prisma.workLocation.findUnique({
    where: { id: locationId },
  });
  if (!location) {
    throw new Error("Location not found");
  }

  return location;
}

export async function Update(id: string, name: string): Promise<WorkLocation> {
  await requireAuthenticatedUserId();

  const locationId = validateLocationId(id);
  const locationName = validateLocationName(name);

  try {
    const updatedLocation = await prisma.workLocation.update({
      where: { id: locationId },
      data: { name: locationName },
    });

    revalidatePath(LOCATION_LIST_PATH);
    return updatedLocation;
  } catch (error) {
    throw new Error(getPrismaErrorMessage(error, "update"));
  }
}

export async function Delete(id: string): Promise<WorkLocation> {
  await requireAuthenticatedUserId();

  const locationId = validateLocationId(id);

  try {
    const deletedLocation = await prisma.workLocation.delete({
      where: { id: locationId },
    });

    revalidatePath(LOCATION_LIST_PATH);
    return deletedLocation;
  } catch (error) {
    throw new Error(getPrismaErrorMessage(error, "delete"));
  }
}

export type LocationResponse = Awaited<ReturnType<typeof GetAll>>;
export type LocationById = Awaited<ReturnType<typeof GetById>>;
export type AddLocationResponse = Awaited<ReturnType<typeof Create>>;
export type UpdateLocationResponse = Awaited<ReturnType<typeof Update>>;
export type DeleteLocationResponse = Awaited<ReturnType<typeof Delete>>;
