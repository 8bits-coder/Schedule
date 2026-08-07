"use server";
import prisma from "../lib/prisma";
import { DeliveryReceipt } from "@/prisma/generated/prisma/client";
import { requireAuthenticatedUserId } from "./user";
import { actionClient } from "@/lib/safe-action";
import { zfd } from "zod-form-data";
import z from "zod";

const deliveryReceiptFormSchema = zfd.formData({
  itemId: zfd.text(
    z
      .string({
        message: "Item ID is required",
      })
      .min(1, { message: "Item ID is required" }),
  ),
  itemSerialNumber: zfd.text(
    z
      .string({
        message: "Serial number is required",
      })
      .min(1, { message: "Serial number is required" }),
  ),
  workLocationId: zfd.text(
    z.uuid({
      message: "Choose a valid work location",
    }),
  ),
  quantity: zfd.text(z.number({ message: "Quantity is required" }).min(1, { message: "Quantity must be at least 1" })),
  receivedPersonId: zfd.text(
    z
      .string({
        message: "Received person ID is required",
      })
      .length(32, {
        message: "Received person ID must be a valid UUID",
      }),
  ),
  receivedPersonTitle: zfd.text(
    z
      .string({
        message: "Received person title is required",
      })
      .min(1, { message: "Received person title is required" }),
  ),
  deliveryDate: zfd.text(
    z
      .string({
        message: "Delivery date is required",
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Delivery date must be in YYYY-MM-DD format" }),
  ),
});

export const SubmitDeliveryReceiptForm = actionClient
  .inputSchema(deliveryReceiptFormSchema)
  .useValidated(async ({ next }) => {
    const userId = await requireAuthenticatedUserId();
    return next({ ctx: { userId } });
  })
  .action(async ({ parsedInput, ctx }) => {
    // throw new Error("SubmitDeliveryReceiptForm not implemented");
    const result = await prisma.deliveryReceipt.create({
      data: {
        itemId: parsedInput.itemId,
        itemSerialNumber: parsedInput.itemSerialNumber,
        workLocationId: parsedInput.workLocationId,
        quantity: parsedInput.quantity,
        receivedPersonId: parsedInput.receivedPersonId,
        receivedPersonTitle: parsedInput.receivedPersonTitle,
        deliveryPersonId: ctx.userId,
        deliveryDate: parsedInput.deliveryDate,
      },
    });

    if (!result.id) {
      throw new Error("Failed to submit delivery receipt");
    }
    return { ok: true };
  });

export async function SubmitReceipt(
  formData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any },
) {
  const userId = await requireAuthenticatedUserId();

  return prisma.deliveryReceipt.create({
    data: {
      itemId: formData.itemId,
      itemSerialNumber: formData.itemSerialNumber,
      workLocationId: formData.workLocationId,
      quantity: formData.quantity,
      receivedPersonId: formData.receivedPersonId,
      receivedPersonTitle: formData.receivedPersonTitle,
      deliveryPersonId: userId,
      deliveryDate: formData.deliveryDate,
    },
  });
}

const BASE_SELECT = {
  id: true,
  name: true,
} as const;

export async function RetrieveDeliveryEntities() {
  await requireAuthenticatedUserId();

  const [users, items, workLocations] = await Promise.all([
    prisma.user.findMany({ select: BASE_SELECT, orderBy: { name: "asc" } }),
    prisma.item.findMany({ select: BASE_SELECT, orderBy: { name: "asc" } }),
    prisma.workLocation.findMany({ select: BASE_SELECT, orderBy: { name: "asc" } }),
  ]);

  return { users, items, workLocations };
}

export type DeliveryDataResponse = Awaited<ReturnType<typeof RetrieveDeliveryEntities>>;

export const FetchAllDeliveryReceipts = actionClient.action(async () => {
  // throw new Error("FetchAllDeliveryReceipts not implemented");
  // All fields are validated before this code runs
  const userId = await requireAuthenticatedUserId();

  return prisma.deliveryReceipt.findMany({
    where: {
      deliveryPersonId: userId,
    },
    include: {
      item: {
        select: {
          name: true,
        },
      },
      receivedPerson: {
        select: {
          name: true,
        },
      },
      workLocation: {
        select: {
          name: true,
        },
      },
    },
  });
});
export type DeliveryReceiptTypeData = Awaited<ReturnType<typeof FetchAllDeliveryReceipts>>["data"];
// export async function GetAll() {
//   const userId = await requireAuthenticatedUserId();

//   return prisma.deliveryReceipt.findMany({
//     where: {
//       deliveryPersonId: userId,
//     },
//     include: {
//       item: {
//         select: {
//           name: true,
//         },
//       },
//       receivedPerson: {
//         select: {
//           name: true,
//         },
//       },
//       workLocation: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });
// }

// export type DeliveryReceiptType = Awaited<ReturnType<typeof GetAll>>[number];
