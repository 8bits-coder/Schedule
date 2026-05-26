"use client";
import BodyWrapper from "@/components/custom_ui/BodyWrapper";
import { useMemo, useState, type SubmitEvent, type ReactNode } from "react";
import { value } from "valibot";

type TimeOffType = "vacation" | "sick" | "personal" | "holiday" | "overtime_offset" | "unpaid";

type Portion = "full" | "morning" | "afternoon";

type FormState = {
  type: TimeOffType;
  startDate: string;
  endDate: string;
  portion: Portion;
  manager: string;
  delegate: string;
  reason: string;
  blockers: string;
  emergencyContact: string;
  documentLink: string;
  notes: string;
  reachable: boolean;
  notifyTeam: boolean;
  createCalendarHold: boolean;
  acknowledged: boolean;
};

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

const policyNotes: Record<TimeOffType, string> = {
  vacation: "Vacation requests are typically approved based on team capacity and notice period.",
  sick: "Sick leave may be submitted retroactively if needed. Coverage details still help the team.",
  personal: "Personal days are best submitted early when coverage is required.",
  holiday: "Holiday leave often requires an HR workflow and extended handoff planning.",
  overtime_offset: "Overtime leave can be updated later if exact dates change.",
  unpaid: "Unpaid leave may require additional approval from HR or finance.",
};

const managers = ["Avery Johnson", "Morgan Chen", "Riley Patel", "Jordan Rivera"];

const teammates = ["Taylor Kim", "Jamie Brooks", "Casey Nguyen", "Alex Carter", "Sam Flores"];

const initialForm: FormState = {
  type: "vacation",
  startDate: "",
  endDate: "",
  portion: "full",
  manager: "Avery Johnson",
  delegate: "Taylor Kim",
  reason: "",
  blockers: "",
  emergencyContact: "",
  documentLink: "",
  notes: "",
  reachable: false,
  notifyTeam: true,
  createCalendarHold: true,
  acknowledged: false,
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

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

function countBusinessDays(startValue: string, endValue: string, portion: Portion) {
  const start = parseLocalDate(startValue);
  const end = parseLocalDate(endValue);

  if (!start || !end || start > end) return 0;

  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    if (!isWeekend(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  if (count > 0 && startValue === endValue && portion !== "full" && !isWeekend(start)) {
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

function formatDisplayDateFromDate(value: Date | null) {
  if (!value) return "Not calculated";

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
  const [form, setForm] = useState<FormState>(initialForm);
  const [handoffItems, setHandoffItems] = useState<string[]>([
    "Share active project status and deadlines",
    "Transfer urgent approvals and owner context",
  ]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success">("idle");

  const isSingleDay = Boolean(form.startDate && form.startDate === form.endDate);
  const effectivePortion = isSingleDay ? form.portion : "full";

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

  const returnDate = useMemo(() => getNextBusinessDay(form.endDate), [form.endDate]);

  const balanceOk = form.type === "unpaid" || duration <= balances[form.type];
  const remainingBalance = form.type === "unpaid" ? null : Math.round((balances[form.type] - duration) * 10) / 10;

  const impactLevel =
    duration >= 10 ? "High impact" : duration >= 5 ? "Moderate impact" : duration > 0 ? "Low impact" : "Pending";

  const readinessChecks = useMemo(
    () => [
      {
        label: "Dates selected",
        done: Boolean(form.startDate && form.endDate && !dateError && duration > 0),
      },
      {
        label: "Reason included",
        done: form.reason.trim().length >= 12,
      },
      {
        label: "Coverage assigned",
        done: Boolean(form.delegate),
      },
      {
        label: "Handoff prepared",
        done: handoffItems.some((item) => item.trim().length > 0),
      },
      {
        label: "Policy acknowledged",
        done: form.acknowledged,
      },
      {
        label: "Within balance",
        done: balanceOk,
      },
    ],
    [
      balanceOk,
      dateError,
      duration,
      form.acknowledged,
      form.delegate,
      form.endDate,
      form.reason,
      form.startDate,
      handoffItems,
    ],
  );

  const readiness = Math.round((readinessChecks.filter((item) => item.done).length / readinessChecks.length) * 100);

  const warnings = useMemo(() => {
    const nextWarnings: string[] = [];

    if (!form.startDate || !form.endDate) nextWarnings.push("Select a valid time window.");
    if (dateError) nextWarnings.push(dateError);
    if (duration > 0 && !balanceOk)
      nextWarnings.push("This request exceeds the available balance for the selected leave type.");
    if (form.reason.trim().length < 12) nextWarnings.push("Add more context to the request reason.");
    if (!handoffItems.some((item) => item.trim().length > 0)) nextWarnings.push("Add at least one handoff item.");
    if (!form.acknowledged) nextWarnings.push("Confirm the policy acknowledgement before submitting.");

    return nextWarnings;
  }, [balanceOk, dateError, duration, form.acknowledged, form.endDate, form.reason, form.startDate, handoffItems]);

  const formIsValid =
    Boolean(form.startDate) &&
    Boolean(form.endDate) &&
    !dateError &&
    duration > 0 &&
    balanceOk &&
    form.reason.trim().length >= 12 &&
    Boolean(form.delegate) &&
    handoffItems.some((item) => item.trim().length > 0) &&
    form.acknowledged;

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    if (submitState === "success") setSubmitState("idle");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateHandoffItem = (index: number, value: string) => {
    if (submitState === "success") setSubmitState("idle");
    setHandoffItems((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addHandoffItem = () => {
    if (submitState === "success") setSubmitState("idle");
    setHandoffItems((current) => [...current, ""]);
  };

  const removeHandoffItem = (index: number) => {
    if (handoffItems.length === 1) return;
    if (submitState === "success") setSubmitState("idle");
    setHandoffItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setForm(initialForm);
    setHandoffItems(["Share active project status and deadlines", "Transfer urgent approvals and owner context"]);
    setAttemptedSubmit(false);
    setSubmitState("idle");
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (!formIsValid) return;

    setSubmitState("submitting");

    setTimeout(() => {
      setSubmitState("success");
    }, 800);
  };

  const readinessBarClass = readiness >= 100 ? "bg-emerald-500" : readiness >= 70 ? "bg-cyan-500" : "bg-amber-400";

  return (
    <BodyWrapper>
      <div className="py-4 text-slate-900">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-indigo-50 shadow-sm shadow-slate-200/60">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-8">
            <div className="py-10">
              <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-indigo-800">
                Time Off Center
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Request time off
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Plan leave, coordinate coverage, and preview approval details before submitting.
              </p>
            </div>

            <div className="relative grid gap-3 sm:grid-cols-5 border rounded-xl pt-8 p-4 bg-indigo-100 drop-shadow-lg">
              <span className="absolute -top-4 left-3 bg-white rounded-full px-3 py-1 text-sm border text-indigo-800 drop-shadow-lg">
                Total balance
              </span>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {leaveTypes.find((item) => item.value === "vacation")?.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatDays(balances["vacation"])} days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {leaveTypes.find((item) => item.value === "overtime_offset")?.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatDays(balances["overtime_offset"])} hours
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {leaveTypes.find((item) => item.value === "sick")?.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatDays(balances["sick"])} days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {leaveTypes.find((item) => item.value === "personal")?.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatDays(balances["personal"])} days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {leaveTypes.find((item) => item.value === "holiday")?.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatDays(balances["holiday"])} days</p>
              </div>
            </div>
          </div>
        </div>

        {submitState === "success" && (
          <div
            aria-live="polite"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Request prepared successfully. Connect the submit handler to the API or workflow when ready.
          </div>
        )}

        <div className="gap-6 ">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionCard
              title="Request details"
              subtitle="Choose the leave type, define the schedule, and provide context for the approver.">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {leaveTypes.map((type) => {
                  const selected = form.type === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateField("type", type.value)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-300 bg-cyan-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900">{type.label}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                          {formatDays(balances[type.value])}d
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{type.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">End date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => updateField("endDate", event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Day length</label>
                  <select
                    value={effectivePortion}
                    disabled={!isSingleDay}
                    onChange={(event) => updateField("portion", event.target.value as Portion)}
                    className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}>
                    <option value="full">Full day</option>
                    <option value="morning">First half</option>
                    <option value="afternoon">Second half</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    Half-day requests are available for single-day requests only.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Approving manager</label>
                  <select
                    value={form.manager}
                    onChange={(event) => updateField("manager", event.target.value)}
                    className={inputClassName}>
                    {managers.map((manager) => (
                      <option key={manager} value={manager}>
                        {manager}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-slate-700">Reason for request</label>
                <textarea
                  value={form.reason}
                  onChange={(event) => updateField("reason", event.target.value)}
                  rows={4}
                  placeholder="Summarize the request, context, and any scheduling considerations."
                  className={inputClassName}
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500">A short explanation helps reviewers approve faster.</span>
                  <span className={form.reason.trim().length >= 12 ? "text-emerald-600" : "text-slate-400"}>
                    {form.reason.trim().length} characters
                  </span>
                </div>
                {attemptedSubmit && form.reason.trim().length < 12 && (
                  <p className="mt-2 text-sm text-rose-600">Add at least 12 characters to describe the request.</p>
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
                      Estimated request: {formatDays(duration)} day
                      {duration === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Coverage and handoff"
              subtitle="Document who will support urgent work and what needs to be transferred before time off.">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Primary delegate</label>
                  <select
                    value={form.delegate}
                    onChange={(event) => updateField("delegate", event.target.value)}
                    className={inputClassName}>
                    {teammates.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Emergency contact</label>
                  <input
                    type="text"
                    value={form.emergencyContact}
                    onChange={(event) => updateField("emergencyContact", event.target.value)}
                    placeholder="Phone number or alternate contact"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-slate-700">Handoff checklist</label>
                <div className="mt-2 space-y-3">
                  {handoffItems.map((item, index) => (
                    <div key={`${index}-${item}`} className="flex gap-3">
                      <input
                        type="text"
                        value={item}
                        onChange={(event) => updateHandoffItem(index, event.target.value)}
                        placeholder={`Handoff item #${index + 1}`}
                        className={`${inputClassName} mt-0 flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeHandoffItem(index)}
                        disabled={handoffItems.length === 1}
                        className="rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addHandoffItem}
                  className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100">
                  Add handoff item
                </button>

                {attemptedSubmit && !handoffItems.some((item) => item.trim().length > 0) && (
                  <p className="mt-3 text-sm text-rose-600">Add at least one handoff item before submitting.</p>
                )}
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-slate-700">Critical blockers or deadlines</label>
                <textarea
                  value={form.blockers}
                  onChange={(event) => updateField("blockers", event.target.value)}
                  rows={4}
                  placeholder="List important commitments, launch dates, approvals, or high-risk work items."
                  className={inputClassName}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.reachable}
                      onChange={(event) => updateField("reachable", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Available for urgent questions</p>
                      <p className="mt-1 text-xs text-slate-500">Allow urgent contact while away if required.</p>
                    </div>
                  </div>
                </label>

                <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.notifyTeam}
                      onChange={(event) => updateField("notifyTeam", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Notify team channel</p>
                      <p className="mt-1 text-xs text-slate-500">Share approved dates with affected teammates.</p>
                    </div>
                  </div>
                </label>

                <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.createCalendarHold}
                      onChange={(event) => updateField("createCalendarHold", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Create calendar hold</p>
                      <p className="mt-1 text-xs text-slate-500">Block focus calendar time for the full request.</p>
                    </div>
                  </div>
                </label>
              </div>
            </SectionCard>

            <SectionCard
              title="Additional notes"
              subtitle="Attach supporting details, workflow links, or extra information for the approval chain.">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Supporting document link</label>
                  <input
                    type="url"
                    value={form.documentLink}
                    onChange={(event) => updateField("documentLink", event.target.value)}
                    placeholder="https://"
                    className={inputClassName}
                  />
                  <p className="mt-2 text-xs text-slate-500">Optional: shared doc, leave plan, or HR case reference.</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Manager note</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={4}
                    placeholder="Extra note for the approver or people-ops team."
                    className={inputClassName}
                  />
                </div>
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.acknowledged}
                  onChange={(event) => updateField("acknowledged", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    I reviewed balance, coverage, and approval requirements.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Some leave types may require HR review or additional notice before approval.
                  </p>
                </div>
              </label>

              {attemptedSubmit && !form.acknowledged && (
                <p className="mt-3 text-sm text-rose-600">Acknowledge the policy requirements before submitting.</p>
              )}

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

          <aside className="space-y-6">
            <SectionCard title="Live summary" subtitle="A preview of the request that the reviewer will receive.">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {leaveTypes.find((item) => item.value === form.type)?.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {form.startDate && form.endDate
                        ? `${formatDisplayDate(form.startDate)} → ${formatDisplayDate(form.endDate)}`
                        : "Date range pending"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      impactLevel === "High impact"
                        ? "border border-rose-200 bg-rose-50 text-rose-700"
                        : impactLevel === "Moderate impact"
                          ? "border border-amber-200 bg-amber-50 text-amber-800"
                          : impactLevel === "Low impact"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-slate-200 bg-white text-slate-600"
                    }`}>
                    {impactLevel}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Estimated duration</span>
                    <span className="font-medium text-slate-900">
                      {duration > 0 ? `${formatDays(duration)} day${duration === 1 ? "" : "s"}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Return date</span>
                    <span className="font-medium text-slate-900">{formatDisplayDateFromDate(returnDate)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Delegate</span>
                    <span className="font-medium text-slate-900">{form.delegate || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Urgent availability</span>
                    <span className="font-medium text-slate-900">{form.reachable ? "Available" : "Offline"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Request reason</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {form.reason.trim() || "Add request context to preview the approver note."}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Coverage notes</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {handoffItems.map((item, index) => (
                    <li key={`${index}-${item}-preview`} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                      <span>{item.trim() || `Handoff item #${index + 1}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>

            <SectionCard
              title="Readiness score"
              subtitle="A quick signal showing whether the request is complete enough to send.">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completion</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{readiness}%</p>
                  </div>
                  <p className="max-w-[11rem] text-right text-xs leading-5 text-slate-500">
                    Complete the remaining checks to improve approval readiness.
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${readinessBarClass}`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
                <div className="mt-4 space-y-3">
                  {readinessChecks.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.done
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-slate-200 bg-white text-slate-500"
                        }`}>
                        {item.done ? "Done" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Balance and policy"
              subtitle="Current entitlement, post-request balance, and guidance for the selected leave type.">
              <div className="space-y-3">
                {leaveTypes.map((type) => {
                  const selected = form.type === type.value;
                  const typeBalance = balances[type.value];

                  return (
                    <div
                      key={type.value}
                      className={`rounded-2xl border p-4 ${selected ? "border-cyan-200 bg-cyan-50" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-900">{type.label}</span>
                        <span className="text-sm text-slate-600">{formatDays(typeBalance)} days</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Remaining after request</span>
                  <span
                    className={`text-sm font-medium ${
                      remainingBalance === null
                        ? "text-slate-700"
                        : remainingBalance >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                    }`}>
                    {remainingBalance === null ? "Policy based" : `${formatDays(remainingBalance)} days`}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{policyNotes[form.type]}</p>
              </div>
            </SectionCard>

            <SectionCard title="Alerts" subtitle="Items that may block approval or require follow-up.">
              {warnings.length > 0 ? (
                <div className="space-y-3">
                  {warnings.map((warning) => (
                    <div
                      key={warning}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {warning}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  No blocking issues detected. The request looks ready to submit.
                </div>
              )}
            </SectionCard>
          </aside>
        </div>
      </div>
    </BodyWrapper>
  );
}
