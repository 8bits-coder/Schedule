import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-session";
import { AuthProvider } from "@/components/context/AuthContext";

export default async function UnauthorizedPages({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (user) {
    redirect("/dashboard");
  }

  return <AuthProvider>{children}</AuthProvider>;
}
