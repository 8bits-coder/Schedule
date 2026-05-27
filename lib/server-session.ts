import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export const getServerUser = cache(async () => {
  const session = await getServerSession();
  return session?.user ?? null;
});
