import { DeliveryReceipt } from "@/prisma/generated/prisma/browser";
import * as delivery from "./deliveryActions";
import * as item from "./itemActions";
import * as location from "./locationActions";
import { adminUpdateTimeOffRequestById } from "./timeOffActions";

//1. Define a type-safe registry of your allowed universal functions
const functionRegistry = {
  addDeliveryReceipt: (args: {
    formData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any };
  }) => {
    return delivery.SubmitReceipt(args.formData);
  },
  getDeliveryData: (args: Record<string, never>) => {
    return delivery.Create();
  },
  getDeliveryReceipts: (args: Record<string, never>) => {
    return delivery.GetAll();
  },
  addItem: (args: { formData: FormData }) => {
    return item.Create(args.formData);
  },
  getAllItems: (args: Record<string, never>) => {
    return item.FetchAllItems();
  },
  getItemById: (args: { id: string }) => {
    return item.GetById(args.id);
  },
  updateItem: (args: { id: string; name: string; description: string }) => {
    return item.Update(args.id, args.name, args.description);
  },
  deleteItem: (args: { id: string }) => {
    return item.Delete(args.id);
  },
  addLocation: (args: { formData: FormData }) => {
    return location.Create(args.formData);
  },
  getAllLocations: (args: Record<string, never>) => {
    return location.GetAll();
  },
  getLocationById: (args: { id: string }) => {
    return location.GetById(args.id);
  },
  updateLocation: (args: { id: string; name: string }) => {
    return location.Update(args.id, args.name);
  },
  deleteLocation: (args: { id: string }) => {
    return location.Delete(args.id);
  },
  adminUpdateTimeOffRequestById: (args: { id: string; formData: any }) => {
    return adminUpdateTimeOffRequestById(args.id, args.formData);
  },
} as const;

// 2. The Universal Executor Wrapper
export async function executeTask<T extends FunctionName>(
  functionName: T,
  payload: Parameters<FunctionRegistry[T]>[0] | undefined = undefined,
): Promise<{ success: boolean; data: FunctionResult<T>; error: string | null }> {
  try {
    // Check if the requested function exists in our environment-agnostic registry
    const targetFunction = functionRegistry[functionName];

    if (!targetFunction) {
      return {
        success: false,
        data: null as any,
        error: `Function "${functionName}" was not found in the universal registry.`,
      };
    }

    // Execute the function (handles both synchronous and async/Promise return values)
    const result = await targetFunction(payload as any);

    return {
      success: true,
      data: result as FunctionResult<T>,
      error: null,
    };
  } catch (error: any) {
    // Centralized error handling across Server and Client
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return {
      success: false,
      data: null as any,
      error: errorMessage,
    };
  }
}

//TODO: Implement additional utility functions as needed
type TaskResult<T> = { success: true; data: T } | { success: false; error: string };

export async function Task<T, A extends unknown[]>(
  task: Promise<T> | ((...args: A) => Promise<T>),
  ...args: A
): Promise<TaskResult<T>> {
  try {
    const data = await (typeof task === "function" ? task(...args) : task);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unknown error occurred",
    };
  }
}

export async function executeTaskFn<T>(
  task: (...args: any[]) => Promise<T>,
  payload?: Record<string, unknown>,
): Promise<TaskResult<T>> {
  return Task(task, ...(payload ? Object.values(payload) : []));
}

type FunctionRegistry = typeof functionRegistry;
export type FunctionName = keyof FunctionRegistry;
export type FunctionResult<T extends FunctionName> = Awaited<ReturnType<FunctionRegistry[T]>>;
