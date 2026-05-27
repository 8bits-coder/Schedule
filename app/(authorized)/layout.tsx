import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-session";

export default async function AuthorizedPages({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return children;
}
