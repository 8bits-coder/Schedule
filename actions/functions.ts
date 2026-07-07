import { DeliveryReceipt } from "@/prisma/generated/prisma/browser";
import * as delivery from "./deliveryActions";
import * as item from "./itemActions";
import * as location from "./locationActions";

// 1. Define a type-safe registry of your allowed universal functions
const functionRegistry = {
  addDeliveryReceipt: (args: {
    formData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any };
  }) => {
    // console.log("Executing addDeliveryReceipt with args:", args.formData);
    // return;
    return delivery.SubmitReceipt(args.formData);
  },
  getDeliveryData: (args: Record<string, never>) => {
    return delivery.LoadEntities();
  },
  getDeliveryReceipts: (args: Record<string, never>) => {
    return delivery.LoadReceipts();
  },
  addItem: (args: { formData: FormData }) => {
    return item.AddItem(args.formData);
  },
  getAllItems: (args: Record<string, never>) => {
    return item.GetAllItems();
  },
  getItemById: (args: { id: string }) => {
    return item.GetItemById(args.id);
  },
  updateItem: (args: { id: string; name: string; description: string }) => {
    return item.UpdateItem(args.id, args.name, args.description);
  },
  deleteItem: (args: { id: string }) => {
    return item.DeleteItem(args.id);
  },
  addLocation: (args: { formData: FormData }) => {
    return location.AddLocation(args.formData);
  },
  getAllLocations: (args: Record<string, never>) => {
    return location.GetAllLocations();
  },
  getLocationById: (args: { id: string }) => {
    return location.GetLocationById(args.id);
  },
  updateLocation: (args: { id: string; name: string }) => {
    return location.UpdateLocation(args.id, args.name);
  },
  deleteLocation: (args: { id: string }) => {
    return location.DeleteLocation(args.id);
  },
} as const;

// 2. The Universal Executor Wrapper
export async function executeTask<T extends FunctionName>(
  functionName: T,
  payload: Parameters<FunctionRegistry[T]>[0],
): Promise<{ success: boolean; data: FunctionResult<T>; error: string | null }> {
  // console.log(`Executing task: ${functionName} with payload:`, payload);
  // return new Promise((resolve) => {});
  try {
    // Check if the requested function exists in our environment-agnostic registry
    const targetFunction = functionRegistry[functionName];

    if (!targetFunction) {
      throw new Error(`Function "${functionName}" was not found in the universal registry.`);
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

    // Server-side logging environment check
    if (typeof window === "undefined") {
      console.error(`[Server Error] [Task: ${functionName}]:`, error);
    } else {
      console.error(`[Client Error] [Task: ${functionName}]:`, error);
    }

    return {
      success: false,
      data: null as any,
      error: errorMessage,
    };
  }
}

type FunctionRegistry = typeof functionRegistry;
type FunctionName = keyof FunctionRegistry;
type FunctionResult<T extends FunctionName> = Awaited<ReturnType<FunctionRegistry[T]>>;
