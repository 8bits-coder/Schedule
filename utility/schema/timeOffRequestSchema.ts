import { z } from "zod";
import { TimeOffStatus, TimeOffType } from "@/prisma/generated/prisma/enums";

/**
 * For validating time off request submissions of an employee.
 */
export const timeOffSubmissionSchema = z
  .object({
    type: z
      .enum(TimeOffType)
      .refine((value) => Object.values(TimeOffType).includes(value), { message: "Select a leave type" }),
    startDate: z
      .string()
      .trim()
      .length(10, "Select a valid start date.")
      .refine(
        (value) => {
          if (!value) return false;
          const year = new Date(value).getFullYear();
          const currentYear = new Date().getFullYear();
          return !(year < currentYear - 1 || year > currentYear + 1);
        },
        { message: "Select a valid start year." },
      ),
    endDate: z
      .string()
      .trim()
      .length(10, "Select a valid end date.")
      .refine(
        (value) => {
          if (!value) return false;
          const year = new Date(value).getFullYear();
          const currentYear = new Date().getFullYear();
          return !(year < currentYear - 1 || year > currentYear + 1);
        },
        { message: "Select a valid end year." },
      ),
    status: z.enum(TimeOffStatus).optional(),
    reviewNote: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
    reviewedBy: z.string().trim().max(100, "Keep the name under 100 characters.").optional(),
    hours: z
      .string()
      .trim()
      .min(1, "Enter the requested hours.")
      .refine((value) => !Number.isNaN(Number(value)), "Enter a valid number of hours.")
      .refine((value) => Number(value) > 0, "Hours must be greater than 0."),
    reason: z.string().trim().max(500, "Keep the note under 500 characters."),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        message: "End date cannot be before start date.",
        path: ["endDate"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Start date cannot be after end date.",
        path: ["startDate"],
      });
    }

    //NOTE: Validate that the hours field is greater than 0. To cover cases where the user might enter 0 or negative numbers directly in the form.
    if (data.hours && Number(data.hours) <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Hours must be greater than 0.",
        path: ["hours"],
      });
    }

    if (data.startDate === data.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "Start date and end date cannot be the same.",
        path: ["endDate"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Start date and end date cannot be the same.",
        path: ["startDate"],
      });
    }
  });

export const timeOffRequestByIdSchema = z.object({
  requestId: z.string().trim().min(1, "Request ID is required."),
  // formData: timeOffSubmissionSchema,
});

export const updateTimeOffRequestSchema = z.object({
  requestId: z.string().trim().min(1, "Request ID is required."),
  formData: z.object(timeOffSubmissionSchema.shape),
});

export type TimeOffFormValues = z.input<typeof timeOffSubmissionSchema>;
export type FieldErrors = Partial<Record<keyof TimeOffFormValues, string>>;
