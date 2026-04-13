import { authClient } from "@/lib/auth-client";

type SessionData = ReturnType<typeof authClient.useSession>["data"];
type AuthUser = NonNullable<SessionData>["user"];

export type { SessionData, AuthUser };
