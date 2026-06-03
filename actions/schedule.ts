"use server";
import prisma from "@/lib/prisma";
import { ShiftType } from "@/prisma/generated/prisma/enums";
import { ShiftEntry } from "@/types/shift";

export async function updateSchedule(shiftEntry: ShiftEntry) {
  // return console.log({ shiftEntry });
  const data = await prisma.shift.upsert({
    where: {
      userId_shiftDate: {
        userId: shiftEntry.userId,
        shiftDate: new Date(shiftEntry.shiftDate),
      },
    },
    create: {
      // ...shiftEntry,
      userId: shiftEntry.userId,
      shiftDate: new Date(shiftEntry.shiftDate),
      shiftType: shiftEntry.shiftType as ShiftType,
      startTime: shiftEntry.startTime,
      endTime: shiftEntry.endTime,
      locationId: shiftEntry.locationId || null,
      notes: shiftEntry.notes,
    },
    update: {
      // ...shiftEntry,
      shiftType: shiftEntry.shiftType as ShiftType,
      startTime: shiftEntry.startTime,
      endTime: shiftEntry.endTime,
      locationId: shiftEntry.locationId || null,
      notes: shiftEntry.notes,
    },
  });
  if (!data) {
    throw new Error("Failed to update schedule");
  }
  return true;
}

export async function deleteSchedule(empId: string, dateStr: string) {
  await prisma.shift.delete({
    where: {
      userId_shiftDate: {
        userId: empId,
        shiftDate: new Date(dateStr),
      },
    },
  });
}

export async function getSchedule() {
  const [employees, shifts, locations] = await Promise.all([
    prisma.user.findMany({
      include: {
        jobDetails: true,
      },
      omit: { createdAt: true, updatedAt: true },
    }),
    prisma.shift.findMany({
      include: {
        location: true,
      },
      omit: { createdAt: true, updatedAt: true, locationId: true },
    }),
    prisma.workLocation.findMany(),
  ]);
  return { employees, shifts, locations };
}

export type Employee = Awaited<ReturnType<typeof getSchedule>>["employees"][number];
export type Shift = Awaited<ReturnType<typeof getSchedule>>["shifts"][number];
export type WorkLocation = Awaited<ReturnType<typeof getSchedule>>["locations"][number];
