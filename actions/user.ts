"use server";
import { getServerSession } from "@/lib/server-session";
import { Role } from "@/prisma/generated/prisma/enums";

export async function requireAuthenticatedUserId() {
  const session = await getServerSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function verifyAdminAccess() {
  const session = await getServerSession();
  const isAdmin = session?.user?.role === Role.ADMIN;
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  return isAdmin;
}
