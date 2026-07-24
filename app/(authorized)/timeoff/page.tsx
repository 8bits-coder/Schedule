"use client";

import { submitTimeOffRequestAction } from "@/actions/timeOffActions";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { TimeOffType as PrismaTimeOffType } from "@/prisma/generated/prisma/browser";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { getFieldErrors } from "@/utility/Errors";
import { FieldErrors, TimeOffFormValues, timeOffSubmissionSchema } from "@/utility/schema/timeOffRequestSchema";
import { useRouter } from "next/navigation";

type TimeOffType = (typeof PrismaTimeOffType)[keyof typeof PrismaTimeOffType] extends infer T
  ? T extends string
    ? Uppercase<T>
    : never
  : never;

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const leaveTypes: Array<{
  value: TimeOffType;
  label: string;
  description: string;
}> = [
  {
    value: "VACATION",
    label: "Vacation",
    description: "Planned personal time away from work.",
  },
  {
    value: "SICK",
    label: "Sick leave",
    description: "Illness, recovery, or medical appointments.",
  },
  {
    value: "PERSONAL",
    label: "Personal day",
    description: "Short personal matters or urgent life events.",
  },
  {
    value: "HOLIDAY",
    label: "Holiday",
    description: "Extended family or bonding leave.",
  },
  {
    value: "OTO",
    label: "Overtime offset",
    description: "Leave outside standard paid balances.",
  },
  {
    value: "UNPAID",
    label: "Unpaid leave",
    description: "Time off without pay.",
  },
  {
    value: "MATERNITY",
    label: "Maternity leave",
    description: "Extended family or bonding leave.",
  },
  {
    value: "PATERNITY",
    label: "Paternity leave",
    description: "Extended family or bonding leave.",
  },
  {
    value: "BEREAVEMENT",
    label: "Bereavement leave",
    description: "Time off to grieve the loss of a loved one.",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Any other type of leave not listed.",
  },
];

const balances: Record<TimeOffType, number> = {
  VACATION: 20,
  MATERNITY: 20,
  PATERNITY: 20,
  BEREAVEMENT: 3,
  OTHER: 0,
  SICK: 8,
  PERSONAL: 1,
  HOLIDAY: 60,
  OTO: 5.5,
  UNPAID: Infinity,
};

const initialForm: TimeOffFormValues = {
  type: "VACATION",
  startDate: "",
  endDate: "",
  hours: "",
  reason: "",
};

function parseLocalDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function countCalendarDays(startValue: string, endValue: string) {
  const start = parseLocalDate(startValue);
  const end = parseLocalDate(endValue);

  if (!start || !end || start > end) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  return Math.floor((endTime - startTime) / msPerDay) + 1;
}

function getNextDay(value: string) {
  const date = parseLocalDate(value);

  if (!date) return null;

  const cursor = new Date(date);
  cursor.setDate(cursor.getDate() + 1);

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

export default function TimeOffPage() {
  const [form, setForm] = useState<TimeOffFormValues>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { isExecuting, executeAsync, hasSucceeded } = useAction(submitTimeOffRequestAction, {
    onSuccess: () => {
      toast.success(`Request submitted successfully.`);
      resetForm();
    },
    onError(args) {
      if (args.error?.validationErrors) {
        console.log("Validation errors:", args.error.validationErrors);
        setFieldErrors(getFieldErrors({ validationErrors: args.error.validationErrors }));
      }

      if (args.error?.serverError) toast.error(args.error.serverError);
    },
  });

  const dateError = useMemo(() => {
    if (!form.startDate || !form.endDate) return "";

    const start = parseLocalDate(form.startDate);
    const end = parseLocalDate(form.endDate);

    if (!start || !end) return "Enter valid start and end dates.";
    if (start > end) return "The end date must be on or after the start date.";

    return "";
  }, [form.startDate, form.endDate]);

  const duration = useMemo(() => countCalendarDays(form.startDate, form.endDate), [form.endDate, form.startDate]);

  const estimatedHours = duration > 0 ? duration * 8 : 0;

  const balanceOk = form.type === "UNPAID" || duration <= balances[form.type];

  const updateField = <K extends keyof TimeOffFormValues>(field: K, value: TimeOffFormValues[K]) => {
    setFieldErrors((current) => ({ ...current, [field]: value ? "" : current[field] }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const getInputStateClassName = (field: keyof TimeOffFormValues, extraClassName = "") => {
    const invalidClassName = fieldErrors[field]
      ? "border border-rose-500! bg-rose-50! text-rose-900! placeholder:text-rose-300! focus:border-rose-500! focus:ring-rose-500/20!"
      : "";

    return `${inputClassName}${invalidClassName}${extraClassName ? ` ${extraClassName}` : ""}`;
  };

  const resetForm = () => {
    setForm(initialForm);
    setFieldErrors({});
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeAsync({ ...form });
  };

  const returnDate = getNextDay(form.endDate);

  return (
    <ContentWrapper>
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

        {hasSucceeded && (
          <div
            aria-live="polite"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Request prepared successfully for {form.hours ?? 0} hours. Connect the submit handler to the API or workflow
            when ready.
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
                    {form.type === "OTO" ? " hours" : " days"}.
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
                  <label className="text-sm font-medium text-slate-700">Total hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hours}
                    onChange={(event) => updateField("hours", event.target.value)}
                    placeholder="8"
                    aria-invalid={Boolean(fieldErrors.hours)}
                    className={getInputStateClassName("hours")}
                  />
                  {fieldErrors.hours ? (
                    <p className="mt-2 text-xs text-rose-600">{fieldErrors.hours}</p>
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
                      Duration is calculated in calendar days, including weekends.
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
                  {!dateError && duration > 0 ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                      Estimated request: {form.hours} hour
                      {Number(form.hours) > 1 ? "s" : ""}
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
                    {isExecuting ? "Submitting" : hasSucceeded ? "Submitted" : "Ready"}
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
                    disabled={isExecuting}
                    className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70">
                    {isExecuting ? "Submitting..." : "Submit request"}
                  </button>
                </div>
              </div>
            </SectionCard>
          </form>
        </div>
      </div>
    </ContentWrapper>
  );
}
