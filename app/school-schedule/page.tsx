"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CalendarDays,
  ClipboardList,
  Bell,
  Plus,
  Trash2,
  Check,
  Send,
  Pin,
  Users,
  GraduationCap,
  UserRound,
  Clock3,
  Inbox,
  CircleCheckBig,
  Circle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Copy,
  Clipboard,
} from "lucide-react";

/* ----------------------------- constants ----------------------------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 16; // 4pm
const SLOTS_PER_HOUR = 2; // 30-min increments
const TOTAL_ROWS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

const TIME_OPTIONS = (() => {
  const out = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === END_HOUR && m === 30) continue;
      out.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
    }
  }
  return out;
})();

const SUBJECT_COLORS = [
  { key: "marigold", hex: "#E8A33D" },
  { key: "sage", hex: "#4C7A6B" },
  { key: "coral", hex: "#D9695C" },
  { key: "periwinkle", hex: "#6B76B8" },
  { key: "rose", hex: "#B45C77" },
  { key: "navy", hex: "#22314A" },
];

function timeToRowIndex(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h - START_HOUR) * SLOTS_PER_HOUR + (m === 30 ? 1 : 0);
}

function fmt12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mondayForOffset(offset: number): Date {
  return addDays(getMonday(new Date()), offset * 7);
}

function weekKeyForOffset(offset: number): string {
  return toDateKey(mondayForOffset(offset));
}

function weekKeyForDateString(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return toDateKey(getMonday(d));
}

function formatRangeForMonday(monday: Date): string {
  const friday = addDays(monday, 4);
  const firstStr = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const lastStr = friday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${firstStr} – ${lastStr}, ${friday.getFullYear()}`;
}

function formatWeekRange(offset: number): string {
  return formatRangeForMonday(mondayForOffset(offset));
}

function weekDatesForOffset(offset: number): Date[] {
  const monday = mondayForOffset(offset);
  return DAYS.map((_, i) => addDays(monday, i));
}

const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------ seed data ------------------------------ */

const SEED_SCHEDULE = [
  {
    id: uid(),
    day: "Mon",
    subject: "Algebra II",
    teacher: "Ms. Alvarez",
    room: "Rm 204",
    start: "08:00",
    end: "09:00",
    color: "marigold",
  },
  {
    id: uid(),
    day: "Mon",
    subject: "Biology Lab",
    teacher: "Mr. Okafor",
    room: "Lab 3",
    start: "09:30",
    end: "11:00",
    color: "sage",
  },
  {
    id: uid(),
    day: "Mon",
    subject: "World History",
    teacher: "Ms. Patel",
    room: "Rm 112",
    start: "12:30",
    end: "13:30",
    color: "periwinkle",
  },
  {
    id: uid(),
    day: "Tue",
    subject: "Algebra II",
    teacher: "Ms. Alvarez",
    room: "Rm 204",
    start: "08:00",
    end: "09:00",
    color: "marigold",
  },
  {
    id: uid(),
    day: "Tue",
    subject: "English Lit",
    teacher: "Mr. Bell",
    room: "Rm 108",
    start: "10:00",
    end: "11:00",
    color: "coral",
  },
  {
    id: uid(),
    day: "Tue",
    subject: "Guitar Ensemble",
    teacher: "Ms. Reyes",
    room: "Rm 305",
    start: "10:15",
    end: "11:00",
    color: "rose",
  },
  {
    id: uid(),
    day: "Wed",
    subject: "Biology Lab",
    teacher: "Mr. Okafor",
    room: "Lab 3",
    start: "09:30",
    end: "11:00",
    color: "sage",
  },
  {
    id: uid(),
    day: "Wed",
    subject: "Studio Art",
    teacher: "Ms. Reyes",
    room: "Rm 301",
    start: "13:00",
    end: "14:30",
    color: "rose",
  },
  {
    id: uid(),
    day: "Thu",
    subject: "World History",
    teacher: "Ms. Patel",
    room: "Rm 112",
    start: "12:30",
    end: "13:30",
    color: "periwinkle",
  },
  {
    id: uid(),
    day: "Fri",
    subject: "English Lit",
    teacher: "Mr. Bell",
    room: "Rm 108",
    start: "10:00",
    end: "11:00",
    color: "coral",
  },
  {
    id: uid(),
    day: "Fri",
    subject: "Algebra II",
    teacher: "Ms. Alvarez",
    room: "Rm 204",
    start: "08:00",
    end: "09:00",
    color: "marigold",
  },
];

const SEED_WEEKLY_SCHEDULES = { [weekKeyForOffset(0)]: SEED_SCHEDULE };

const SEED_TASKS = [
  { id: uid(), title: "Grade Algebra II quizzes", due: "2026-08-13", done: false, assigned: "Ms. Alvarez" },
  { id: uid(), title: "Prep biology lab stations", due: "2026-08-12", done: false, assigned: "Mr. Okafor" },
  { id: uid(), title: "Submit field trip permission forms", due: "2026-08-14", done: true, assigned: "Ms. Patel" },
];

const SEED_MESSAGES = [
  {
    id: uid(),
    author: "Ms. Alvarez",
    text: "Reminder: Algebra II quiz moved to Thursday. Bring calculators.",
    time: "Aug 10, 9:14 AM",
  },
  { id: uid(), author: "Front Office", text: "Picture day is rescheduled to next Friday.", time: "Aug 9, 3:40 PM" },
  {
    id: uid(),
    author: "Mr. Okafor",
    text: "Lab reports are due at the start of class — no late submissions.",
    time: "Aug 8, 11:02 AM",
  },
];

const SEED_REQUESTS = [
  {
    id: uid(),
    parent: "Dana Kim",
    teacher: "Ms. Alvarez",
    topic: "Progress check-in",
    message: "Could we set up a quick call about Leo's quiz scores this week?",
    status: "Pending",
    time: "Aug 9, 5:12 PM",
  },
];

const TEACHERS = ["Ms. Alvarez", "Mr. Okafor", "Ms. Patel", "Mr. Bell", "Ms. Reyes"];

/* -------------------------------- types -------------------------------- */

interface ScheduleItem {
  id: string;
  day: string;
  subject: string;
  teacher: string;
  room: string;
  start: string;
  end: string;
  color: string;
}

interface ClipboardData {
  items: ScheduleItem[];
  sourceLabel: string;
}

interface Task {
  id: string;
  title: string;
  due: string;
  done: boolean;
  assigned: string;
}

interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface Request {
  id: string;
  parent: string;
  teacher: string;
  topic: string;
  message: string;
  status: string;
  time: string;
}

/* -------------------------------- shell -------------------------------- */

export default function SchoolApp() {
  const [role, setRole] = useState("teacher");
  const [weeklySchedules, setWeeklySchedules] = useState(SEED_WEEKLY_SCHEDULES);
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [requests, setRequests] = useState(SEED_REQUESTS);

  return (
    <div className="sa-root">
      <style>{CSS}</style>

      <header className="sa-header">
        <div className="sa-brand">
          <span className="sa-brand-mark">HB</span>
          <div className="sa-brand-text">
            <span className="sa-brand-title">Harbor View</span>
            <span className="sa-brand-sub">School Portal</span>
          </div>
        </div>

        <nav className="sa-tabs" role="tablist" aria-label="Dashboard role">
          <RoleTab id="teacher" active={role} onClick={setRole} icon={<GraduationCap size={16} />} label="Teacher" />
          <RoleTab id="student" active={role} onClick={setRole} icon={<UserRound size={16} />} label="Student" />
          <RoleTab id="parent" active={role} onClick={setRole} icon={<Users size={16} />} label="Parent" />
        </nav>
      </header>

      <main className="sa-main">
        {role === "teacher" && (
          <TeacherDashboard
            weeklySchedules={weeklySchedules}
            setWeeklySchedules={setWeeklySchedules}
            tasks={tasks}
            setTasks={setTasks}
            messages={messages}
            setMessages={setMessages}
            requests={requests}
            setRequests={setRequests}
          />
        )}
        {role === "student" && <StudentDashboard weeklySchedules={weeklySchedules} tasks={tasks} messages={messages} />}
        {role === "parent" && (
          <ParentDashboard
            weeklySchedules={weeklySchedules}
            messages={messages}
            requests={requests}
            setRequests={setRequests}
          />
        )}
      </main>
    </div>
  );
}

function RoleTab({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string;
  active: string;
  onClick: (id: string) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active === id}
      className={`sa-tab ${active === id ? "sa-tab--active" : ""}`}
      onClick={() => onClick(id)}>
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------ teacher view ------------------------------ */

function TeacherDashboard({
  weeklySchedules,
  setWeeklySchedules,
  tasks,
  setTasks,
  messages,
  setMessages,
  requests,
  setRequests,
}: {
  weeklySchedules: Record<string, any[]>;
  setWeeklySchedules: (ws: Record<string, any[]> | ((ws: Record<string, any[]>) => Record<string, any[]>)) => void;
  tasks: Task[];
  setTasks: (tasks: Task[] | ((t: Task[]) => Task[])) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((m: Message[]) => Message[])) => void;
  requests: Request[];
  setRequests: (requests: Request[] | ((r: Request[]) => Request[])) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [pasteDate, setPasteDate] = useState(() => weekKeyForOffset(1));
  const [pasteConfirm, setPasteConfirm] = useState("");
  const formCardRef = useRef<HTMLDivElement>(null);

  const weekKey = weekKeyForOffset(weekOffset);
  const weekItems = weeklySchedules[weekKey] || [];
  const editingItem = weekItems.find((s) => s.id === editingId) || null;

  useEffect(() => {
    setEditingId(null);
  }, [weekOffset]);

  useEffect(() => {
    if (editingId && formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingId]);

  function handleSave(item: ScheduleItem) {
    setWeeklySchedules((ws: Record<string, any[]>) => {
      const list = ws[weekKey] || [];
      const exists = list.some((x) => x.id === item.id);
      const updated = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
      return { ...ws, [weekKey]: updated };
    });
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setWeeklySchedules((ws: Record<string, any[]>) => ({
      ...ws,
      [weekKey]: (ws[weekKey] || []).filter((x) => x.id !== id),
    }));
    setEditingId(null);
  }

  function copyWeek() {
    if (weekItems.length === 0) return;
    setClipboard({ items: weekItems, sourceLabel: formatWeekRange(weekOffset) });
    setPasteConfirm("");
  }

  function pasteWeek() {
    if (!clipboard || !pasteDate) return;
    const targetKey = weekKeyForDateString(pasteDate);
    const targetLabel = formatRangeForMonday(getMonday(new Date(`${pasteDate}T00:00:00`)));
    setWeeklySchedules((ws: Record<string, any[]>) => ({
      ...ws,
      [targetKey]: clipboard.items.map((it) => ({ ...it, id: uid() })),
    }));
    setPasteConfirm(`Pasted ${clipboard.items.length} classes into ${targetLabel}.`);
    setTimeout(() => setPasteConfirm(""), 3500);
  }

  return (
    <div className="sa-page">
      <PageIntro
        eyebrow="Teacher dashboard"
        title="Run the week from one board"
        sub="Build the class schedule, keep tasks moving, and post to the shared notice board."
      />

      <div className="sa-grid-2">
        <div ref={formCardRef}>
          <Card
            icon={editingItem ? <Pencil size={17} /> : <CalendarDays size={17} />}
            title={editingItem ? `Edit class — ${editingItem.subject}` : "Create schedule"}
            highlight={!!editingItem}>
            <ScheduleForm
              key={editingItem ? editingItem.id : `new-${weekKey}`}
              initialItem={editingItem}
              onSave={handleSave}
              onCancel={editingItem ? () => setEditingId(null) : undefined}
              onDelete={editingItem ? handleDelete : undefined}
            />
          </Card>
        </div>

        <Card icon={<ClipboardList size={17} />} title="Manage tasks">
          <TaskManager tasks={tasks} setTasks={setTasks} />
        </Card>
      </div>

      <div className="sa-grid-2">
        <Card icon={<Bell size={17} />} title="Notification board">
          <NotificationBoard messages={messages} setMessages={setMessages} editable />
        </Card>

        <Card icon={<Inbox size={17} />} title="Parent requests">
          <RequestsInbox requests={requests} setRequests={setRequests} />
        </Card>
      </div>

      <Card icon={<CalendarDays size={17} />} title="Weekly schedule" wide>
        <p className="sa-hint">
          Each week keeps its own schedule. Click a class to edit or delete it, or copy this week and paste it into
          another.
        </p>

        <div className="sa-week-tools">
          <button className="sa-btn sa-btn--ghost" type="button" onClick={copyWeek} disabled={weekItems.length === 0}>
            <Copy size={14} /> Copy this week{weekItems.length ? ` (${weekItems.length})` : ""}
          </button>

          <div className="sa-paste-group">
            <input type="date" value={pasteDate} onChange={(e) => setPasteDate(e.target.value)} />
            <button
              className="sa-btn sa-btn--ghost"
              type="button"
              onClick={() => setPasteDate(weekKeyForOffset(weekOffset + 1))}>
              Next week
            </button>
            <button className="sa-btn sa-btn--primary" type="button" onClick={pasteWeek} disabled={!clipboard}>
              <Clipboard size={14} /> Paste week
            </button>
          </div>

          {clipboard && (
            <span className="sa-week-tools-note">
              Clipboard: {clipboard.items.length} classes from {clipboard.sourceLabel}
            </span>
          )}
          {pasteConfirm && <span className="sa-confirm">{pasteConfirm}</span>}
        </div>

        {weekItems.length === 0 && (
          <p className="sa-empty-week">No classes added for this week yet — use the form above.</p>
        )}

        <ScheduleGrid
          items={weekItems}
          weekOffset={weekOffset}
          onWeekOffsetChange={setWeekOffset}
          onItemClick={(item) => setEditingId(item.id)}
        />
      </Card>
    </div>
  );
}

function ScheduleForm({
  initialItem,
  onSave,
  onCancel,
  onDelete,
}: {
  initialItem?: ScheduleItem | null;
  onSave: (item: ScheduleItem) => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}) {
  const [day, setDay] = useState(initialItem?.day || "Mon");
  const [subject, setSubject] = useState(initialItem?.subject || "");
  const [teacher, setTeacher] = useState(initialItem?.teacher || "Ms. Alvarez");
  const [room, setRoom] = useState(initialItem?.room || "");
  const [start, setStart] = useState(initialItem?.start || "08:00");
  const [end, setEnd] = useState(initialItem?.end || "09:00");
  const [color, setColor] = useState(initialItem?.color || "marigold");
  const [error, setError] = useState("");

  function submit() {
    if (!subject.trim()) return setError("Add a subject name.");
    if (timeToRowIndex(end) <= timeToRowIndex(start)) return setError("End time must be after start time.");
    setError("");
    onSave({
      id: initialItem?.id || uid(),
      day,
      subject: subject.trim(),
      teacher,
      room: room.trim() || "TBD",
      start,
      end,
      color,
    });
    if (!initialItem) {
      setSubject("");
      setRoom("");
    }
  }

  return (
    <div className="sa-form">
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Day</span>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="sa-field sa-field--grow">
          <span>Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Chemistry"
          />
        </label>
      </div>

      <div className="sa-field-row">
        <label className="sa-field">
          <span>Start</span>
          <select value={start} onChange={(e) => setStart(e.target.value)}>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {fmt12(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="sa-field">
          <span>End</span>
          <select value={end} onChange={(e) => setEnd(e.target.value)}>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {fmt12(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="sa-field">
          <span>Room</span>
          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Rm 204" />
        </label>
      </div>

      <div className="sa-field-row">
        <label className="sa-field sa-field--grow">
          <span>Teacher</span>
          <select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
            {TEACHERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="sa-field">
          <span>Color</span>
          <div className="sa-swatches">
            {SUBJECT_COLORS.map((c) => (
              <button
                type="button"
                key={c.key}
                aria-label={c.key}
                className={`sa-swatch ${color === c.key ? "sa-swatch--active" : ""}`}
                style={{ background: c.hex }}
                onClick={() => setColor(c.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {error && <p className="sa-error">{error}</p>}

      <div className="sa-form-actions">
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          {initialItem ? <Check size={16} /> : <Plus size={16} />}
          {initialItem ? "Save changes" : "Add to schedule"}
        </button>
        {onCancel && (
          <button className="sa-btn sa-btn--ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        {onDelete && initialItem && (
          <button className="sa-btn sa-btn--danger" type="button" onClick={() => onDelete(initialItem.id)}>
            <Trash2 size={14} /> Delete class
          </button>
        )}
      </div>
    </div>
  );
}

function TaskManager({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((t: Task[]) => Task[])) => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [assigned, setAssigned] = useState("Ms. Alvarez");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editAssigned, setEditAssigned] = useState("Ms. Alvarez");

  function addTask() {
    if (!title.trim()) return;
    setTasks((t: Task[]) => [...t, { id: uid(), title: title.trim(), due, done: false, assigned }]);
    setTitle("");
    setDue("");
  }

  function toggle(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function remove(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  function startEdit(t: Task) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDue(t.due);
    setEditAssigned(t.assigned);
  }

  function saveEdit() {
    if (!editTitle.trim()) return;
    setTasks(
      tasks.map((x: Task) =>
        x.id === editingId ? { ...x, title: editTitle.trim(), due: editDue, assigned: editAssigned } : x,
      ),
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const sorted = [...tasks]
    .sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    })
    .sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div>
      <div className="sa-form sa-form--inline">
        <input
          className="sa-field--grow"
          placeholder="New task, e.g. Order lab supplies"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <select value={assigned} onChange={(e) => setAssigned(e.target.value)}>
          {TEACHERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button className="sa-btn sa-btn--primary" type="button" onClick={addTask}>
          <Plus size={16} />
        </button>
      </div>

      <ul className="sa-tasklist">
        {sorted.length === 0 && <p className="sa-empty">No tasks yet — add the first one above.</p>}
        {sorted.map((t) =>
          editingId === t.id ? (
            <li key={t.id} className="sa-task sa-task--editing">
              <div className="sa-task-edit">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                />
                <div className="sa-task-edit-row">
                  <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
                  <select value={editAssigned} onChange={(e) => setEditAssigned(e.target.value)}>
                    {TEACHERS.map((tt) => (
                      <option key={tt} value={tt}>
                        {tt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sa-task-edit-actions">
                <button className="sa-btn sa-btn--primary" type="button" onClick={saveEdit}>
                  <Check size={14} />
                </button>
                <button className="sa-btn sa-btn--ghost" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </li>
          ) : (
            <li key={t.id} className={`sa-task ${t.done ? "sa-task--done" : ""}`}>
              <button className="sa-task-check" onClick={() => toggle(t.id)} aria-label="toggle done">
                {t.done ? <CircleCheckBig size={18} /> : <Circle size={18} />}
              </button>
              <div className="sa-task-body">
                <span className="sa-task-title">{t.title}</span>
                <span className="sa-task-meta">
                  {t.assigned}
                  {t.due ? ` · due ${t.due}` : ""}
                </span>
              </div>
              <button className="sa-icon-btn" onClick={() => startEdit(t)} aria-label="edit task">
                <Pencil size={14} />
              </button>
              <button className="sa-icon-btn" onClick={() => remove(t.id)} aria-label="delete task">
                <Trash2 size={15} />
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function NotificationBoard({
  messages,
  setMessages,
  editable,
}: {
  messages: Message[];
  setMessages: (messages: Message[] | ((m: Message[]) => Message[])) => void;
  editable?: boolean;
}) {
  const [author, setAuthor] = useState("Ms. Alvarez");
  const [text, setText] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("Ms. Alvarez");
  const [editText, setEditText] = useState("");

  function post() {
    if (!text.trim()) return;
    const time = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((m) => [{ id: uid(), author, text: text.trim(), time }, ...m]);
    setText("");
  }

  function startEdit(m: Message) {
    setEditingId(m.id);
    setEditAuthor(m.author);
    setEditText(m.text);
  }

  function saveEdit() {
    if (!editText.trim()) return;
    setMessages((ms) => ms.map((x) => (x.id === editingId ? { ...x, author: editAuthor, text: editText.trim() } : x)));
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function remove(id: string) {
    setMessages((ms) => ms.filter((x) => x.id !== id));
  }

  return (
    <div>
      {editable && (
        <div className="sa-form">
          <div className="sa-field-row">
            <select value={author} onChange={(e) => setAuthor(e.target.value)} className="sa-field--auto">
              {TEACHERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="Front Office">Front Office</option>
            </select>
          </div>
          <textarea
            placeholder="Post an update to the board…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          <button className="sa-btn sa-btn--primary" type="button" onClick={post}>
            <Send size={15} /> Post to board
          </button>
        </div>
      )}

      <div className="sa-board">
        {messages.map((m, i) => {
          const editing = editingId === m.id;
          return (
            <div
              key={m.id}
              className={`sa-note ${editing ? "sa-note--editing" : ""} ${i === 0 && !editing ? "bg-lime-100!" : ""}`}
              style={{ transform: editing ? "none" : `rotate(${(i % 2 === 0 ? -1 : 1) * (1 + (i % 3))}deg)` }}>
              <Pin size={13} className="sa-note-pin" />

              {editable && !editing && (
                <div className="sa-note-actions">
                  <button className="sa-icon-btn" onClick={() => startEdit(m)} aria-label="edit note">
                    <Pencil size={12} />
                  </button>
                  <button className="sa-icon-btn" onClick={() => remove(m.id)} aria-label="delete note">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              {editing ? (
                <div className="sa-note-edit">
                  <select value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)}>
                    {TEACHERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Front Office">Front Office</option>
                  </select>
                  <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <div className="sa-note-edit-actions">
                    <button className="sa-btn sa-btn--primary" type="button" onClick={saveEdit}>
                      <Check size={13} /> Save
                    </button>
                    <button className="sa-btn sa-btn--ghost" type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="sa-note-text">{m.text}</p>
                  <div className="sa-note-meta">
                    <span>{m.author}</span>
                    <span>{m.time}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequestsInbox({
  requests,
  setRequests,
}: {
  requests: Request[];
  setRequests: (requests: Request[] | ((r: Request[]) => Request[])) => void;
}) {
  function respond(id: string) {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: "Responded" } : x)));
  }
  if (requests.length === 0) return <p className="sa-empty">No requests from parents right now.</p>;
  return (
    <ul className="sa-reqlist">
      {requests.map((r) => (
        <li key={r.id} className="sa-req">
          <div className="sa-req-top">
            <span className="sa-req-parent">{r.parent}</span>
            <span className={`sa-badge ${r.status === "Pending" ? "sa-badge--pending" : "sa-badge--done"}`}>
              {r.status}
            </span>
          </div>
          <p className="sa-req-topic">
            To {r.teacher} — {r.topic}
          </p>
          <p className="sa-req-msg">{r.message}</p>
          <div className="sa-req-bottom">
            <span className="sa-req-time">{r.time}</span>
            {r.status === "Pending" && (
              <button className="sa-btn sa-btn--ghost" onClick={() => respond(r.id)}>
                <Check size={14} /> Mark responded
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------ student view ------------------------------ */

function StudentDashboard({
  weeklySchedules,
  tasks,
  messages,
}: {
  weeklySchedules: Record<string, any[]>;
  tasks: Task[];
  messages: Message[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekKey = weekKeyForOffset(weekOffset);
  const weekItems = weeklySchedules[weekKey] || [];

  return (
    <div className="sa-page">
      <PageIntro
        eyebrow="Student dashboard"
        title="Your week at a glance"
        sub="Classes, rooms, and times for Monday through Friday."
      />

      <Card icon={<CalendarDays size={17} />} title="Class schedule" wide>
        {weekItems.length === 0 && <p className="sa-empty-week">No classes posted for this week yet.</p>}
        <ScheduleGrid items={weekItems} weekOffset={weekOffset} onWeekOffsetChange={setWeekOffset} />
      </Card>

      <div className="sa-grid-2">
        <Card icon={<ClipboardList size={17} />} title="Class tasks">
          <ul className="sa-tasklist">
            {tasks.map((t) => (
              <li key={t.id} className={`sa-task ${t.done ? "sa-task--done" : ""}`}>
                <span className="sa-task-check sa-task-check--static">
                  {t.done ? <CircleCheckBig size={18} /> : <Circle size={18} />}
                </span>
                <div className="sa-task-body">
                  <span className="sa-task-title">{t.title}</span>
                  <span className="sa-task-meta">
                    {t.assigned}
                    {t.due ? ` · due ${t.due}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={<Bell size={17} />} title="Notice board">
          <NotificationBoard messages={messages.slice(0, 4)} setMessages={() => {}} editable={false} />
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------ parent view ------------------------------ */

function ParentDashboard({
  weeklySchedules,
  messages,
  requests,
  setRequests,
}: {
  weeklySchedules: Record<string, any[]>;
  messages: Message[];
  requests: Request[];
  setRequests: (requests: Request[] | ((r: Request[]) => Request[])) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekKey = weekKeyForOffset(weekOffset);
  const weekItems = weeklySchedules[weekKey] || [];

  const [teacher, setTeacher] = useState(TEACHERS[0]);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [parentName, setParentName] = useState("Dana Kim");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!topic.trim() || !message.trim()) return;
    const time = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setRequests((r) => [
      { id: uid(), parent: parentName, teacher, topic: topic.trim(), message: message.trim(), status: "Pending", time },
      ...r,
    ]);
    setTopic("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  const mine = requests.filter((r) => r.parent === parentName);

  return (
    <div className="sa-page">
      <PageIntro
        eyebrow="Parent dashboard"
        title="Stay in the loop"
        sub="See the weekly class schedule and reach out to a teacher directly."
      />

      <Card icon={<CalendarDays size={17} />} title="Weekly schedule" wide>
        {weekItems.length === 0 && <p className="sa-empty-week">No classes posted for this week yet.</p>}
        <ScheduleGrid items={weekItems} weekOffset={weekOffset} onWeekOffsetChange={setWeekOffset} />
      </Card>

      <div className="sa-grid-2">
        <Card icon={<Send size={17} />} title="Send a request to a teacher">
          <div className="sa-form">
            <div className="sa-field-row">
              <label className="sa-field sa-field--grow">
                <span>Your name</span>
                <input value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </label>
              <label className="sa-field sa-field--grow">
                <span>Teacher</span>
                <select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
                  {TEACHERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="sa-field">
              <span>Topic</span>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Schedule a call" />
            </label>
            <label className="sa-field">
              <span>Message</span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What would you like to ask?"
              />
            </label>
            <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
              <Send size={15} /> Send request
            </button>
            {sent && <p className="sa-confirm">Sent to {teacher}.</p>}
          </div>
        </Card>

        <Card icon={<Inbox size={17} />} title="Your requests">
          {mine.length === 0 ? (
            <p className="sa-empty">Requests you send will show up here.</p>
          ) : (
            <ul className="sa-reqlist">
              {mine.map((r) => (
                <li key={r.id} className="sa-req">
                  <div className="sa-req-top">
                    <span className="sa-req-parent">To {r.teacher}</span>
                    <span className={`sa-badge ${r.status === "Pending" ? "sa-badge--pending" : "sa-badge--done"}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="sa-req-topic">{r.topic}</p>
                  <p className="sa-req-msg">{r.message}</p>
                  <div className="sa-req-bottom">
                    <span className="sa-req-time">{r.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card icon={<Bell size={17} />} title="Notice board">
        <NotificationBoard messages={messages.slice(0, 3)} setMessages={() => {}} editable={false} />
      </Card>
    </div>
  );
}

/* ------------------------------ shared bits ------------------------------ */

function PageIntro({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="sa-intro">
      <span className="sa-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
  wide,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  highlight?: boolean;
}) {
  return (
    <section className={`sa-card ${wide ? "sa-card--wide" : ""} ${highlight ? "sa-card--highlight" : ""}`}>
      <header className="sa-card-head">
        <span className="sa-card-icon">{icon}</span>
        <h2>{title}</h2>
      </header>
      <div className="sa-card-body">{children}</div>
    </section>
  );
}

function ScheduleGrid({
  items,
  weekOffset,
  onWeekOffsetChange,
  onItemClick,
}: {
  items: ScheduleItem[];
  weekOffset: number;
  onWeekOffsetChange: (offset: number) => void;
  onItemClick?: (item: ScheduleItem) => void;
}) {
  const weekDates = useMemo(() => weekDatesForOffset(weekOffset), [weekOffset]);
  const rangeLabel = useMemo(() => formatWeekRange(weekOffset), [weekOffset]);

  const hourLabels = useMemo(() => {
    const out = [];
    for (let h = START_HOUR; h < END_HOUR; h++) out.push(h);
    return out;
  }, []);

  const colorHex = (key: string) => (SUBJECT_COLORS.find((c) => c.key === key) || SUBJECT_COLORS[0]).hex;

  // Lay out same-day overlapping classes side by side.
  const layoutItems = useMemo(() => {
    const result: (ScheduleItem & { startRow: number; endRow: number; col: number; colCount: number })[] = [];
    for (const day of DAYS) {
      const dayItems = items
        .filter((it) => it.day === day)
        .map((it) => ({ ...it, startRow: timeToRowIndex(it.start), endRow: timeToRowIndex(it.end) }))
        .sort((a, b) => a.startRow - b.startRow || a.endRow - b.endRow);

      let cluster: (ScheduleItem & { startRow: number; endRow: number })[] = [];
      let clusterEnd = -Infinity;
      const clusters: (ScheduleItem & { startRow: number; endRow: number })[][] = [];
      for (const it of dayItems) {
        if (cluster.length === 0 || it.startRow < clusterEnd) {
          cluster.push(it);
          clusterEnd = Math.max(clusterEnd, it.endRow);
        } else {
          clusters.push(cluster);
          cluster = [it];
          clusterEnd = it.endRow;
        }
      }
      if (cluster.length) clusters.push(cluster);

      for (const c of clusters) {
        const colEnds = [];
        const colOf: Record<string, number> = {};
        for (const it of c) {
          let placedCol = -1;
          for (let ci = 0; ci < colEnds.length; ci++) {
            if (colEnds[ci] <= it.startRow) {
              placedCol = ci;
              break;
            }
          }
          if (placedCol === -1) {
            placedCol = colEnds.length;
            colEnds.push(it.endRow);
          } else {
            colEnds[placedCol] = it.endRow;
          }
          colOf[it.id] = placedCol;
        }
        const colCount = colEnds.length;
        for (const it of c) result.push({ ...it, col: colOf[it.id], colCount });
      }
    }
    return result;
  }, [items]);

  return (
    <div>
      <div className="sa-week-nav">
        <button className="sa-week-btn" onClick={() => onWeekOffsetChange(weekOffset - 1)} aria-label="Previous week">
          <ChevronLeft size={16} />
        </button>
        <div className="sa-week-label">
          <span className="sa-week-range">{rangeLabel}</span>
        </div>
        <button className="sa-week-btn" onClick={() => onWeekOffsetChange(weekOffset + 1)} aria-label="Next week">
          <ChevronRight size={16} />
        </button>
        {weekOffset !== 0 && (
          <button className="sa-week-today" onClick={() => onWeekOffsetChange(0)}>
            Back to current week
          </button>
        )}
      </div>

      <div className="sa-gridwrap">
        <div className="sa-schedule" style={{ gridTemplateRows: `2.9rem repeat(${TOTAL_ROWS}, 1.9rem)` }}>
          <div className="sa-corner" style={{ gridColumn: 1, gridRow: 1 }} />
          {DAYS.map((d, i) => (
            <div key={d} className="sa-daylabel" style={{ gridColumn: i + 2, gridRow: 1 }}>
              <span className="sa-daylabel-name">{d}</span>
              <span className="sa-daylabel-date">
                {weekDates[i].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}

          {hourLabels.map((h, i) => (
            <div key={h} className="sa-hourlabel" style={{ gridColumn: 1, gridRow: `${i * 2 + 2} / span 2` }}>
              <Clock3 size={11} />
              {fmt12(`${String(h).padStart(2, "0")}:00`).replace(":00", "")}
            </div>
          ))}

          {hourLabels.map((h, i) => (
            <div
              key={`row-${h}`}
              className="sa-rowline"
              style={{ gridColumn: `2 / -1`, gridRow: `${i * 2 + 2} / span 2` }}
            />
          ))}

          {layoutItems.map((it) => {
            const startRow = it.startRow + 2;
            const endRow = it.endRow + 2;
            const col = DAYS.indexOf(it.day) + 2;
            const gap = 4;
            const widthCss = `calc(${100 / it.colCount}% - ${gap}px)`;
            const marginLeftCss = `calc(${(100 / it.colCount) * it.col}% + ${gap / 2}px)`;
            const narrow = it.colCount > 1;
            return (
              <div
                key={it.id}
                className={`sa-block ${onItemClick ? "sa-block--editable" : ""} ${narrow ? "sa-block--narrow" : ""}`}
                style={{
                  gridColumn: col,
                  gridRow: `${startRow} / ${endRow}`,
                  background: colorHex(it.color),
                  width: widthCss,
                  marginLeft: marginLeftCss,
                  justifySelf: "start",
                }}
                title={`${it.subject} · ${fmt12(it.start)}–${fmt12(it.end)} · ${it.room}`}
                onClick={onItemClick ? () => onItemClick(it) : undefined}
                role={onItemClick ? "button" : undefined}>
                <span className="sa-block-subject">{it.subject}</span>
                <span className="sa-block-meta">
                  {fmt12(it.start)}–{fmt12(it.end)}
                </span>
                {!narrow && <span className="sa-block-meta">{it.room}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- CSS --------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

.sa-root {
  --ink:#1B1F2A; --paper:#F7F3E8; --paper-dim:#EFE9D8; --paper-line:rgba(27,31,42,0.12);
  --navy:#22314A; --navy-deep:#16202F; --marigold:#E8A33D; --sage:#4C7A6B; --coral:#D9695C;
  --pin-red:#D6392E; --white:#FFFDF8;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  min-height: 100%;
  padding-bottom: 3rem;
}
.sa-root * { box-sizing: border-box; }

.sa-header {
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
  padding: 1.1rem 1.5rem; background: var(--navy); color: var(--white);
  flex-wrap: wrap;
  border-bottom: 3px solid var(--marigold);
}
.sa-brand { display:flex; align-items:center; gap:0.7rem; }
.sa-brand-mark {
  font-family:'Fraunces', serif; font-weight:700; font-size:1.05rem;
  background: var(--marigold); color: var(--navy-deep);
  width:2.3rem; height:2.3rem; display:flex; align-items:center; justify-content:center;
  border-radius: 0.5rem;
}
.sa-brand-text { display:flex; flex-direction:column; line-height:1.15; }
.sa-brand-title { font-family:'Fraunces', serif; font-weight:600; font-size:1.15rem; }
.sa-brand-sub { font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:#CBD3E0; }

.sa-tabs { display:flex; gap:0.4rem; background:rgba(255,255,255,0.08); padding:0.3rem; border-radius:0.7rem; }
.sa-tab {
  display:flex; align-items:center; gap:0.4rem; padding:0.5rem 0.9rem;
  background:transparent; border:none; color:#CBD3E0; font-family:'Inter';
  font-size:0.86rem; font-weight:600; border-radius:0.5rem; cursor:pointer;
  transition: all 0.15s ease;
}
.sa-tab:hover { color:var(--white); }
.sa-tab--active { background: var(--marigold); color: var(--navy-deep); }

.sa-main { max-width: 1180px; margin: 0 auto; padding: 1.75rem 1.5rem; }
.sa-page { display:flex; flex-direction:column; gap:1.25rem; }

.sa-intro { padding: 0.5rem 0 0.25rem; }
.sa-eyebrow { font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--sage); font-weight:700; }
.sa-intro h1 { font-family:'Fraunces', serif; font-weight:600; font-size:1.85rem; margin:0.25rem 0 0.35rem; color:var(--navy-deep); }
.sa-intro p { margin:0; color:#5B5F6B; font-size:0.95rem; max-width: 46rem; }

.sa-grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:1.1rem; align-items:start; }
@media (max-width: 860px) { .sa-grid-2 { grid-template-columns: 1fr; } }

.sa-card {
  background: var(--white); border:1px solid var(--paper-line); border-radius:0.9rem;
  padding: 1.15rem 1.2rem 1.3rem; box-shadow: 0 1px 0 rgba(27,31,42,0.03);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.sa-card--wide { grid-column: 1 / -1; }
.sa-card--highlight { border-color: var(--marigold); box-shadow: 0 0 0 3px rgba(232,163,61,0.18); }
.sa-card-head { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.9rem; }
.sa-card-icon { color: var(--sage); display:flex; }
.sa-card-head h2 { font-family:'Fraunces', serif; font-size:1.05rem; font-weight:600; margin:0; color:var(--navy-deep); }

.sa-hint { font-size:0.8rem; color:#8A8D96; margin:0 0 0.8rem; font-style:italic; }

.sa-form { display:flex; flex-direction:column; gap:0.65rem; }
.sa-form--inline { flex-direction:row; flex-wrap:wrap; align-items:center; }
.sa-form--inline input, .sa-form--inline select { flex:1; min-width:8rem; }
.sa-field-row { display:flex; gap:0.6rem; flex-wrap:wrap; }
.sa-field { display:flex; flex-direction:column; gap:0.28rem; font-size:0.78rem; color:#5B5F6B; font-weight:600; flex:1; min-width:7rem; }
.sa-field--grow { flex:2; min-width:10rem; }
.sa-field--auto { width:auto; }

input, select, textarea {
  font-family:'Inter'; font-size:0.9rem; padding:0.5rem 0.65rem;
  border:1px solid var(--paper-line); border-radius:0.5rem; background:var(--paper);
  color: var(--ink); outline:none;
}
input:focus, select:focus, textarea:focus { border-color: var(--sage); background: var(--white); }
textarea { resize: vertical; font-family:'Inter'; width:100%; }

.sa-swatches { display:flex; gap:0.4rem; padding-top:0.15rem; }
.sa-swatch { width:1.5rem; height:1.5rem; border-radius:50%; border:2px solid transparent; cursor:pointer; }
.sa-swatch--active { border-color: var(--navy-deep); }

.sa-form-actions { display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; }

.sa-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:0.4rem;
  font-family:'Inter'; font-weight:700; font-size:0.85rem; padding:0.55rem 1rem;
  border-radius:0.55rem; border:none; cursor:pointer; transition: transform 0.1s ease, opacity 0.15s ease;
  width: fit-content;
}
.sa-btn--primary { background: var(--navy-deep); color: var(--white); }
.sa-btn--primary:hover { opacity:0.9; }
.sa-btn--ghost { background: transparent; border: 1px solid var(--paper-line); color: var(--navy-deep); }
.sa-btn--ghost:hover { background: var(--paper-dim); }
.sa-btn--danger { background: transparent; border: 1px solid var(--coral); color: var(--coral); }
.sa-btn--danger:hover { background: rgba(217,105,92,0.1); }
.sa-btn:disabled { opacity:0.4; cursor:not-allowed; }
.sa-btn:disabled:hover { background: transparent; opacity:0.4; }
.sa-error { color: var(--coral); font-size:0.8rem; margin:0; font-weight:600; }
.sa-confirm { color: var(--sage); font-size:0.82rem; margin:0; font-weight:700; }
.sa-empty { color:#8A8D96; font-size:0.86rem; font-style: italic; }
.sa-empty-week { color:#8A8D96; font-size:0.85rem; font-style: italic; text-align:center; margin:0 0 0.75rem; }

.sa-tasklist { list-style:none; margin:0.9rem 0 0; padding:0; display:flex; flex-direction:column; gap:0.4rem; }
.sa-task { display:flex; align-items:center; gap:0.6rem; padding:0.55rem 0.6rem; border:1px solid var(--paper-line); border-radius:0.55rem; background: var(--paper); }
.sa-task--done { opacity:0.55; }
.sa-task--done .sa-task-title { text-decoration: line-through; }
.sa-task--editing { align-items:flex-start; background: var(--paper-dim); border-color: var(--sage); }
.sa-task-check { background:none; border:none; color: var(--sage); cursor:pointer; display:flex; }
.sa-task-check--static { cursor: default; }
.sa-task-body { display:flex; flex-direction:column; flex:1; }
.sa-task-title { font-weight:600; font-size:0.9rem; }
.sa-task-meta { font-size:0.74rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }
.sa-icon-btn { background:none; border:none; color:#B3A98F; cursor:pointer; display:flex; padding:0.2rem; }
.sa-icon-btn:hover { color: var(--coral); }
.sa-task-edit { display:flex; flex-direction:column; gap:0.4rem; flex:1; }
.sa-task-edit input[type="text"], .sa-task-edit > input { font-size:0.86rem; }
.sa-task-edit-row { display:flex; gap:0.4rem; flex-wrap:wrap; }
.sa-task-edit-row input, .sa-task-edit-row select { flex:1; min-width:7rem; font-size:0.82rem; }
.sa-task-edit-actions { display:flex; gap:0.35rem; align-self:flex-start; }

.sa-board { display:flex; flex-wrap:wrap; gap:0.9rem; margin-top:1rem; }
.sa-note {
  background: #FBF6E8; border:1px solid var(--paper-line); border-radius:0.3rem;
  padding:0.8rem 0.85rem 0.7rem; width: 13.5rem; min-height:6.2rem; position:relative;
  box-shadow: 0 3px 8px rgba(27,31,42,0.08);
}
.sa-note--editing { width: 15.5rem; box-shadow: 0 0 0 2px var(--sage); }
.sa-note-pin { position:absolute; top:-7px; left:50%; transform:translateX(-50%); color: var(--pin-red); filter: drop-shadow(0 1px 1px rgba(0,0,0,0.35)); }
.sa-note-actions { position:absolute; top:6px; right:6px; display:flex; gap:0.15rem; }
.sa-note-actions .sa-icon-btn { background:rgba(255,255,255,0.75); border-radius:0.3rem; padding:0.2rem; }
.sa-note-text { font-size:0.85rem; margin:0.15rem 0 0.8rem; line-height:1.4; padding-right:1.6rem; }
.sa-note-meta { display:flex; justify-content:space-between; font-size:0.7rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }
.sa-note-edit { display:flex; flex-direction:column; gap:0.4rem; margin-top:0.2rem; }
.sa-note-edit select { font-size:0.78rem; padding:0.35rem 0.5rem; }
.sa-note-edit textarea { font-size:0.82rem; padding:0.4rem 0.5rem; }
.sa-note-edit-actions { display:flex; gap:0.4rem; }

.sa-reqlist { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.65rem; }
.sa-req { border:1px solid var(--paper-line); border-radius:0.6rem; padding:0.7rem 0.8rem; background: var(--paper); }
.sa-req-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.2rem; }
.sa-req-parent { font-weight:700; font-size:0.86rem; }
.sa-req-topic { font-size:0.82rem; font-weight:600; color:var(--navy-deep); margin:0.1rem 0; }
.sa-req-msg { font-size:0.83rem; color:#5B5F6B; margin:0.15rem 0 0.5rem; }
.sa-req-bottom { display:flex; justify-content:space-between; align-items:center; }
.sa-req-time { font-size:0.72rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }
.sa-badge { font-size:0.68rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:1rem; text-transform:uppercase; letter-spacing:0.04em; }
.sa-badge--pending { background:#FBE7CE; color:#8A5A15; }
.sa-badge--done { background:#DCEAE4; color:#2E5A48; }

.sa-week-tools { display:flex; flex-wrap:wrap; align-items:center; gap:0.6rem 0.9rem; margin-bottom:0.9rem; padding-bottom:0.9rem; border-bottom:1px dashed var(--paper-line); }
.sa-paste-group { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
.sa-paste-group input[type="date"] { padding:0.4rem 0.5rem; font-size:0.82rem; }
.sa-week-tools-note { font-size:0.76rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }

.sa-week-nav { display:flex; align-items:center; justify-content:center; gap:0.9rem; margin-bottom:0.85rem; }
.sa-week-btn {
  display:flex; align-items:center; justify-content:center; width:1.9rem; height:1.9rem;
  border:1px solid var(--paper-line); border-radius:0.45rem; color:var(--navy-deep);
  background:var(--paper-dim); cursor:pointer;
}
.sa-week-btn:hover { background: var(--paper); border-color: var(--sage); }
.sa-week-label { display:flex; flex-direction:column; align-items:center; gap:0.15rem; min-width:12rem; }
.sa-week-range { font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:0.85rem; color:var(--navy-deep); }
.sa-week-today { background:none; border:none; color:var(--sage); font-size:0.72rem; font-weight:700; cursor:pointer; text-decoration:underline; padding:0; }

.sa-gridwrap { overflow-x:auto; }
.sa-schedule {
  display:grid; grid-template-columns: 4.4rem repeat(5, minmax(7.5rem, 1fr));
  min-width: 42rem; border:1px solid var(--paper-line); border-radius:0.6rem; overflow:hidden;
}
.sa-corner { background: var(--navy-deep); }
.sa-daylabel {
  background: var(--navy-deep); color: var(--white);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.1rem;
  border-left: 1px solid rgba(255,255,255,0.12);
}
.sa-daylabel-name { font-weight:700; font-size:0.8rem; letter-spacing:0.03em; }
.sa-daylabel-date { font-family:'IBM Plex Mono', monospace; font-size:0.64rem; color:#B7C0D6; }
.sa-hourlabel {
  display:flex; align-items:flex-start; justify-content:flex-end; gap:0.2rem;
  font-family:'IBM Plex Mono', monospace; font-size:0.68rem; color:#8A8D96;
  padding:0.15rem 0.4rem 0 0; border-top:1px solid var(--paper-line); background: var(--paper-dim);
}
.sa-rowline { border-top:1px solid var(--paper-line); border-left:1px solid var(--paper-line); }
.sa-block {
  margin-top:2px; margin-bottom:2px; border-radius:0.4rem; padding:0.3rem 0.45rem; color:#fff;
  display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.sa-block--editable { cursor:pointer; transition: transform 0.1s ease, box-shadow 0.1s ease; }
.sa-block--editable:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.28); }
.sa-block--narrow { padding:0.22rem 0.3rem; }
.sa-block--narrow .sa-block-subject { font-size:0.66rem; line-height:1.1; }
.sa-block--narrow .sa-block-meta { font-size:0.58rem; }
.sa-block-subject { font-weight:700; font-size:0.76rem; line-height:1.15; }
.sa-block-meta { font-size:0.66rem; font-family:'IBM Plex Mono', monospace; opacity:0.92; line-height:1.3; }
`;
