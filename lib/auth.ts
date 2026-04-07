import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import prisma from "./prisma";

export const auth = betterAuth({
  appName: "Schedule App",
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 minute
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://better-auth-demo.vercel.app",
    "https://better-auth-demo.netlify.app",
  ],
  plugins: [nextCookies(), openAPI()],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
