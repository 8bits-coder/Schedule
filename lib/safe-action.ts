import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  // defaultValidationErrorsShape: "flattened",
  handleServerError(e) {
    // This runs when any action throws an unexpected error
    // What you return here becomes result.serverError on the client
    // Default: "Something went wrong"
    return e.message;
  },
});
