"use server";
import { auth } from "@/lib/auth";
import { Role } from "@/prisma/generated/prisma/enums";
import { headers } from "next/headers";

export async function requireAuthenticatedUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function verifyAdminAccess() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === Role.ADMIN;
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  return isAdmin;
}
