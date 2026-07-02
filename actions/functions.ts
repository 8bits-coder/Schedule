import { DeliveryReceipt } from "@/prisma/generated/prisma/browser";
import * as delivery from "./deliveryActions";

// 1. Define a type-safe registry of your allowed universal functions
const functionRegistry: Record<string, (args: any) => any> = {
  addDeliveryReceipt: (formData: Omit<DeliveryReceipt, "id" | "createdAt" | "updatedAt"> & { [key: string]: any }) => {
    return delivery.SubmitReceipt(formData);
  },
  getDeliveryData: () => {
    return delivery.LoadEntities();
  },
  getDeliveryReceipts: () => {
    return delivery.LoadReceipts();
  },
};

// 2. The Universal Executor Wrapper
export async function executeTask<T = any>(
  functionName: string,
  payload: Record<string, any>,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  try {
    // Check if the requested function exists in our environment-agnostic registry
    const targetFunction = functionRegistry[functionName];

    if (!targetFunction) {
      throw new Error(`Function "${functionName}" was not found in the universal registry.`);
    }

    // Execute the function (handles both synchronous and async/Promise return values)
    const result = await targetFunction(payload);

    return {
      success: true,
      data: result,
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
      data: null,
      error: errorMessage,
    };
  }
}
