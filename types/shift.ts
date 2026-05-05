import prisma from "@/lib/prisma";

type ShiftData = Awaited<ReturnType<typeof prisma.shift.findMany>>;

type ShiftEntry = Omit<ShiftData[number], "id" | "createdAt" | "updatedAt"> & {
  shiftType: string | null;
  locationName: string | null;
};

type shiftType = ShiftEntry["shiftType"];

export type { ShiftEntry, shiftType };
