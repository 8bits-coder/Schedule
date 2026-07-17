"use client";
import BodyWrapper from "@/components/custom_ui/BodyWrapper";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";

const timeOffTypes = ["vacation", "sick", "personal", "holiday", "overtime_offset", "unpaid"] as const;
type TimeOffType = (typeof timeOffTypes)[number];

const duration = ["full", "hours"] as const;
type Portion = (typeof duration)[number];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

const leaveTypes: Array<{
  value: TimeOffType;
  label: string;
  description: string;
}> = [
  {
    value: "vacation",
    label: "Vacation",
    description: "Planned personal time away from work.",
  },
  {
    value: "sick",
    label: "Sick leave",
    description: "Illness, recovery, or medical appointments.",
  },
  {
    value: "personal",
    label: "Personal day",
    description: "Short personal matters or urgent life events.",
  },
  {
    value: "holiday",
    label: "Holiday",
    description: "Extended family or bonding leave.",
  },
  {
    value: "overtime_offset",
    label: "OTO",
    description: "Leave outside standard paid balances.",
  },
];

const balances: Record<TimeOffType, number> = {
  vacation: 20,
  sick: 8,
  personal: 1,
  holiday: 60,
  overtime_offset: 5.5,
  unpaid: 30,
};

const timeOffRequestSchema = z
  .object({
    type: z.enum(timeOffTypes, { error: "Select a leave type." }),
    startDate: z.string().trim().min(1, "Select a start date."),
    endDate: z.string().trim().min(1, "Select an end date."),
    duration: z.enum(duration),
    totalHours: z
      .string()
      .trim()
      .min(1, "Enter the requested hours.")
      .refine((value) => !Number.isNaN(Number(value)), "Enter a valid number of hours.")
      .transform(Number)
      .refine((value) => value > 0, "Hours must be greater than 0."),
    reason: z.string().trim().max(500, "Keep the note under 500 characters."),
  })
  .superRefine((value, context) => {
    const start = parseLocalDate(value.startDate);
    const end = parseLocalDate(value.endDate);

    if (value.startDate && !start) {
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Enter a valid start date.",
      });
    }

    if (value.endDate && !end) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Enter a valid end date.",
      });
    }

    if (!start || !end) {
      return;
    }

    if (start > end) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "The end date must be on or after the start date.",
      });
    }

    if (value.duration !== "full" && value.startDate !== value.endDate) {
      context.addIssue({
        code: "custom",
        path: ["portion"],
        message: "Half-day requests are available for single-day requests only.",
      });
    }

    const duration = countBusinessDays(value.startDate, value.endDate, value.duration);

    if (duration <= 0) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Select a range that includes at least one business day.",
      });
    }

    if (value.type !== "unpaid" && duration > balances[value.type]) {
      context.addIssue({
        code: "custom",
        path: ["type"],
        message: "This request is longer than the available balance for this leave type.",
      });
    }
  });

type TimeOffFormValues = z.input<typeof timeOffRequestSchema>;
type TimeOffRequestValues = z.output<typeof timeOffRequestSchema>;
type FieldErrors = Partial<Record<keyof TimeOffFormValues, string>>;

const initialForm: TimeOffFormValues = {
  type: "vacation",
  startDate: "",
  endDate: "",
  duration: "full",
  totalHours: "",
  reason: "",
};

function parseLocalDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function countBusinessDays(startValue: string, endValue: string, duration: Portion) {
  const start = parseLocalDate(startValue);
  const end = parseLocalDate(endValue);

  if (!start || !end || start > end) return 0;

  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    if (!isWeekend(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  if (count > 0 && startValue === endValue && duration !== "full" && !isWeekend(start)) {
    return 0.5;
  }

  return count;
}

function getNextBusinessDay(value: string) {
  const date = parseLocalDate(value);

  if (!date) return null;

  const cursor = new Date(date);
  cursor.setDate(cursor.getDate() + 1);

  while (isWeekend(cursor)) {
    cursor.setDate(cursor.getDate() + 1);
  }

  return cursor;
}

function formatDisplayDate(value: string) {
  const date = parseLocalDate(value);

  if (!date) return "Not selected";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDisplayDateFromDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDays(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function getFieldErrors(values: TimeOffFormValues, effectivePortion: Portion): FieldErrors {
  const result = timeOffRequestSchema.safeParse({ ...values, portion: effectivePortion });

  if (result.success) {
    return {};
  }

  const nextErrors: FieldErrors = {};
  const flattened = result.error.flatten().fieldErrors;

  (Object.keys(flattened) as Array<keyof TimeOffFormValues>).forEach((field) => {
    const message = flattened[field]?.[0];

    if (message) {
      nextErrors[field] = message;
    }
  });

  return nextErrors;
}

export default function TimeOffPage() {
  const [form, setForm] = useState<TimeOffFormValues>(initialForm);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedRequest, setSubmittedRequest] = useState<TimeOffRequestValues | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success">("idle");

  const isSingleDay = Boolean(form.startDate && form.startDate === form.endDate);
  const effectivePortion = isSingleDay ? form.duration : "full";

  const dateError = useMemo(() => {
    if (!form.startDate || !form.endDate) return "";

    const start = parseLocalDate(form.startDate);
    const end = parseLocalDate(form.endDate);

    if (!start || !end) return "Enter valid start and end dates.";
    if (start > end) return "The end date must be on or after the start date.";

    return "";
  }, [form.startDate, form.endDate]);

  const hasWeekendSelection = useMemo(() => {
    const start = parseLocalDate(form.startDate);
    const end = parseLocalDate(form.endDate);

    return Boolean((start && isWeekend(start)) || (end && isWeekend(end)));
  }, [form.startDate, form.endDate]);

  const duration = useMemo(
    () => countBusinessDays(form.startDate, form.endDate, effectivePortion),
    [effectivePortion, form.endDate, form.startDate],
  );

  const estimatedHours = duration > 0 ? duration * 8 : 0;

  const balanceOk = form.type === "unpaid" || duration <= balances[form.type];

  useEffect(() => {
    if (!attemptedSubmit) {
      return;
    }

    setFieldErrors(getFieldErrors(form, effectivePortion));
  }, [attemptedSubmit, effectivePortion, form]);

  const updateField = <K extends keyof TimeOffFormValues>(field: K, value: TimeOffFormValues[K]) => {
    if (submitState === "success") {
      setSubmitState("idle");
      setSubmittedRequest(null);
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const getInputStateClassName = (field: keyof TimeOffFormValues, extraClassName = "") => {
    const invalidClassName = fieldErrors[field]
      ? " border-rose-500 bg-rose-50 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
      : "";

    return `${inputClassName}${invalidClassName}${extraClassName ? ` ${extraClassName}` : ""}`;
  };

  const resetForm = () => {
    setForm(initialForm);
    setAttemptedSubmit(false);
    setFieldErrors({});
    setSubmittedRequest(null);
    setSubmitState("idle");
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    const validation = timeOffRequestSchema.safeParse({ ...form, portion: effectivePortion });

    if (!validation.success) {
      setFieldErrors(getFieldErrors(form, effectivePortion));
      return;
    }

    setFieldErrors({});
    setSubmittedRequest(validation.data);
    setSubmitState("submitting");

    setTimeout(() => {
      setSubmitState("success");
    }, 2000);
  };

  const returnDate = getNextBusinessDay(form.endDate);

  return (
    <BodyWrapper>
      <div className="py-4 text-slate-900">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-indigo-50 shadow-sm shadow-slate-200/60">
          <div className="px-8 py-10">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-indigo-800">
              Time Off
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Request time off</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Select your leave type, choose the dates, and send the request.
            </p>
          </div>
        </div>

        {submitState === "success" && (
          <div
            aria-live="polite"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Request prepared successfully for {submittedRequest?.totalHours ?? 0} hours. Connect the submit handler to
            the API or workflow when ready.
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionCard
              title="Request details"
              subtitle="Choose the leave type, define the schedule, and submit the request.">
              <div>
                <label className="text-sm font-medium text-slate-700">Leave type</label>
                <select
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value as TimeOffType)}
                  aria-invalid={Boolean(fieldErrors.type)}
                  className={getInputStateClassName("type")}>
                  {leaveTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.type ? (
                  <p className="mt-2 text-xs text-rose-600">{fieldErrors.type}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    {leaveTypes.find((type) => type.value === form.type)?.description} Available balance:{" "}
                    {formatDays(balances[form.type])}
                    {form.type === "overtime_offset" ? " hours" : " days"}.
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.startDate)}
                    className={getInputStateClassName("startDate")}
                  />
                  {fieldErrors.startDate ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.startDate}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">End date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => updateField("endDate", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.endDate)}
                    className={getInputStateClassName("endDate")}
                  />
                  {fieldErrors.endDate ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.endDate}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Day length</label>
                  <select
                    value={effectivePortion}
                    disabled={!isSingleDay}
                    onChange={(event) => updateField("duration", event.target.value as Portion)}
                    aria-invalid={Boolean(fieldErrors.duration)}
                    className={getInputStateClassName("duration", "disabled:cursor-not-allowed disabled:opacity-60")}>
                    <option value="full">Full day</option>
                    <option value="hours">Partial</option>
                  </select>
                  {fieldErrors.duration ? (
                    <p className="mt-2 text-xs text-rose-600">{fieldErrors.duration}</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Half-day requests are available for single-day requests only.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Total hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.totalHours}
                    onChange={(event) => updateField("totalHours", event.target.value)}
                    placeholder="8"
                    aria-invalid={Boolean(fieldErrors.totalHours)}
                    className={getInputStateClassName("totalHours")}
                  />
                  {fieldErrors.totalHours ? (
                    <p className="mt-2 text-xs text-rose-600">{fieldErrors.totalHours}</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Enter the requested hours directly. Estimated from selected dates:{" "}
                      {estimatedHours > 0 ? formatDays(estimatedHours) : "0"} hours.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-slate-700">Note for your manager</label>
                <textarea
                  value={form.reason}
                  onChange={(event) => updateField("reason", event.target.value)}
                  rows={3}
                  placeholder="Optional context or scheduling notes."
                  aria-invalid={Boolean(fieldErrors.reason)}
                  className={getInputStateClassName("reason")}
                />
                {fieldErrors.reason ? (
                  <p className="mt-2 text-xs text-rose-600">{fieldErrors.reason}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Keep this brief unless the approver needs extra context.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Request timing</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Duration is calculated in business days and excludes weekends.
                    </p>
                  </div>
                  <div className="text-sm text-slate-700">
                    {form.startDate && form.endDate
                      ? `${formatDisplayDate(form.startDate)} → ${formatDisplayDate(form.endDate)}`
                      : "Select a date range"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {dateError ? (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                      {dateError}
                    </span>
                  ) : null}
                  {hasWeekendSelection ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
                      Weekend dates are ignored in duration calculations.
                    </span>
                  ) : null}
                  {!dateError && duration > 0 ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                      Estimated request: {form.totalHours} hour
                      {Number(form.totalHours) > 1 ? "s" : ""}
                    </span>
                  ) : null}
                  {!dateError && duration > 0 && returnDate ? (
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-700">
                      Return date: {formatDisplayDateFromDate(returnDate)}
                    </span>
                  ) : null}
                  {duration > 0 && !balanceOk ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
                      This request is longer than the available balance for this leave type.
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Submission status:{" "}
                  <span className="font-medium text-slate-700">
                    {submitState === "idle" ? "Draft" : submitState === "submitting" ? "Submitting" : "Ready"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70">
                    {submitState === "submitting" ? "Submitting..." : "Submit request"}
                  </button>
                </div>
              </div>
            </SectionCard>
          </form>
        </div>
      </div>
    </BodyWrapper>
  );
}
