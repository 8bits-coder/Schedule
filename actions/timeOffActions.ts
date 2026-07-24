"use server";

import prisma from "@/lib/prisma";
import { TimeOffStatus, TimeOffType } from "@/prisma/generated/prisma/enums";
import { requireAuthenticatedUserId, verifyAdminAccess } from "./user";
import { revalidatePath } from "next/cache";
import { TimeOffRequest } from "@/prisma/generated/prisma/browser";
import { actionClient } from "@/lib/safe-action";
import { Links } from "@/utility/classes/Links";
import {
  timeOffRequestByIdSchema,
  timeOffSubmissionSchema,
  updateTimeOffRequestSchema,
} from "@/utility/schema/timeOffRequestSchema";

export const submitTimeOffRequestAction = actionClient
  .inputSchema(timeOffSubmissionSchema)
  .action(async ({ parsedInput }) => {
    // All fields are validated before this code runs
    const user = await requireAuthenticatedUserId();
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
  return revalidatePath(Links.TimeOffRequest);
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

export const adminGetTimeOffRequestById = actionClient
  .inputSchema(timeOffRequestByIdSchema)
  .action(async ({ parsedInput: { requestId } }) => {
    await verifyAdminAccess();
    const result = await prisma.timeOffRequest.findUnique({
      where: {
        id: requestId,
      },
    });
    return {
      type: result?.type as TimeOffType,
      startDate: result?.startDate.toISOString() || "",
      endDate: result?.endDate.toISOString() || "",
      hours: result?.hours.toString() || "",
      reason: result?.reason || "",
      status: result?.status as TimeOffStatus,
      reviewNote: result?.reviewNote || "",
      reviewedBy: result?.reviewedBy || "",
    };
  });

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
  revalidatePath(Links.TimeOffRequest);
  return true;
}

//! Admin functions
export const adminUpdateTimeOffRequestById = actionClient
  .inputSchema(updateTimeOffRequestSchema)
  .action(async ({ parsedInput: { requestId, formData } }) => {
    await verifyAdminAccess();
    const user = await requireAuthenticatedUserId();
    await prisma.timeOffRequest.updateMany({
      where: {
        id: requestId,
      },
      data: {
        type: formData.type.toLocaleUpperCase() as TimeOffType,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        hours: Number(formData.hours),
        reason: formData.reason,
        reviewedAt: new Date(),
        status: formData.status?.toLocaleUpperCase() as TimeOffStatus,
        reviewNote: formData.reviewNote,
        reviewedBy: user,
      },
    });
    return true;
  });
// export async function adminUpdateTimeOffRequestById(requestId: string, formData: TimeOffRequest) {
//   const { type, startDate, endDate, hours, reason, status, reviewNote } = formData;
//   await verifyAdminAccess();
//   const user = await requireAuthenticatedUserId();

//   await prisma.timeOffRequest.updateMany({
//     where: {
//       id: requestId,
//     },
//     data: {
//       type: type.toLocaleUpperCase() as TimeOffType,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       hours: Number(hours),
//       reason,
//       reviewedAt: new Date(),
//       status: status?.toLocaleUpperCase() as TimeOffStatus,
//       reviewNote,
//       reviewedBy: user,
//     },
//   });
//   revalidatePath(Links.TimeOffRequest);
//   return true;
// }

export const getAllTimeOffRequests = actionClient.action(async () => {
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
});
