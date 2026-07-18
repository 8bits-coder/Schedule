"use server";

import prisma from "@/lib/prisma";
import { TimeOffType } from "@/prisma/generated/prisma/enums";
import { requireAuthenticatedUserId, verifyAdminAccess } from "./user";
import { revalidatePath } from "next/cache";

type TimeOffRequest = {
  type: TimeOffType;
  startDate: string | Date;
  endDate: string | Date;
  hours: number;
  reason: string | null;
};

export async function submitTimeOffRequest(formData: TimeOffRequest) {
  const { type, startDate, endDate, hours, reason } = formData;

  const user = await requireAuthenticatedUserId();

  await prisma.timeOffRequest.create({
    data: {
      userId: user,
      type: type.toLocaleUpperCase() as TimeOffType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      hours,
      reason,
    },
  });

  return {
    type,
    startDate,
    endDate,
    hours,
    reason,
  };
}

export async function getTimeOffRequestsByUserId() {
  const user = await requireAuthenticatedUserId();

  return prisma.timeOffRequest.findMany({
    where: {
      userId: user,
    },
    orderBy: {
      startDate: "desc",
    },
  });
}

export async function cancelRequestByUserId(requestId: string) {
  const user = await requireAuthenticatedUserId();

  await prisma.timeOffRequest.updateMany({
    where: {
      id: requestId,
      userId: user,
    },
    data: {
      status: "CANCELLED",
    },
  });
  return revalidatePath("/timerequest");
}

export async function getTimeOffRequestById(requestId: string) {
  const user = await requireAuthenticatedUserId();
  return prisma.timeOffRequest.findFirst({
    where: {
      id: requestId,
      userId: user,
    },
    select: {
      type: true,
      startDate: true,
      endDate: true,
      hours: true,
      reason: true,
    },
  });
}

export async function updateTimeOffRequestById(requestId: string, formData: TimeOffRequest) {
  const { type, startDate, endDate, hours, reason } = formData;
  const user = await requireAuthenticatedUserId();

  await prisma.timeOffRequest.updateMany({
    where: {
      id: requestId,
      userId: user,
    },
    data: {
      type: type.toLocaleUpperCase() as TimeOffType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      hours: Number(hours),
      reason,
    },
  });
  revalidatePath("/timerequest");
  return true;
}

//! Admin functions
export async function getAllTimeOffRequests() {
  await verifyAdminAccess();

  return prisma.timeOffRequest.findMany({
    orderBy: {
      startDate: "desc",
    },
  });
}
