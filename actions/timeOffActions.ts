"use server";

import prisma from "@/lib/prisma";
import { TimeOffStatus, TimeOffType } from "@/prisma/generated/prisma/enums";
import { requireAuthenticatedUserId, verifyAdminAccess } from "./user";
import { revalidatePath } from "next/cache";
import { TimeOffRequest } from "@/prisma/generated/prisma/browser";
import { z } from "zod";
import { actionClient } from "@/lib/safe-action";

type TimeOffSubmission = {
  type: TimeOffType;
  startDate: string | Date;
  endDate: string | Date;
  hours: number;
  reason: string | null;
};

const timeOffSubmissionSchema = z.object({
  type: z
    .enum(TimeOffType)
    .refine((value) => Object.values(TimeOffType).includes(value), { message: "Invalid leave type" }),
  startDate: z
    .union([z.string(), z.date()])
    .refine((date) => !isNaN(new Date(date).getTime()), { message: "Invalid start date" }),
  endDate: z
    .union([z.string(), z.date()])
    .refine((date) => !isNaN(new Date(date).getTime()), { message: "Invalid end date" }),
  hours: z
    .string()
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, { message: "Invalid number of hours" }),
  reason: z.string().nullable(),
});

export const submitTimeOffRequestAction = actionClient
  .inputSchema(timeOffSubmissionSchema)
  .action(async ({ parsedInput }) => {
    // All fields are validated before this code runs
    const user = await requireAuthenticatedUserId();
    console.log(parsedInput);
    await prisma.timeOffRequest.create({
      data: {
        userId: user,
        type: parsedInput.type.toLocaleUpperCase() as TimeOffType,
        startDate: new Date(parsedInput.startDate),
        endDate: new Date(parsedInput.endDate),
        hours: Number(parsedInput.hours),
        reason: parsedInput.reason,
      },
    });
    return {
      ...parsedInput,
    };
  });

export async function submitTimeOffRequest(formData: TimeOffSubmission) {
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
      reviewNote: true,
      status: true,
    },
  });
}
export async function adminGetTimeOffRequestById(requestId: string) {
  await verifyAdminAccess();

  return prisma.timeOffRequest.findUnique({
    where: {
      id: requestId,
    },
    // include: {
    //   user: {
    //     select: {
    //       name: true,
    //     },
    //   },
    // },
  });
}

export async function updateTimeOffRequestById(requestId: string, formData: Partial<TimeOffRequest>) {
  const { type, startDate, endDate, hours, reason } = formData;
  const user = await requireAuthenticatedUserId();

  await prisma.timeOffRequest.updateMany({
    where: {
      id: requestId,
      userId: user,
    },
    data: {
      type: type?.toLocaleUpperCase() as TimeOffType,
      startDate: new Date(startDate ?? ""),
      endDate: new Date(endDate ?? ""),
      hours: Number(hours),
      reason,
    },
  });
  revalidatePath("/timerequest");
  return true;
}

export async function adminUpdateTimeOffRequestById(requestId: string, formData: TimeOffRequest) {
  const { type, startDate, endDate, hours, reason, status, reviewNote } = formData;
  await verifyAdminAccess();
  const user = await requireAuthenticatedUserId();

  await prisma.timeOffRequest.updateMany({
    where: {
      id: requestId,
    },
    data: {
      type: type.toLocaleUpperCase() as TimeOffType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      hours: Number(hours),
      reason,
      reviewedAt: new Date(),
      status: status?.toLocaleUpperCase() as TimeOffStatus,
      reviewNote,
      reviewedBy: user,
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
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      hours: true,
      reason: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}
