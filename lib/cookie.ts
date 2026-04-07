"use server";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { cookies } from "next/headers";
import prisma from "./prisma";
const COOKIE_KEY = Buffer.from(
  process.env.COOKIE_SECRET || "01234567890123456789012345678901",
  "utf8",
); // 32 bytes

export const encryptCookie = async (value: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", COOKIE_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
};

export const decryptCookie = async (token: string) => {
  const [ivB64, tagB64, dataB64] = token.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Invalid cookie value");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", COOKIE_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
};

export async function clearAuthCookie() {
  // This function can be used to clear the cookie on logout
  // It should be called from a server action or API route
  (await cookies()).set("auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: -1, // Expire immediately
  });
}

// export async function getSessionEmployee() {
//   const raw = (await cookies()).get("auth_token")?.value;
//   if (raw) {
//     const pass = await decryptCookie(raw);
//     const user = await prisma.employee.findUnique({
//       where: { passnumber: pass },
//     });
//     if (!user) {
//       throw new Error("Session invalid");
//     }
//     return user;
//   }
//   return null;
// }
