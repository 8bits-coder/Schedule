"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Clock,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Copy,
  ClipboardPaste,
  X,
  Lock,
} from "lucide-react";
import { deleteSchedule, Employee, Shift, updateSchedule, WorkLocation } from "@/actions/schedule";
import { ShiftEntry, shiftType } from "@/types/shift";
import { DAYS, shiftTypes } from "./constants";
import {
  addDays,
  formatDate,
  getISOWeekNumber,
  getWeekStart,
  isToday,
  ScheduleData,
  scheduleKey,
  toDateStr,
} from "./dateHelpers";
import { toast } from "sonner";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeekSchedule({
  employees,
  shifts,
  locations,
  isManager,
}: {
  employees: Employee[];
  shifts: Shift[];
  locations: WorkLocation[];
  isManager: boolean;
}) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{
    empId: string;
    dateStr: string;
    dayLabel: string;
  } | null>(null);
  const [form, setForm] = useState<ShiftEntry>({
    shiftType: "" as shiftType,
    startTime: "",
    endTime: "",
    locationName: "",
    locationId: "",
    userId: "",
    shiftBadgeId: "",
    shiftDate: new Date(),
    notes: "",
  });
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{
    entry: ShiftEntry;
    sourceKey: string;
  } | null>(null);
  const [pasteFlash, setPasteFlash] = useState<string | null>(null);

  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));
  const weekNumber = getISOWeekNumber(addDays(weekStart, 1));

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  useEffect(() => {
    setSchedule(
      shifts.reduce((acc, schedule) => {
        acc[scheduleKey(schedule.userId, toDateStr(new Date(schedule.shiftDate)))] = {
          shiftType: schedule.shiftType,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          locationName: schedule.location ? schedule.location.name : "",
          locationId: schedule.location ? schedule.location.id : "",
          notes: schedule.notes,
          userId: schedule.userId,
          shiftBadgeId: schedule.shiftBadgeId,
          shiftDate: schedule.shiftDate,
        };
        return acc;
      }, {} as ScheduleData),
    );
  }, [shifts]);

  const startMonthStr = weekStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const endMonthStr = weekDates[6].toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthLabel =
    startMonthStr === endMonthStr
      ? startMonthStr
      : `${weekStart.toLocaleDateString("en-US", { month: "short" })} – ${endMonthStr}`;

  const openDialog = (empId: string, date: Date, dayLabel: string) => {
    if (!isManager) return;
    const dateStr = toDateStr(date);
    const existing = schedule[scheduleKey(empId, dateStr)];
    setEditing({ empId, dateStr, dayLabel });
    setForm(
      existing ?? {
        shiftType: "",
        startTime: "",
        endTime: "",
        notes: "",
        locationName: "",
        locationId: "",
        userId: empId,
        shiftBadgeId: "",
        shiftDate: date,
      },
    );
    setOpen(true);
  };

  const saveEntry = async () => {
    if (!editing || !isManager) return;
    setSchedule((prev) => ({
      ...prev,
      [scheduleKey(editing.empId, editing.dateStr)]: form,
    }));
    setOpen(false);
    await updateSchedule(form)
      .then(() => {
        toast.success("Schedule updated successfully");
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      });
  };

  const deleteEntry = async (empId: string, dateStr: string) => {
    if (!isManager) return;
    const key = scheduleKey(empId, dateStr);
    setSchedule((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setHoveredKey(null);
    if (clipboard?.sourceKey === key) setClipboard(null);
    await deleteSchedule(empId, dateStr);
  };

  const copyEntry = (empId: string, dateStr: string) => {
    if (!isManager) return;
    const key = scheduleKey(empId, dateStr);
    const entry = schedule[key];
    if (!entry) return;
    setClipboard({ entry: { ...entry }, sourceKey: key });
    setHoveredKey(null);
  };

  const pasteEntry = async (empId: string, dateStr: string) => {
    if (!clipboard || !isManager) return;
    const key = scheduleKey(empId, dateStr);
    setSchedule((prev) => ({ ...prev, [key]: { ...clipboard.entry } }));
    setPasteFlash(key);
    setTimeout(() => setPasteFlash(null), 600);
    await updateSchedule(clipboard.entry);
  };

  const clearClipboard = () => setClipboard(null);
  const employee = editing ? employees.find((e) => e.id === editing.empId) : null;

  return (
    <ContentWrapper>
      {/* ── Header ── */}
      <div className="border-b border-stone-200 bg-white p-6 shadow-sm rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Weekly Schedule</h1>
            <p className="text-sm text-stone-500 mt-0.5 flex items-center gap-1.5">
              {employees.length} employees ·
              {isManager ? (
                "click a cell to assign a shift"
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <Lock className="size-3" /> View only — contact your manager to edit
                </span>
              )}
            </p>
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <div className="text-center min-w-[170px]">
              <div className="font-semibold text-stone-800 text-sm">{monthLabel}</div>
              <div className="text-xs text-stone-400 flex items-center justify-center gap-1 mt-0.5">
                <CalendarDays className="size-3" />
                Week {weekNumber}
              </div>
            </div>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors">
              <ChevronRight className="size-4" />
            </button>
            <button
              onClick={goToday}
              className="ml-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
              Today
            </button>
          </div>

          {/* Legend + clipboard */}
          <div className="flex flex-col items-end gap-2">
            {isManager && clipboard && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
                <ClipboardPaste className="size-3.5 shrink-0" />
                <span>
                  <span className="font-semibold">{clipboard.entry.shiftType}</span>
                  copied
                  {clipboard.entry.startTime
                    ? ` · ${clipboard.entry.startTime}${clipboard.entry.endTime ? `–${clipboard.entry.endTime}` : ""}`
                    : ""}
                  &nbsp;— click any empty cell to paste
                </span>
                <button onClick={clearClipboard} className="ml-1 p-0.5 rounded hover:bg-indigo-200 transition-colors">
                  <X className="size-3" />
                </button>
              </div>
            )}
            <div className="flex gap-1.5 flex-wrap justify-end">
              {shiftTypes.map((s) => (
                <span
                  key={s.id}
                  className={`text-[11px] rounded-full px-2.5 py-0.5 font-medium border ${s.cellBg} ${s.cellBorder} ${s.badgeBg} ${s.badgeText}`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className=" py-6 overflow-x-auto">
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="sticky left-0 z-10 bg-stone-50 text-left px-4 py-3 font-semibold text-stone-500 w-48 border-r border-stone-200">
                  <span className="text-xs uppercase tracking-wider">Employee</span>
                </th>
                {DAYS.map((day, i) => {
                  const date = weekDates[i];
                  const today = isToday(date);
                  const weekend = i === 0 || i === 6;
                  return (
                    <th
                      key={day}
                      className={`px-3 py-2.5 text-center font-semibold min-w-[130px] ${weekend ? "bg-rose-50/60" : ""}`}>
                      <div
                        className={`text-xs uppercase tracking-wider font-semibold ${weekend ? "text-rose-400" : "text-stone-400"}`}>
                        {day.slice(0, 3)}
                      </div>
                      <div
                        className={`mt-1 mx-auto flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${today ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : weekend ? "text-rose-500" : "text-stone-700"}`}>
                        {date.getDate()}
                      </div>
                      <div className={`text-[10px] font-normal mt-0.5 ${weekend ? "text-rose-300" : "text-stone-400"}`}>
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, rowIdx) => (
                <tr key={emp.id} className={`border-b border-stone-100 ${rowIdx % 2 === 1 ? "bg-stone-50/40" : ""}`}>
                  {/* Employee column */}
                  <td className="sticky left-0 z-10 bg-inherit border-r border-stone-200 px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-8 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-stone-800 text-xs leading-tight">{emp.name}</div>
                        <div className="text-[10px] text-stone-400">Pass: {emp.jobDetails?.passNumber ?? "N/A"}</div>
                        <div className="text-[10px] text-blue-400">
                          {emp.jobDetails?.startTime ?? "00:00"} - {emp.jobDetails?.endTime ?? "00:00"}
                        </div>
                        <div className="text-[10px] text-stone-400">Job# {emp.jobDetails?.jobNumber ?? "N/A"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekDates.map((date, dayIdx) => {
                    const dateStr = toDateStr(date);
                    const cellKey = scheduleKey(emp.id, dateStr);
                    const entry = schedule[cellKey];
                    const hovered = hoveredKey === cellKey;
                    const weekend = dayIdx === 0 || dayIdx === 6;
                    const isSource = clipboard?.sourceKey === cellKey;
                    const flashing = pasteFlash === cellKey;
                    const colors = entry
                      ? (() => {
                          const st = shiftTypes.find((s) => s.name === entry.shiftType);
                          return st
                            ? {
                                cell: `${st.cellBg} ${st.cellBorder}`,
                                badge: `${st.badgeBg} ${st.badgeText}`,
                              }
                            : {
                                cell: "bg-stone-50 border-stone-200",
                                badge: "bg-stone-100 text-stone-700",
                              };
                        })()
                      : null;

                    return (
                      <td key={dateStr} className={`p-2 align-center h-full ${weekend ? "bg-rose-50/20" : ""}`}>
                        {entry ? (
                          <div
                            className={`relative h-16 rounded-lg border px-2.5 py-1.5 text-xs cursor-default select-none transition-all duration-150
                              ${colors!.cell}
                              ${hovered ? "shadow-md ring-1 ring-indigo-200" : ""}
                              ${isSource ? "ring-2 ring-indigo-400 ring-offset-1" : ""}
                              ${flashing ? "ring-2 ring-emerald-400 ring-offset-1 scale-[1.03]" : ""}
                            `}
                            onMouseEnter={() => setHoveredKey(cellKey)}
                            onMouseLeave={() => setHoveredKey(null)}>
                            {isSource && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap z-10 shadow">
                                COPIED
                              </div>
                            )}
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mb-1 ${colors!.badge}`}>
                              {entry.locationName ? `${entry.locationName}` : entry.shiftType}
                            </span>
                            {entry.startTime && (
                              <div className="flex items-center gap-0.5 text-stone-500 text-[11px]">
                                <Clock className="size-2.5 shrink-0" />
                                <span>
                                  {entry.startTime}
                                  {entry.endTime ? ` – ${entry.endTime}` : ""}
                                </span>
                              </div>
                            )}
                            <div className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[110px]">
                              {entry.notes || "N/A"}
                            </div>
                            {/* Manager-only hover toolbar */}
                            {isManager && hovered && (
                              <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                                <button
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    copyEntry(emp.id, dateStr);
                                  }}
                                  className="p-1 rounded bg-white shadow-sm border border-stone-200 text-stone-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                                  title="Copy shift">
                                  <Copy className="size-3" />
                                </button>
                                <button
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    openDialog(emp.id, date, DAYS[dayIdx]);
                                  }}
                                  className="p-1 rounded bg-white shadow-sm border border-stone-200 text-stone-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                                  title="Edit shift">
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    deleteEntry(emp.id, dateStr);
                                  }}
                                  className="p-1 rounded bg-white shadow-sm border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 transition-colors"
                                  title="Remove shift">
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isManager ? (
                          clipboard ? (
                            <button
                              onClick={() => pasteEntry(emp.id, dateStr)}
                              className="w-full h-16 rounded-lg border-2 border-dashed border-indigo-300 flex items-center justify-center gap-1 text-indigo-400 hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-600 transition-all text-[10px] font-medium"
                              title="Paste shift here">
                              <ClipboardPaste className="size-3.5" />
                              <span>Paste</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openDialog(emp.id, date, DAYS[dayIdx])}
                              className="w-full h-16 rounded-lg border border-dashed border-stone-200 flex items-center justify-center text-stone-300 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/40 transition-all">
                              <Plus className="size-3.5" />
                            </button>
                          )
                        ) : (
                          // Read-only empty cell
                          <div className="w-full h-16 rounded-lg bg-stone-50/50" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-stone-400 mt-3">
          Week {weekNumber} · {formatDate(weekStart)} –{formatDate(weekDates[6])}
          {isManager && clipboard && (
            <span className="ml-3 text-indigo-400 font-medium">
              · Paste mode active —
              <button onClick={clearClipboard} className="underline hover:text-indigo-600">
                clear clipboard
              </button>
            </span>
          )}
        </p>
      </div>

      {/* ── Shift Dialog (manager only) ── */}
      {isManager && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-stone-900">
                {editing && schedule[scheduleKey(editing.empId, editing.dateStr)] ? "Edit Shift" : "Assign Shift"}
              </DialogTitle>
              {employee && editing && (
                <p className="text-sm text-stone-500">
                  {employee.name} · {editing.dayLabel},
                  {new Date(editing.dateStr + "T00:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="shiftType">Shift Type</Label>
                <Select
                  value={form.shiftType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      shiftType: v as ShiftEntry["shiftType"],
                    }))
                  }>
                  <SelectTrigger id="shiftType">
                    <SelectValue placeholder="Select shift type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={form.locationName || ""}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      locationId: v || "",
                      locationName: locations.find((loc) => loc.id === v)?.name || "",
                    }))
                  }>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select work location…" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes…"
                  className="resize-none"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveEntry}
                disabled={!form.shiftType}
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Shift
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ContentWrapper>
  );
}
