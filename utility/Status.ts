import { TimeOffStatus } from "@/prisma/generated/prisma/enums";

export const statusStyles: Record<TimeOffStatus, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};
