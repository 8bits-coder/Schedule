"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarDays,
  CalendarRange,
  ClipboardList,
  ClipboardCheck,
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
  Layers,
  Eye,
  Award,
  LogIn,
  LogOut,
  X,
  LucideAlignVerticalSpaceAround,
} from "lucide-react";
import { keyof } from "zod";

/* ----------------------------- constants ----------------------------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 16; // 4pm
const SLOTS_PER_HOUR = 2; // 30-min increments
const TOTAL_ROWS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;
const ALL_GRADES = "All Grades";
const DEFAULT_YEAR = "2026-2027";

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

function timeToRowIndex(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h - START_HOUR) * SLOTS_PER_HOUR + (m === 30 ? 1 : 0);
}

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mondayForOffset(offset: number) {
  return addDays(getMonday(new Date()), offset * 7);
}

function weekKeyForOffset(offset: number) {
  return toDateKey(mondayForOffset(offset));
}

function weekKeyForDateString(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return toDateKey(getMonday(d));
}

function scheduleKey(year: string, weekKey: string) {
  return `${year}__${weekKey}`;
}

function formatRangeForMonday(monday: Date) {
  const friday = addDays(monday, 4);
  const firstStr = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const lastStr = friday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${firstStr} – ${lastStr}, ${friday.getFullYear()}`;
}

function formatWeekRange(offset: number) {
  return formatRangeForMonday(mondayForOffset(offset));
}

function weekDatesForOffset(offset: number) {
  const monday = mondayForOffset(offset);
  return DAYS.map((_, i) => addDays(monday, i));
}

function average(list: { score: number; maxScore: number }[]) {
  if (!list.length) return null;
  return Math.round(list.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / list.length);
}

function gradeAvgClass(avg: number | null) {
  if (avg === null) return "";
  if (avg >= 90) return "sa-grade-avg--a";
  if (avg >= 80) return "sa-grade-avg--b";
  if (avg >= 70) return "sa-grade-avg--c";
  return "sa-grade-avg--d";
}

// Join student profiles with their grade-level enrollment for a given school year.
function studentsForYear(students: StudentProfile[], enrollments: Enrollment[], year: string) {
  return students
    .map((s) => {
      const enr = enrollments.find((e) => e.studentId === s.id && e.year === year);
      return enr ? { ...s, gradeLevel: enr.gradeLevel, enrollmentId: enr.id } : null;
    })
    .filter(Boolean);
}

function gradeLevelForYear(studentId: string, enrollments: Enrollment[], year: string) {
  const enr = enrollments.find((e) => e.studentId === studentId && e.year === year);
  return enr ? enr.gradeLevel : null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------ interfaces ------------------------------ */

interface Enrollment {
  id: string;
  studentId: string;
  year: string;
  gradeLevel: string;
}

interface ScheduleItem {
  id: string;
  day: string;
  subject: string;
  teacher: string;
  room: string;
  start: string;
  end: string;
  color: string;
  gradeLevel: string;
}

interface Task {
  id: string;
  title: string;
  due: string;
  done: boolean;
  assigned: string;
  gradeLevel: string;
  year: string;
}

interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
  gradeLevel: string;
  year: string;
}

interface Request {
  id: string;
  parent: string;
  teacher: string;
  topic: string;
  message: string;
  status: "Pending" | "Resolved";
  time: string;
  reply: string;
  privateNote: string;
  year: string;
}

interface Grade {
  id: string;
  studentId: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
  year: string;
}

interface Consent {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  dueDate: string;
  createdAt: string;
  year: string;
}

interface ConsentResponse {
  id: string;
  consentId: string;
  studentId: string;
  parentName: string;
  status: "Approved" | "Denied";
  note: string;
  respondedAt: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  year: string;
  gradeLevel: string;
}

interface Profile {
  id: string;
  name: string;
  username: string;
  password: string;
}

interface TeacherAccount extends Profile {}
interface StudentProfile extends Profile {
  gradeLevel?: string;
}
interface ParentProfile extends Profile {
  studentIds: string[];
  year: string;
}

/* ------------------------------ seed data ------------------------------ */

const SCHOOL_YEARS: string[] = ["2024-2025", "2025-2026", "2026-2027"];

const SEED_GRADE_LEVELS: string[] = ["Grade 3", "Grade 4", "Grade 5"];

const SEED_SCHEDULE: ScheduleItem[] = [
  {
    id: uid(),
    day: "Mon",
    subject: "Algebra II",
    teacher: "Ms. Alvarez",
    room: "Rm 204",
    start: "08:00",
    end: "09:00",
    color: "marigold",
    gradeLevel: "Grade 4",
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
    gradeLevel: "Grade 4",
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
    gradeLevel: "Grade 5",
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
    gradeLevel: "Grade 4",
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
    gradeLevel: "Grade 3",
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
    gradeLevel: ALL_GRADES,
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
    gradeLevel: "Grade 4",
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
    gradeLevel: ALL_GRADES,
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
    gradeLevel: "Grade 5",
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
    gradeLevel: "Grade 3",
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
    gradeLevel: "Grade 4",
  },
];

const SEED_WEEKLY_SCHEDULES: Record<string, typeof SEED_SCHEDULE> = {
  [scheduleKey(DEFAULT_YEAR, weekKeyForOffset(0))]: SEED_SCHEDULE,
};

const SEED_TASKS: Task[] = [
  {
    id: uid(),
    title: "Grade Algebra II quizzes",
    due: "2026-08-13",
    done: false,
    assigned: "Ms. Alvarez",
    gradeLevel: "Grade 4",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    title: "Prep biology lab stations",
    due: "2026-08-12",
    done: false,
    assigned: "Mr. Okafor",
    gradeLevel: "Grade 4",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    title: "Submit field trip permission forms",
    due: "2026-08-14",
    done: true,
    assigned: "Ms. Patel",
    gradeLevel: "Grade 5",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    title: "Order first-week welcome folders",
    due: "2026-08-11",
    done: false,
    assigned: "Ms. Alvarez",
    gradeLevel: ALL_GRADES,
    year: DEFAULT_YEAR,
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: uid(),
    author: "Ms. Alvarez",
    text: "Reminder: Algebra II quiz moved to Thursday. Bring calculators.",
    time: "Aug 10, 9:14 AM",
    gradeLevel: "Grade 4",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    author: "Front Office",
    text: "Picture day is rescheduled to next Friday.",
    time: "Aug 9, 3:40 PM",
    gradeLevel: ALL_GRADES,
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    author: "Mr. Okafor",
    text: "Lab reports are due at the start of class — no late submissions.",
    time: "Aug 8, 11:02 AM",
    gradeLevel: "Grade 4",
    year: DEFAULT_YEAR,
  },
];

const SEED_STUDENTS: StudentProfile[] = [
  { id: uid(), name: "Leo Kim", username: "leo.kim", password: "leo2026" },
  { id: uid(), name: "Maya Chen", username: "maya.chen", password: "maya2026" },
  { id: uid(), name: "Owen Diaz", username: "owen.diaz", password: "owen2026" },
];

const SEED_ENROLLMENTS: Enrollment[] = [
  { id: uid(), studentId: SEED_STUDENTS[0].id, year: DEFAULT_YEAR, gradeLevel: "Grade 4" },
  { id: uid(), studentId: SEED_STUDENTS[1].id, year: DEFAULT_YEAR, gradeLevel: "Grade 4" },
  { id: uid(), studentId: SEED_STUDENTS[2].id, year: DEFAULT_YEAR, gradeLevel: "Grade 3" },
  { id: uid(), studentId: SEED_STUDENTS[0].id, year: "2025-2026", gradeLevel: "Grade 3" },
];

const SEED_PARENTS: ParentProfile[] = [
  {
    id: uid(),
    name: "Dana Kim",
    username: "dana.kim",
    password: "parent2026",
    studentIds: [SEED_STUDENTS[0].id],
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    name: "Dana Kim",
    username: "dana.kim.2025",
    password: "parent2025",
    studentIds: [SEED_STUDENTS[0].id],
    year: "2025-2026",
  },
];

const SEED_REQUESTS: Request[] = [
  {
    id: uid(),
    parent: "Dana Kim",
    teacher: "Ms. Alvarez",
    topic: "Progress check-in",
    message: "Could we set up a quick call about Leo's quiz scores this week?",
    status: "Pending",
    time: "Aug 9, 5:12 PM",
    reply: "",
    privateNote: "",
    year: DEFAULT_YEAR,
  },
];

const SEED_GRADES: Grade[] = [
  {
    id: uid(),
    studentId: SEED_STUDENTS[0].id,
    subject: "Algebra II",
    assignment: "Chapter 3 Quiz",
    score: 88,
    maxScore: 100,
    date: "2026-08-05",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    studentId: SEED_STUDENTS[0].id,
    subject: "Biology Lab",
    assignment: "Cell Structure Report",
    score: 95,
    maxScore: 100,
    date: "2026-08-07",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    studentId: SEED_STUDENTS[1].id,
    subject: "Algebra II",
    assignment: "Chapter 3 Quiz",
    score: 76,
    maxScore: 100,
    date: "2026-08-05",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    studentId: SEED_STUDENTS[2].id,
    subject: "English Lit",
    assignment: "Reading Journal",
    score: 91,
    maxScore: 100,
    date: "2026-08-06",
    year: DEFAULT_YEAR,
  },
  {
    id: uid(),
    studentId: SEED_STUDENTS[0].id,
    subject: "Reading",
    assignment: "Fall Assessment",
    score: 85,
    maxScore: 100,
    date: "2025-10-02",
    year: "2025-2026",
  },
];

const CONSENT_ID_1 = uid();
const SEED_CONSENTS: Consent[] = [
  {
    id: CONSENT_ID_1,
    title: "Fall Field Trip — Science Museum",
    description:
      "Permission is needed for the Grade 4 field trip to the Science Museum on September 12. Buses depart at 9:00 AM and return by 2:30 PM.",
    gradeLevel: "Grade 4",
    dueDate: "2026-09-05",
    createdAt: "Aug 10, 2026",
    year: DEFAULT_YEAR,
  },
];
const SEED_CONSENT_RESPONSES: ConsentResponse[] = [
  {
    id: uid(),
    consentId: CONSENT_ID_1,
    studentId: SEED_STUDENTS[0].id,
    parentName: "Dana Kim",
    status: "Approved",
    note: "Please note Leo has a peanut allergy.",
    respondedAt: "Aug 10, 2026",
  },
];

const TEACHERS: string[] = ["Ms. Alvarez", "Mr. Okafor", "Ms. Patel", "Mr. Bell", "Ms. Reyes"];

const SEED_TEACHER_ACCOUNTS: TeacherAccount[] = [
  { id: uid(), name: "Ms. Alvarez", username: "alvarez", password: "teach2026" },
  { id: uid(), name: "Mr. Okafor", username: "okafor", password: "teach2026" },
  { id: uid(), name: "Ms. Patel", username: "patel", password: "teach2026" },
  { id: uid(), name: "Mr. Bell", username: "bell", password: "teach2026" },
  { id: uid(), name: "Ms. Reyes", username: "reyes", password: "teach2026" },
];

/* -------------------------------- shell -------------------------------- */

export default function SchoolApp() {
  const [role, setRole] = useState("teacher");
  const [weeklySchedules, setWeeklySchedules] = useState(SEED_WEEKLY_SCHEDULES);
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [students, setStudents] = useState(SEED_STUDENTS);
  const [enrollments, setEnrollments] = useState(SEED_ENROLLMENTS);
  const [parents, setParents] = useState(SEED_PARENTS);
  const [gradeLevels, setGradeLevels] = useState(SEED_GRADE_LEVELS);
  const [grades, setGrades] = useState(SEED_GRADES);
  const [consents, setConsents] = useState(SEED_CONSENTS);
  const [consentResponses, setConsentResponses] = useState(SEED_CONSENT_RESPONSES);
  const [schoolYears, setSchoolYears] = useState<string[]>(SCHOOL_YEARS);
  const [activeYear, setActiveYear] = useState(DEFAULT_YEAR);
  const [activeGrade, setActiveGrade] = useState(ALL_GRADES);
  const [schoolGrades, setSchoolGrades] = useState(SEED_GRADE_LEVELS);

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
            students={students}
            setStudents={setStudents}
            enrollments={enrollments}
            setEnrollments={setEnrollments}
            parents={parents}
            setParents={setParents}
            gradeLevels={gradeLevels}
            setGradeLevels={setGradeLevels}
            grades={grades}
            setGrades={setGrades}
            consents={consents}
            setConsents={setConsents}
            consentResponses={consentResponses}
            schoolYears={schoolYears}
            setSchoolYears={setSchoolYears}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            activeGrade={activeGrade}
            schoolGrades={schoolGrades}
            setActiveGrade={setActiveGrade}
          />
        )}
        {role === "student" && (
          <StudentDashboard
            weeklySchedules={weeklySchedules}
            tasks={tasks}
            messages={messages}
            students={students}
            enrollments={enrollments}
            grades={grades}
            activeYear={activeYear}
          />
        )}
        {role === "parent" && (
          <ParentDashboard
            weeklySchedules={weeklySchedules}
            messages={messages}
            requests={requests}
            setRequests={setRequests}
            students={students}
            enrollments={enrollments}
            parents={parents}
            grades={grades}
            consents={consents}
            consentResponses={consentResponses}
            setConsentResponses={setConsentResponses}
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

/* --------------------------------- modal --------------------------------- */

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sa-modal-head">
          <h3>{title}</h3>
          <button className="sa-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="sa-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------ teacher auth ------------------------------ */

function TeacherLogin({ onLogin }: { onLogin: (value: string) => void }) {
  const [username, setUsername] = useState("alvarez");
  const [password, setPassword] = useState("teach2026");
  const [error, setError] = useState("");

  function submit() {
    const match = SEED_TEACHER_ACCOUNTS.find((t) => t.username === username.trim() && t.password === password);
    if (!match) return setError("Incorrect username or password.");
    setError("");
    onLogin(match.id);
  }

  return (
    <div className="sa-login">
      <div className="sa-login-card">
        <span className="sa-eyebrow">Teacher login</span>
        <h1>Staff sign-in</h1>
        <p>Sign in with your Harbor View staff username and password.</p>
        <label className="sa-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error && <p className="sa-error">{error}</p>}
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <LogIn size={16} /> Log in
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ teacher view ------------------------------ */

function TeacherDashboard(props: {
  weeklySchedules: any;
  setWeeklySchedules: any;
  tasks: any;
  setTasks: any;
  messages: any;
  setMessages: any;
  requests: any;
  setRequests: any;
  students: any;
  setStudents: any;
  enrollments: any;
  setEnrollments: any;
  parents: any;
  setParents: any;
  gradeLevels: string[];
  setGradeLevels: any;
  grades: any;
  setGrades: any;
  consents: any;
  setConsents: any;
  consentResponses: any;
  schoolYears: any;
  setSchoolYears: any;
  activeYear: any;
  setActiveYear: any;
  activeGrade: any;
  setActiveGrade: any;
  schoolGrades: any;
}) {
  const {
    weeklySchedules,
    setWeeklySchedules,
    tasks,
    setTasks,
    messages,
    setMessages,
    requests,
    setRequests,
    students,
    setStudents,
    enrollments,
    setEnrollments,
    parents,
    setParents,
    gradeLevels,
    setGradeLevels,
    grades,
    setGrades,
    consents,
    setConsents,
    consentResponses,
    schoolYears,
    setSchoolYears,
    activeYear,
    setActiveYear,
    activeGrade,
    setActiveGrade,
    schoolGrades,
  } = props;

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{ items: any[]; sourceLabel: string } | null>(null);
  const [pasteDate, setPasteDate] = useState(() => weekKeyForOffset(1));
  const [pasteConfirm, setPasteConfirm] = useState("");
  const [filterGrade, setFilterGrade] = useState(ALL_GRADES);

  const teacherAccount = SEED_TEACHER_ACCOUNTS.find((t) => t.id === teacherId) || null;

  const weekKey = weekKeyForOffset(weekOffset);
  const scheduleWeekKey = scheduleKey(activeYear, weekKey);
  const weekItems = weeklySchedules[scheduleWeekKey] || [];
  const editingItem = weekItems.find((s: { id: string | null }) => s.id === editingId) || null;
  const visibleWeekItems =
    filterGrade === ALL_GRADES
      ? weekItems
      : weekItems.filter((it: { gradeLevel: string }) => it.gradeLevel === filterGrade || it.gradeLevel === ALL_GRADES);
  const pendingRequestCount = requests.filter((r: { status: string }) => r.status === "Pending").length;
  const yearStudents = studentsForYear(students, enrollments, activeYear);

  useEffect(() => {
    setEditingId(null);
  }, [weekOffset]);

  if (!teacherAccount) {
    return <TeacherLogin onLogin={setTeacherId} />;
  }

  function handleSave(item: { id: any }) {
    setWeeklySchedules((ws: { [x: string]: never[] }) => {
      const list = ws[scheduleWeekKey] || [];
      const exists = list.some((x: { id: any }) => x.id === item.id);
      const updated = exists ? list.map((x: { id: any }) => (x.id === item.id ? item : x)) : [...list, item];
      return { ...ws, [scheduleWeekKey]: updated };
    });
    setEditingId(null);
  }

  function handleDelete(id: any) {
    setWeeklySchedules((ws: { [x: string]: any }) => ({
      ...ws,
      [scheduleWeekKey]: (ws[scheduleWeekKey] || []).filter((x: { id: any }) => x.id !== id),
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
    const targetKey = scheduleKey(activeYear, weekKeyForDateString(pasteDate));
    const targetLabel = formatRangeForMonday(getMonday(new Date(`${pasteDate}T00:00:00`)));
    setWeeklySchedules((ws: any) => ({
      ...ws,
      [targetKey]: clipboard.items.map((it: any) => ({ ...it, id: uid() })),
    }));
    setPasteConfirm(`Pasted ${clipboard.items.length} classes into ${targetLabel}.`);
    setTimeout(() => setPasteConfirm(""), 3500);
  }

  function addStudent(profile: StudentProfile, gradeLevel: any) {
    setStudents((list: any) => [...list, profile]);
    setEnrollments((list: any) => [...list, { id: uid(), studentId: profile.id, year: activeYear, gradeLevel }]);
  }

  function saveStudent(profile: StudentProfile, gradeLevel: any) {
    setStudents((list: any[]) => list.map((x: { id: any }) => (x.id === profile.id ? profile : x)));
    setEnrollments((list: any[]) => {
      const exists = list.some(
        (e: { studentId: any; year: any }) => e.studentId === profile.id && e.year === activeYear,
      );
      return exists
        ? list.map((e: { studentId: any; year: any }) =>
            e.studentId === profile.id && e.year === activeYear ? { ...e, gradeLevel } : e,
          )
        : [...list, { id: uid(), studentId: profile.id, year: activeYear, gradeLevel }];
    });
  }

  function deleteStudent(id: any) {
    setStudents((list: any[]) => list.filter((x: { id: any }) => x.id !== id));
    setEnrollments((list: any[]) => list.filter((e: { studentId: any }) => e.studentId !== id));
    setGrades((list: any[]) => list.filter((g: { studentId: any }) => g.studentId !== id));
    setParents((list: any[]) =>
      list.map((p: { studentIds: any[] }) => ({ ...p, studentIds: p.studentIds.filter((sid: any) => sid !== id) })),
    );
  }

  const TABS = [
    { id: "schedule", label: "Schedule", icon: <CalendarDays size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
    { id: "tasks", label: "Tasks", icon: <ClipboardList size={15} /> },
    { id: "requests", label: "Parent Requests", icon: <Inbox size={15} />, badge: pendingRequestCount },
    { id: "consent", label: "Consent", icon: <ClipboardCheck size={15} /> },
    { id: "people", label: "Students & Parents", icon: <Users size={15} /> },
    { id: "grades", label: "Gradebook", icon: <Award size={15} /> },
  ];

  return (
    <div className="sa-page">
      <div className="sa-dash-header">
        <PageIntro
          eyebrow="Teacher dashboard"
          title={`Welcome, ${teacherAccount.name}`}
          sub="Build the class schedule, keep tasks moving, manage accounts, and track grades."
        />
        <button className="sa-btn sa-btn--ghost" onClick={() => setTeacherId(null)}>
          <LogOut size={15} /> Log out
        </button>
      </div>

      <SchoolYearGradeBar
        schoolYears={schoolYears}
        setSchoolYears={setSchoolYears}
        activeYear={activeYear}
        setActiveYear={setActiveYear}
        activeGrade={activeGrade}
        schoolGrades={schoolGrades}
        setActiveGrade={setActiveGrade}
      />

      <nav className="sa-subtabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`sa-subtab ${activeTab === t.id ? "sa-subtab--active" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {!!t.badge && <span className="sa-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      {activeTab === "schedule" && (
        <>
          <Card icon={<CalendarDays size={17} />} title="Create schedule">
            <ScheduleForm key={`new-${weekKey}`} gradeLevels={gradeLevels} onSave={handleSave} />
          </Card>

          <Card icon={<CalendarDays size={17} />} title="Weekly schedule" wide>
            <p className="sa-hint">
              Each week keeps its own schedule. Click a class to edit or delete it, or copy this week and paste it into
              another.
            </p>

            <div className="sa-week-tools">
              <button
                className="sa-btn sa-btn--ghost"
                type="button"
                onClick={copyWeek}
                disabled={weekItems.length === 0}>
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

              <label className="sa-field sa-field--auto">
                <span>Show grade</span>
                <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                  <option value={ALL_GRADES}>All Grades</option>
                  {gradeLevels.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              {clipboard && (
                <span className="sa-week-tools-note">
                  Clipboard: {clipboard.items.length} classes from {clipboard.sourceLabel}
                </span>
              )}
              {pasteConfirm && <span className="sa-confirm">{pasteConfirm}</span>}
            </div>

            {visibleWeekItems.length === 0 && <p className="sa-empty-week">No classes to show for this view.</p>}

            <ScheduleGrid
              items={visibleWeekItems}
              weekOffset={weekOffset}
              onWeekOffsetChange={setWeekOffset}
              onItemClick={(item) => setEditingId(item.id)}
            />
          </Card>

          <Modal
            open={!!editingItem}
            title={editingItem ? `Edit class — ${editingItem.subject}` : ""}
            onClose={() => setEditingId(null)}>
            {editingItem && (
              <ScheduleForm
                key={editingItem.id}
                initialItem={editingItem}
                gradeLevels={gradeLevels}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                onDelete={handleDelete}
              />
            )}
          </Modal>
        </>
      )}

      {activeTab === "notifications" && (
        <Card icon={<Bell size={17} />} title={`Notification board — ${activeYear}`}>
          <NotificationBoard
            messages={messages}
            setMessages={setMessages}
            editable
            gradeLevels={gradeLevels}
            activeYear={activeYear}
          />
        </Card>
      )}

      {activeTab === "tasks" && (
        <Card icon={<ClipboardList size={17} />} title={`Manage tasks — ${activeYear}`}>
          <TaskManager
            tasks={tasks}
            setTasks={setTasks}
            gradeLevels={gradeLevels}
            schoolYears={schoolYears}
            activeYear={activeYear}
            activeGrade={activeGrade}
          />
        </Card>
      )}

      {activeTab === "requests" && (
        <Card icon={<Inbox size={17} />} title={`Parent requests — ${activeYear}`}>
          <RequestsInbox requests={requests} setRequests={setRequests} activeYear={activeYear} />
        </Card>
      )}

      {activeTab === "consent" && (
        <ConsentManager
          consents={consents}
          setConsents={setConsents}
          consentResponses={consentResponses}
          students={yearStudents}
          gradeLevels={gradeLevels}
          activeYear={activeYear}
        />
      )}

      {activeTab === "people" && (
        <PeopleManager
          students={students}
          enrollments={enrollments}
          activeYear={activeYear}
          addStudent={addStudent}
          saveStudent={saveStudent}
          deleteStudent={deleteStudent}
          parents={parents}
          setParents={setParents}
          gradeLevels={gradeLevels}
          setGradeLevels={setGradeLevels}
        />
      )}

      {activeTab === "grades" && (
        <GradeBook
          students={yearStudents.filter((s) => s !== null) as StudentProfile[]}
          gradeLevels={gradeLevels}
          grades={grades}
          setGrades={setGrades}
          activeYear={activeYear}
        />
      )}
    </div>
  );
}

function SchoolYearGradeBar({
  schoolYears,
  schoolGrades,
  setSchoolYears,
  activeYear,
  setActiveYear,
  activeGrade,
  setActiveGrade,
}: {
  schoolYears: string[];
  schoolGrades: string[];
  setSchoolYears: React.Dispatch<React.SetStateAction<string[]>>;
  activeYear: string;
  setActiveYear: (year: string) => void;
  activeGrade: string;
  setActiveGrade: (grade: string) => void;
}) {
  const [newYear, setNewYear] = useState("");

  function addYear() {
    const v = newYear.trim();
    if (!v || schoolYears.includes(v)) return;
    setSchoolYears((list: any) => [...list, v]);
    setActiveYear(v);
    setNewYear("");
  }

  return (
    <div className="sa-year-bar">
      <CalendarRange size={16} />
      <span className="sa-year-label">Academic year</span>
      <select value={activeYear} onChange={(e) => setActiveYear(e.target.value)}>
        {schoolYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <span className="sa-year-divider" />
      <input
        className="sa-year-input"
        placeholder="Add year, e.g. 2027-2028"
        value={newYear}
        onChange={(e) => setNewYear(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addYear()}
      />
      <button className="sa-btn sa-btn--ghost" type="button" onClick={addYear}>
        <Plus size={14} /> Add year
      </button>
      <LucideAlignVerticalSpaceAround size={16} />
      <span className="sa-year-label">Grade Level</span>
      <select value={activeGrade} onChange={(e) => setActiveGrade(e.target.value)}>
        <option value={ALL_GRADES}>All Grades</option>
        {schoolGrades.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScheduleForm({
  initialItem,
  gradeLevels,
  onSave,
  onCancel,
  onDelete,
}: {
  initialItem?: any;
  gradeLevels: string[];
  onSave: (item: any) => void;
  onCancel?: () => void;
  onDelete?: (id: any) => void;
}) {
  const [day, setDay] = useState(initialItem?.day || "Mon");
  const [subject, setSubject] = useState(initialItem?.subject || "");
  const [teacher, setTeacher] = useState(initialItem?.teacher || "Ms. Alvarez");
  const [room, setRoom] = useState(initialItem?.room || "");
  const [start, setStart] = useState(initialItem?.start || "08:00");
  const [end, setEnd] = useState(initialItem?.end || "09:00");
  const [color, setColor] = useState(initialItem?.color || "marigold");
  const [gradeLevel, setGradeLevel] = useState(initialItem?.gradeLevel || gradeLevels[0] || ALL_GRADES);
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
      gradeLevel,
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
        <label className="sa-field sa-field--grow">
          <span>Grade level</span>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            <option value={ALL_GRADES}>All Grades</option>
            {gradeLevels.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

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
        {onDelete && (
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
  gradeLevels,
  schoolYears,
  activeYear,
  activeGrade,
}: {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  gradeLevels: string[];
  schoolYears: string[];
  activeYear: string;
  activeGrade: string;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [assigned, setAssigned] = useState("Ms. Alvarez");
  const [gradeLevel, setGradeLevel] = useState(ALL_GRADES);
  const [year, setYear] = useState(activeYear);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingTask: Task | null = tasks.find((t: Task) => t.id === editingId) || null;

  function addTask() {
    if (!title.trim()) return;
    setTasks((t: Task[]) => [...t, { id: uid(), title: title.trim(), due, done: false, assigned, gradeLevel, year }]);
    setTitle("");
    setDue("");
  }

  function toggle(id: any) {
    setTasks((t: Task[]) => t.map((x: Task) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  const sorted = [...tasks]
    .filter((t) => t.year === activeYear)
    .filter((t) => (activeGrade === ALL_GRADES ? true : t.gradeLevel === activeGrade))
    .sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div>
      <div className="sa-form">
        <div className="sa-field-row">
          <label className="sa-field sa-field--grow">
            <span>Task</span>
            <input
              placeholder="New task, e.g. Order lab supplies"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </label>
          <label className="sa-field">
            <span>Due date</span>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="sa-field">
            <span>Assigned to</span>
            <select value={assigned} onChange={(e) => setAssigned(e.target.value)}>
              {TEACHERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="sa-field-row">
          <label className="sa-field">
            <span>Grade level</span>
            <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
              <option value={ALL_GRADES}>All Grades</option>
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="sa-field">
            <span>School year</span>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {schoolYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <button className="sa-btn sa-btn--primary" type="button" onClick={addTask} style={{ alignSelf: "flex-end" }}>
            <Plus size={16} /> Add task
          </button>
        </div>
      </div>

      <ul className="sa-tasklist">
        {sorted.length === 0 && <p className="sa-empty">No tasks for {activeYear} yet — add one above.</p>}
        {sorted.map((t) => (
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
              <div className="sa-tag-row">
                {t.gradeLevel && <span className="sa-badge sa-badge--grade">{t.gradeLevel}</span>}
                {t.year && <span className="sa-badge sa-badge--year">{t.year}</span>}
              </div>
            </div>
            <button className="sa-icon-btn" onClick={() => setEditingId(t.id)} aria-label="edit task">
              <Pencil size={14} />
            </button>
          </li>
        ))}
      </ul>

      <Modal open={!!editingTask} title="Edit task" onClose={() => setEditingId(null)}>
        {editingTask && (
          <TaskEditForm
            key={editingTask.id}
            task={editingTask}
            gradeLevels={gradeLevels}
            schoolYears={schoolYears}
            onSave={(updated: Task) => {
              setTasks((ts: Task[]) => ts.map((x: Task) => (x.id === updated.id ? updated : x)));
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
            onDelete={(id: any) => {
              setTasks((ts: any[]) => ts.filter((x: { id: any }) => x.id !== id));
              setEditingId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function TaskEditForm({
  task,
  gradeLevels,
  schoolYears,
  onSave,
  onCancel,
  onDelete,
}: {
  task: Task;
  gradeLevels: string[];
  schoolYears: string[];
  onSave: (task: Task) => void;
  onCancel: () => void;
  onDelete: (id: any) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [due, setDue] = useState(task.due);
  const [assigned, setAssigned] = useState(task.assigned);
  const [gradeLevel, setGradeLevel] = useState(task.gradeLevel || ALL_GRADES);
  const [year, setYear] = useState(task.year || schoolYears[0]);

  function submit() {
    if (!title.trim()) return;
    onSave({ ...task, title: title.trim(), due, assigned, gradeLevel, year });
  }

  return (
    <div className="sa-form">
      <label className="sa-field">
        <span>Task</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </label>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Due date</span>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>
        <label className="sa-field sa-field--grow">
          <span>Assigned to</span>
          <select value={assigned} onChange={(e) => setAssigned(e.target.value)}>
            {TEACHERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Grade level</span>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            <option value={ALL_GRADES}>All Grades</option>
            {gradeLevels.map((g: string) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="sa-field">
          <span>School year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {schoolYears.map((y: string) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sa-form-actions">
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <Check size={16} /> Save changes
        </button>
        <button className="sa-btn sa-btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="sa-btn sa-btn--danger" type="button" onClick={() => onDelete(task.id)}>
          <Trash2 size={14} /> Delete task
        </button>
      </div>
    </div>
  );
}

function NotificationBoard({
  messages,
  setMessages,
  editable,
  gradeLevels,
  activeYear,
}: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  editable: boolean;
  gradeLevels: string[];
  activeYear: string;
}) {
  const [author, setAuthor] = useState("Ms. Alvarez");
  const [text, setText] = useState("");
  const [gradeLevel, setGradeLevel] = useState(ALL_GRADES);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingNote = messages.find((m: Message) => m.id === editingId) || null;
  const visibleMessages = editable
    ? messages
        .filter((m: { year: any }) => m.year === activeYear)
        .filter((m: { author: string }) => m.author === author)
    : messages;

  function post() {
    if (!text.trim()) return;
    const time = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((m: any) => [{ id: uid(), author, text: text.trim(), time, gradeLevel, year: activeYear }, ...m]);
    setText("");
  }

  return (
    <div>
      {editable && (
        <div className="sa-form">
          <div className="sa-field-row">
            <label className="sa-field">
              <span>Posted by</span>
              <select value={author} onChange={(e) => setAuthor(e.target.value)}>
                {TEACHERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Front Office">Front Office</option>
              </select>
            </label>
            <label className="sa-field">
              <span>Grade level</span>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                <option value={ALL_GRADES}>All Grades</option>
                {gradeLevels.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
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

      {editable && visibleMessages.length === 0 && <p className="sa-empty">No notices posted for {activeYear} yet.</p>}

      <div className="sa-board">
        {visibleMessages.map((m, i) => (
          <div key={m.id} className="sa-note" style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (i % 4)}deg)` }}>
            <Pin size={13} className="sa-note-pin" />

            {editable && (
              <button className="sa-note-edit-btn" onClick={() => setEditingId(m.id)} aria-label="edit note">
                <Pencil size={12} />
              </button>
            )}

            <p className="sa-note-text">{m.text}</p>
            <div className="sa-tag-row">
              {m.gradeLevel && <span className="sa-badge sa-badge--grade">{m.gradeLevel}</span>}
            </div>
            <div className="sa-note-meta">
              <span>{m.author}</span>
              <span>
                {m.time}
                {m.year ? ` · ${m.year}` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>

      {editable && (
        <Modal open={!!editingNote} title="Edit notice" onClose={() => setEditingId(null)}>
          {editingNote && (
            <NoteEditForm
              key={editingNote.id}
              note={editingNote}
              gradeLevels={gradeLevels}
              onSave={(updated: Message) => {
                setMessages((ms: Message[]) => ms.map((x: Message) => (x.id === updated.id ? updated : x)));
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={(id: any) => {
                setMessages((ms: Message[]) => ms.filter((x: Message) => x.id !== id));
                setEditingId(null);
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function NoteEditForm({
  note,
  gradeLevels,
  onSave,
  onCancel,
  onDelete,
}: {
  note: Message;
  gradeLevels: string[];
  onSave: (note: Message) => void;
  onCancel: () => void;
  onDelete: (id: any) => void;
}) {
  const [author, setAuthor] = useState(note.author);
  const [text, setText] = useState(note.text);
  const [gradeLevel, setGradeLevel] = useState(note.gradeLevel || ALL_GRADES);

  function submit() {
    if (!text.trim()) return;
    onSave({ ...note, author, text: text.trim(), gradeLevel });
  }

  return (
    <div className="sa-form">
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Posted by</span>
          <select value={author} onChange={(e) => setAuthor(e.target.value)}>
            {TEACHERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="Front Office">Front Office</option>
          </select>
        </label>
        <label className="sa-field">
          <span>Grade level</span>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            <option value={ALL_GRADES}>All Grades</option>
            {gradeLevels.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="sa-hint">Posted under school year {note.year}.</p>
      <label className="sa-field">
        <span>Message</span>
        <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="sa-form-actions">
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <Check size={16} /> Save changes
        </button>
        <button className="sa-btn sa-btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="sa-btn sa-btn--danger" type="button" onClick={() => onDelete(note.id)}>
          <Trash2 size={14} /> Delete post
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ parent requests (teacher side) ------------------------------ */

function RequestsInbox({
  requests,
  setRequests,
  activeYear,
}: {
  requests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
  activeYear: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingRequest = requests.find((r: Request) => r.id === editingId) || null;
  const visible = requests.filter((r: Request) => r.year === activeYear);

  if (visible.length === 0) return <p className="sa-empty">No requests from parents for {activeYear}.</p>;

  return (
    <>
      <ul className="sa-reqlist">
        {visible.map((r) => (
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
            {r.reply && (
              <p className="sa-req-reply">
                <strong>Your reply:</strong> {r.reply}
              </p>
            )}
            {r.privateNote && (
              <p className="sa-req-privatenote">
                <strong>Private note:</strong> {r.privateNote}
              </p>
            )}
            <div className="sa-req-bottom">
              <span className="sa-req-time">{r.time}</span>
              <button className="sa-btn sa-btn--ghost" onClick={() => setEditingId(r.id)}>
                <Pencil size={14} /> {r.reply || r.privateNote ? "Edit reply" : "Reply"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={!!editingRequest} title="Manage request" onClose={() => setEditingId(null)}>
        {editingRequest && (
          <RequestReplyForm
            key={editingRequest.id}
            request={editingRequest}
            onSave={(updated: Request) => {
              setRequests((list: Request[]) => list.map((x: Request) => (x.id === updated.id ? updated : x)));
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </>
  );
}

function RequestReplyForm({
  request,
  onSave,
  onCancel,
}: {
  request: Request;
  onSave: (updated: Request) => void;
  onCancel: () => void;
}) {
  const [reply, setReply] = useState(request.reply || "");
  const [privateNote, setPrivateNote] = useState(request.privateNote || "");
  const [status, setStatus] = useState(request.status);

  function submit() {
    onSave({ ...request, reply: reply.trim(), privateNote: privateNote.trim(), status });
  }

  return (
    <div className="sa-form">
      <div className="sa-request-context">
        <p className="sa-req-topic">
          {request.parent} → {request.teacher} · {request.topic}
        </p>
        <p className="sa-req-msg">{request.message}</p>
      </div>
      <label className="sa-field">
        <span>Reply to parent</span>
        <textarea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your response…"
        />
      </label>
      <label className="sa-field">
        <span>Private note (only you can see this)</span>
        <textarea
          rows={2}
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
          placeholder="Notes for your own records…"
        />
      </label>
      <label className="sa-field">
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value as "Pending" | "Resolved")}>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>
      </label>
      <div className="sa-form-actions">
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <Check size={16} /> Save
        </button>
        <button className="sa-btn sa-btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ consent (teacher side) ------------------------------ */

function ConsentManager({
  consents,
  setConsents,
  consentResponses,
  students,
  gradeLevels,
  activeYear,
}: {
  consents: any;
  setConsents: React.Dispatch<React.SetStateAction<any>>;
  consentResponses: any;
  students: any;
  gradeLevels: string[];
  activeYear: string;
}) {
  const yearConsents = consents.filter((c: { year: any }) => c.year === activeYear);
  return (
    <>
      <Card icon={<ClipboardCheck size={17} />} title={`Request consent for an event — ${activeYear}`}>
        <ConsentForm
          gradeLevels={gradeLevels}
          activeYear={activeYear}
          onAdd={(c: any) => setConsents((list: any) => [...list, c])}
        />
      </Card>

      <Card icon={<ClipboardCheck size={17} />} title={`Consent requests — ${activeYear}`} wide>
        <ConsentList
          consents={yearConsents}
          setConsents={setConsents}
          consentResponses={consentResponses}
          students={students}
          activeYear={activeYear}
        />
      </Card>
    </>
  );
}

function ConsentForm({
  gradeLevels,
  activeYear,
  onAdd,
}: {
  gradeLevels: string[];
  activeYear: string;
  onAdd: (c: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState(ALL_GRADES);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!title.trim()) return setError("Add an event title.");
    if (!description.trim()) return setError("Describe what parents are consenting to.");
    setError("");
    const createdAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    onAdd({
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      gradeLevel,
      dueDate,
      createdAt,
      year: activeYear,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
  }

  return (
    <div className="sa-form">
      <label className="sa-field">
        <span>Event title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fall Field Trip — Science Museum"
        />
      </label>
      <label className="sa-field">
        <span>Details</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are parents consenting to?"
        />
      </label>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Grade level</span>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            <option value={ALL_GRADES}>All Grades</option>
            {gradeLevels.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="sa-field">
          <span>Respond by</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>
      <p className="sa-hint">Only visible to parents linked to school year {activeYear}.</p>
      {error && <p className="sa-error">{error}</p>}
      <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
        <Send size={15} /> Send consent request
      </button>
    </div>
  );
}

function ConsentList({
  consents,
  setConsents,
  consentResponses,
  students,
  activeYear,
}: {
  consents: Consent[];
  setConsents: React.Dispatch<React.SetStateAction<Consent[]>>;
  consentResponses: ConsentResponse[];
  students: StudentProfile[];
  activeYear: string;
}) {
  if (consents.length === 0) return <p className="sa-empty">No consent requests for {activeYear} yet.</p>;

  function targetedStudents(consent: { gradeLevel: string }) {
    return consent.gradeLevel === ALL_GRADES
      ? students
      : students.filter((s: StudentProfile) => s.gradeLevel === consent.gradeLevel);
  }

  function remove(id: string) {
    setConsents((list: Consent[]) => list.filter((x: Consent) => x.id !== id));
  }

  return (
    <div className="sa-consentlist">
      {consents.map((c) => {
        const targets = targetedStudents(c);
        const rows = targets.map((s: StudentProfile) => ({
          student: s,
          response:
            consentResponses.find(
              (r: { consentId: any; studentId: any }) => r.consentId === c.id && r.studentId === s.id,
            ) || null,
        }));
        const approvedCount = rows.filter((r) => r.response?.status === "Approved").length;
        const declinedCount = rows.filter((r) => r.response?.status === "Denied").length;
        const pendingCount = rows.length - approvedCount - declinedCount;

        return (
          <div key={c.id} className="sa-consent-card">
            <div className="sa-consent-head">
              <div>
                <span className="sa-consent-title">{c.title}</span>
                <span className="sa-consent-meta">
                  {c.gradeLevel} · {targets.length} student{targets.length === 1 ? "" : "s"}
                  {c.dueDate ? ` · respond by ${c.dueDate}` : ""}
                </span>
              </div>
              <button className="sa-icon-btn" onClick={() => remove(c.id)} aria-label="delete consent request">
                <Trash2 size={15} />
              </button>
            </div>
            <p className="sa-consent-desc">{c.description}</p>
            <div className="sa-consent-stats">
              <span className="sa-badge sa-badge--done">{approvedCount} approved</span>
              <span className="sa-badge sa-badge--danger">{declinedCount} declined</span>
              <span className="sa-badge sa-badge--pending">{pendingCount} pending</span>
            </div>
            {rows.length > 0 && (
              <ul className="sa-consent-responses">
                {rows.map(({ student, response }) => (
                  <li key={student.id}>
                    <span className="sa-consent-response-name">{student.name}</span>
                    <span
                      className={`sa-badge ${response?.status === "Approved" ? "sa-badge--done" : response?.status === "Denied" ? "sa-badge--danger" : "sa-badge--pending"}`}>
                      {response?.status || "Pending"}
                    </span>
                    {response?.note && <span className="sa-consent-note">“{response.note}”</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ people manager (sub-tabbed) ------------------------------ */

function PeopleManager({
  students,
  enrollments,
  activeYear,
  addStudent,
  saveStudent,
  deleteStudent,
  parents,
  setParents,
  gradeLevels,
  setGradeLevels,
}: {
  students: StudentProfile[];
  enrollments: Enrollment[];
  activeYear: string;
  addStudent: (student: StudentProfile, gradeLevel: string) => void;
  saveStudent: (student: StudentProfile, gradeLevel: string) => void;
  deleteStudent: (studentId: string) => void;
  parents: ParentProfile[];
  setParents: React.Dispatch<React.SetStateAction<ParentProfile[]>>;
  gradeLevels: string[];
  setGradeLevels: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [peopleTab, setPeopleTab] = useState("students");
  const yearParents = parents.filter((p: { year: any }) => p.year === activeYear);

  const SUBTABS = [
    { id: "gradelevels", label: "Grade Levels", icon: <Layers size={14} /> },
    { id: "students", label: "Student Profiles", icon: <GraduationCap size={14} /> },
    { id: "parents", label: "Parent Accounts", icon: <Users size={14} /> },
    { id: "registration", label: "Registration", icon: <Plus size={14} /> },
  ];

  return (
    <>
      <nav className="sa-subtabs sa-subtabs--nested">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            className={`sa-subtab ${peopleTab === t.id ? "sa-subtab--active" : ""}`}
            onClick={() => setPeopleTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {peopleTab === "gradelevels" && (
        <Card icon={<Layers size={17} />} title="Grade levels">
          <GradeLevelManager gradeLevels={gradeLevels} setGradeLevels={setGradeLevels} />
        </Card>
      )}

      {peopleTab === "students" && (
        <Card icon={<GraduationCap size={17} />} title={`Student profiles — ${activeYear}`} wide>
          <StudentList
            students={students}
            enrollments={enrollments}
            activeYear={activeYear}
            gradeLevels={gradeLevels}
            parents={yearParents}
            saveStudent={saveStudent}
            deleteStudent={deleteStudent}
          />
        </Card>
      )}

      {peopleTab === "parents" && (
        <Card icon={<Users size={17} />} title={`Parent accounts — ${activeYear}`} wide>
          <ParentList
            parents={yearParents}
            setParents={setParents}
            students={students}
            enrollments={enrollments}
            activeYear={activeYear}
          />
        </Card>
      )}

      {peopleTab === "registration" && (
        <div className="sa-grid-2">
          <Card icon={<GraduationCap size={17} />} title={`Register a student — ${activeYear}`}>
            <StudentForm gradeLevels={gradeLevels} onAdd={addStudent} />
          </Card>
          <Card icon={<Users size={17} />} title={`Register a parent — ${activeYear}`}>
            <ParentForm
              students={students}
              activeYear={activeYear}
              onAdd={(p: ParentProfile) => setParents((list: ParentProfile[]) => [...list, p])}
            />
          </Card>
        </div>
      )}
    </>
  );
}

function GradeLevelManager({
  gradeLevels,
  setGradeLevels,
}: {
  gradeLevels: string[];
  setGradeLevels: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [name, setName] = useState("");

  function add() {
    const v = name.trim();
    if (!v || gradeLevels.includes(v)) return;
    setGradeLevels((g: any) => [...g, v]);
    setName("");
  }

  function remove(g: any) {
    setGradeLevels((list: any[]) => list.filter((x: any) => x !== g));
  }

  return (
    <div>
      <div className="sa-form sa-form--inline">
        <input
          placeholder="e.g. Grade 6"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="sa-btn sa-btn--primary" type="button" onClick={add}>
          <Plus size={16} />
        </button>
      </div>
      <div className="sa-chips">
        {gradeLevels.length === 0 && <p className="sa-empty">No grade levels yet.</p>}
        {gradeLevels.map((g) => (
          <span key={g} className="sa-chip">
            {g}
            <button onClick={() => remove(g)} aria-label={`remove ${g}`}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StudentForm({
  gradeLevels,
  onAdd,
}: {
  gradeLevels: string[];
  onAdd: (student: StudentProfile, gradeLevel: string) => void;
}) {
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState(gradeLevels[0] || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (gradeLevels.length === 0) {
    return <p className="sa-empty">Add a grade level before creating student accounts.</p>;
  }

  function submit() {
    if (!name.trim()) return setError("Add the student's name.");
    if (!username.trim() || !password.trim()) return setError("Set a username and password.");
    setError("");
    onAdd(
      { id: uid(), name: name.trim(), username: username.trim(), password: password.trim() },
      gradeLevel || gradeLevels[0],
    );
    setName("");
    setUsername("");
    setPassword("");
  }

  return (
    <div className="sa-form">
      <label className="sa-field">
        <span>Student name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Leo Kim" />
      </label>
      <label className="sa-field">
        <span>Grade level</span>
        <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
          {gradeLevels.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="leo.kim" />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a password"
          />
        </label>
      </div>
      {error && <p className="sa-error">{error}</p>}
      <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
        <Plus size={16} /> Create student account
      </button>
    </div>
  );
}

function StudentList({
  students,
  enrollments,
  activeYear,
  gradeLevels,
  parents,
  saveStudent,
  deleteStudent,
}: {
  students: StudentProfile[];
  enrollments: Enrollment[];
  activeYear: string;
  gradeLevels: string[];
  parents: ParentProfile[];
  saveStudent: (student: StudentProfile, gradeLevel: string) => void;
  deleteStudent: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({});

  function parentNamesFor(studentId: any) {
    const linked = parents
      .filter((p: { studentIds: string | any[] }) => p.studentIds.includes(studentId))
      .map((p: { name: any }) => p.name);
    return linked.length ? linked.join(", ") : "—";
  }

  if (students.length === 0) return <p className="sa-empty">No student accounts yet.</p>;

  return (
    <div className="sa-people-wrap">
      <div className="sa-people-table">
        <div className="sa-people-row sa-people-row--head">
          <span>Name</span>
          <span>Grade ({activeYear})</span>
          <span>Username</span>
          <span>Password</span>
          <span>Parent(s)</span>
          <span></span>
        </div>
        {students.map((s: StudentProfile) => {
          const currentGrade = gradeLevelForYear(s.id, enrollments, activeYear);
          return editingId === s.id ? (
            <StudentEditCard
              key={s.id}
              student={s}
              currentGrade={currentGrade}
              gradeLevels={gradeLevels}
              activeYear={activeYear}
              onSave={(profile: any, gradeLevel: any) => {
                saveStudent(profile, gradeLevel);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={(id: any) => {
                deleteStudent(id);
                setEditingId(null);
              }}
            />
          ) : (
            <div key={s.id} className="sa-people-row">
              <span className="sa-people-name">{s.name}</span>
              <span>
                {currentGrade ? (
                  <span className="sa-badge sa-badge--grade">{currentGrade}</span>
                ) : (
                  <span className="sa-badge sa-badge--pending">Not enrolled</span>
                )}
              </span>
              <span className="sa-mono">{s.username}</span>
              <span className="sa-mono">
                {visible[s.id] ? s.password : "••••••••"}
                <button
                  className="sa-icon-btn sa-icon-btn--inline"
                  onClick={() => setVisible((v) => ({ ...v, [s.id]: !v[s.id] }))}
                  aria-label="toggle password visibility">
                  <Eye size={13} />
                </button>
              </span>
              <span className="sa-people-sub">{parentNamesFor(s.id)}</span>
              <div className="sa-people-actions">
                <button className="sa-icon-btn" onClick={() => setEditingId(s.id)} aria-label="edit student">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentEditCard({
  student,
  currentGrade,
  gradeLevels,
  activeYear,
  onSave,
  onCancel,
  onDelete,
}: {
  student: StudentProfile;
  currentGrade: string | null;
  gradeLevels: string[];
  activeYear: string;
  onSave: (profile: StudentProfile, gradeLevel: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(student.name);
  const [gradeLevel, setGradeLevel] = useState(currentGrade || gradeLevels[0] || "");
  const [username, setUsername] = useState(student.username);
  const [password, setPassword] = useState(student.password);

  function submit() {
    if (!name.trim() || !username.trim() || !password.trim()) return;
    onSave({ ...student, name: name.trim(), username: username.trim(), password: password.trim() }, gradeLevel);
  }

  return (
    <div className="sa-people-editcard">
      <div className="sa-field-row">
        <label className="sa-field sa-field--grow">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="sa-field">
          <span>Grade for {activeYear}</span>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            {gradeLevels.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>
      <div className="sa-form-actions">
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <Check size={15} /> Save
        </button>
        <button className="sa-btn sa-btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="sa-btn sa-btn--danger" type="button" onClick={() => onDelete(student.id)}>
          <Trash2 size={14} /> Delete account
        </button>
      </div>
    </div>
  );
}

function ParentForm({
  students,
  activeYear,
  onAdd,
}: {
  students: StudentProfile[];
  activeYear: string;
  onAdd: (parent: ParentProfile) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [linked, setLinked] = useState<string[]>([]);
  const [error, setError] = useState("");

  function toggleLink(id: string) {
    setLinked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  }

  function submit() {
    if (!name.trim()) return setError("Add the parent's name.");
    if (!username.trim() || !password.trim()) return setError("Set a username and password.");
    setError("");
    onAdd({
      id: uid(),
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      studentIds: linked,
      year: activeYear,
    });
    setName("");
    setUsername("");
    setPassword("");
    setLinked([]);
  }

  return (
    <div className="sa-form">
      <label className="sa-field">
        <span>Parent name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dana Kim" />
      </label>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="dana.kim" />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
        </label>
      </div>
      <div className="sa-field">
        <span>Linked student(s)</span>
        <div className="sa-linklist">
          {students.length === 0 && <p className="sa-empty">Add a student account first.</p>}
          {students.map((s: StudentProfile) => (
            <label key={s.id} className="sa-checkline">
              <input type="checkbox" checked={linked.includes(s.id)} onChange={() => toggleLink(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
      </div>
      <p className="sa-hint">
        This account will be tied to school year {activeYear}. Parents can hold a separate account for each year.
      </p>
      {error && <p className="sa-error">{error}</p>}
      <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
        <Plus size={16} /> Create parent account
      </button>
    </div>
  );
}

function ParentList({
  parents,
  setParents,
  students,
  enrollments,
  activeYear,
}: {
  parents: ParentProfile[];
  setParents: React.Dispatch<React.SetStateAction<ParentProfile[]>>;
  students: StudentProfile[];
  enrollments: Enrollment[];
  activeYear: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({});

  function studentLabelsFor(ids: string | any[]) {
    const list = students
      .filter((s: { id: any }) => ids.includes(s.id))
      .map((s: { id: string; name: any }) => {
        const g = gradeLevelForYear(s.id, enrollments, activeYear);
        return `${s.name}${g ? ` (${g})` : ""}`;
      });
    return list.length ? list.join(", ") : "—";
  }

  if (parents.length === 0) return <p className="sa-empty">No parent accounts yet.</p>;

  return (
    <div className="sa-people-wrap">
      <div className="sa-people-table sa-people-table--parents">
        <div className="sa-people-row sa-people-row--head sa-people-row--parents">
          <span>Name</span>
          <span>Username</span>
          <span>Password</span>
          <span>Linked student(s)</span>
          <span></span>
        </div>
        {parents.map((p: ParentProfile) =>
          editingId === p.id ? (
            <ParentEditCard
              key={p.id}
              parent={p}
              students={students}
              onSave={(updated: ParentProfile) => {
                setParents((list: ParentProfile[]) =>
                  list.map((x: ParentProfile) => (x.id === updated.id ? updated : x)),
                );
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onDelete={(id: string) => {
                setParents((list: ParentProfile[]) => list.filter((x: ParentProfile) => x.id !== id));
                setEditingId(null);
              }}
            />
          ) : (
            <div key={p.id} className="sa-people-row sa-people-row--parents">
              <span className="sa-people-name">{p.name}</span>
              <span className="sa-mono">{p.username}</span>
              <span className="sa-mono">
                {visible[p.id] ? p.password : "••••••••"}
                <button
                  className="sa-icon-btn sa-icon-btn--inline"
                  onClick={() => setVisible((v) => ({ ...v, [p.id]: !v[p.id] }))}
                  aria-label="toggle password visibility">
                  <Eye size={13} />
                </button>
              </span>
              <span className="sa-people-sub">{studentLabelsFor(p.studentIds)}</span>
              <div className="sa-people-actions">
                <button className="sa-icon-btn" onClick={() => setEditingId(p.id)} aria-label="edit parent">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ParentEditCard({
  parent,
  students,
  onSave,
  onCancel,
  onDelete,
}: {
  parent: ParentProfile;
  students: StudentProfile[];
  onSave: (updated: ParentProfile) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(parent.name);
  const [username, setUsername] = useState(parent.username);
  const [password, setPassword] = useState(parent.password);
  const [linked, setLinked] = useState(parent.studentIds);

  function toggleLink(id: string) {
    setLinked((l: string[]) => (l.includes(id) ? l.filter((x: string) => x !== id) : [...l, id]));
  }

  function submit() {
    if (!name.trim() || !username.trim() || !password.trim()) return;
    onSave({ ...parent, name: name.trim(), username: username.trim(), password: password.trim(), studentIds: linked });
  }

  return (
    <div className="sa-people-editcard">
      <div className="sa-field-row">
        <label className="sa-field sa-field--grow">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="sa-field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>
      <div className="sa-field">
        <span>Linked student(s)</span>
        <div className="sa-linklist">
          {students.map((s: StudentProfile) => (
            <label key={s.id} className="sa-checkline">
              <input type="checkbox" checked={linked.includes(s.id)} onChange={() => toggleLink(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
      </div>
      <div className="sa-form-actions">
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <Check size={15} /> Save
        </button>
        <button className="sa-btn sa-btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="sa-btn sa-btn--danger" type="button" onClick={() => onDelete(parent.id)}>
          <Trash2 size={14} /> Delete account
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ gradebook ------------------------------ */

function GradeBook({
  students,
  gradeLevels,
  grades,
  setGrades,
  activeYear,
}: {
  students: StudentProfile[];
  gradeLevels: string[];
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
  activeYear: string;
}) {
  const [filterGrade, setFilterGrade] = useState(ALL_GRADES);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");

  const visibleStudents =
    filterGrade === ALL_GRADES ? students : students.filter((s: StudentProfile) => s.gradeLevel === filterGrade);
  const selectedStudent =
    visibleStudents.find((s: StudentProfile) => s.id === selectedStudentId) || visibleStudents[0] || null;
  const studentGrades = selectedStudent
    ? grades.filter((g: Grade) => g.studentId === selectedStudent.id && g.year === activeYear)
    : [];
  const avg = average(studentGrades);

  return (
    <>
      <div className="sa-grid-2">
        <Card icon={<Layers size={17} />} title={`Averages by grade level — ${activeYear}`}>
          <GradeLevelSummary students={students} grades={grades} gradeLevels={gradeLevels} activeYear={activeYear} />
        </Card>
        <Card icon={<Award size={17} />} title="Record a grade">
          <GradeForm
            students={students}
            defaultStudentId={selectedStudent?.id}
            activeYear={activeYear}
            onAdd={(g: any) => setGrades((list: any) => [...list, g])}
          />
        </Card>
      </div>

      <Card icon={<Award size={17} />} title="Student gradebook" wide>
        <div className="sa-gradebook-toolbar">
          <label className="sa-field">
            <span>Grade level</span>
            <select
              value={filterGrade}
              onChange={(e) => {
                setFilterGrade(e.target.value);
                setSelectedStudentId("");
              }}>
              <option value={ALL_GRADES}>All Grades</option>
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="sa-field sa-field--grow">
            <span>Student</span>
            <select value={selectedStudent?.id || ""} onChange={(e) => setSelectedStudentId(e.target.value)}>
              {visibleStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.gradeLevel}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!selectedStudent ? (
          <p className="sa-empty">No students enrolled for {activeYear} yet.</p>
        ) : (
          <>
            <div className="sa-grade-summary">
              <span className="sa-grade-summary-name">{selectedStudent.name}</span>
              <span className={`sa-grade-avg ${gradeAvgClass(avg)}`}>
                {avg === null ? `No grades for ${activeYear}` : `${avg}% average`}
              </span>
            </div>
            {studentGrades.length === 0 ? (
              <p className="sa-empty">
                No grades recorded for {selectedStudent.name} in {activeYear} yet.
              </p>
            ) : (
              <ul className="sa-gradelist">
                {studentGrades.map((g) => (
                  <li key={g.id} className="sa-gradeitem">
                    <div className="sa-gradeitem-main">
                      <span className="sa-gradeitem-subject">{g.subject}</span>
                      <span className="sa-gradeitem-assignment">{g.assignment}</span>
                    </div>
                    <span className="sa-gradeitem-score">
                      {g.score}/{g.maxScore}
                    </span>
                    <span className="sa-gradeitem-date">{g.date}</span>
                    <button
                      className="sa-icon-btn"
                      onClick={() => setGrades((list: any[]) => list.filter((x: { id: any }) => x.id !== g.id))}
                      aria-label="delete grade">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
    </>
  );
}

function GradeForm({
  students,
  defaultStudentId,
  activeYear,
  onAdd,
}: {
  students: StudentProfile[];
  defaultStudentId?: string;
  activeYear: string;
  onAdd: (grade: Grade) => void;
}) {
  const [studentId, setStudentId] = useState(defaultStudentId || students[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [assignment, setAssignment] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  if (students.length === 0) return <p className="sa-empty">No students enrolled for {activeYear} yet.</p>;

  function submit() {
    if (!studentId) return setError("Choose a student.");
    if (!subject.trim() || !assignment.trim()) return setError("Add a subject and assignment name.");
    const s = Number(score);
    const m = Number(maxScore);
    if (score === "" || maxScore === "" || Number.isNaN(s) || Number.isNaN(m) || m <= 0 || s < 0) {
      return setError("Enter a valid score and max score.");
    }
    setError("");
    onAdd({
      id: uid(),
      studentId,
      subject: subject.trim(),
      assignment: assignment.trim(),
      score: s,
      maxScore: m,
      date: date || new Date().toISOString().slice(0, 10),
      year: activeYear,
    });
    setSubject("");
    setAssignment("");
    setScore("");
    setDate("");
  }

  return (
    <div className="sa-form">
      <label className="sa-field">
        <span>Student</span>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.gradeLevel}
            </option>
          ))}
        </select>
      </label>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Algebra II" />
        </label>
        <label className="sa-field sa-field--grow">
          <span>Assignment</span>
          <input value={assignment} onChange={(e) => setAssignment(e.target.value)} placeholder="e.g. Chapter 3 Quiz" />
        </label>
      </div>
      <div className="sa-field-row">
        <label className="sa-field">
          <span>Score</span>
          <input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="88" />
        </label>
        <label className="sa-field">
          <span>Out of</span>
          <input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </label>
        <label className="sa-field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <p className="sa-hint">Recorded under school year {activeYear}.</p>
      {error && <p className="sa-error">{error}</p>}
      <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
        <Plus size={16} /> Record grade
      </button>
    </div>
  );
}

function GradeLevelSummary({
  students,
  grades,
  gradeLevels,
  activeYear,
}: {
  students: StudentProfile[];
  grades: Grade[];
  gradeLevels: string[];
  activeYear: string;
}) {
  if (students.length === 0) return <p className="sa-empty">No students enrolled for {activeYear}.</p>;
  return (
    <div className="sa-gradesummary">
      {gradeLevels.map((level) => {
        const list = students.filter((s: StudentProfile) => s.gradeLevel === level);
        if (!list.length) return null;
        return (
          <div key={level} className="sa-gradesummary-group">
            <h4>{level}</h4>
            <ul>
              {list.map((s) => {
                const avg = average(
                  grades.filter((g: { studentId: any; year: any }) => g.studentId === s.id && g.year === activeYear),
                );
                return (
                  <li key={s.id}>
                    <span>{s.name}</span>
                    <span className={`sa-grade-avg ${gradeAvgClass(avg)}`}>{avg === null ? "—" : `${avg}%`}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ auth screens ------------------------------ */

function StudentLogin({ students, onLogin }: { students: StudentProfile[]; onLogin: (id: string) => void }) {
  const [username, setUsername] = useState("leo.kim");
  const [password, setPassword] = useState("leo2026");
  const [error, setError] = useState("");

  function submit() {
    const match = students.find(
      (s: { username: string; password: string }) => s.username === username.trim() && s.password === password,
    );
    if (!match) return setError("Incorrect username or password.");
    setError("");
    onLogin(match.id);
  }

  return (
    <div className="sa-login">
      <div className="sa-login-card">
        <span className="sa-eyebrow">Student login</span>
        <h1>Welcome back</h1>
        <p>Sign in with the username and password your teacher gave you.</p>
        <label className="sa-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error && <p className="sa-error">{error}</p>}
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <LogIn size={16} /> Log in
        </button>
      </div>
    </div>
  );
}

function ParentLogin({ parents, onLogin }: { parents: ParentProfile[]; onLogin: (id: string) => void }) {
  const [username, setUsername] = useState("dana.kim");
  const [password, setPassword] = useState("parent2026");
  const [error, setError] = useState("");

  function submit() {
    const match = parents.find((p: ParentProfile) => p.username === username.trim() && p.password === password);
    if (!match) return setError("Incorrect username or password.");
    setError("");
    onLogin(match.id);
  }

  return (
    <div className="sa-login">
      <div className="sa-login-card">
        <span className="sa-eyebrow">Parent login</span>
        <h1>Welcome back</h1>
        <p>Sign in with the username and password the school gave you.</p>
        <label className="sa-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error && <p className="sa-error">{error}</p>}
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <LogIn size={16} /> Log in
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ student view ------------------------------ */

function StudentDashboard({
  weeklySchedules,
  tasks,
  messages,
  students,
  enrollments,
  grades,
  activeYear,
}: {
  weeklySchedules: Record<string, ScheduleItem[]>;
  tasks: Task[];
  messages: Message[];
  students: StudentProfile[];
  enrollments: Enrollment[];
  grades: Grade[];
  activeYear: string;
}) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const student = students.find((s: StudentProfile) => s.id === studentId) || null;

  if (!student) {
    return <StudentLogin students={students} onLogin={setStudentId} />;
  }

  const gradeLevel = gradeLevelForYear(student.id, enrollments, activeYear);
  const weekKey = weekKeyForOffset(weekOffset);
  const scheduleWeekKey = scheduleKey(activeYear, weekKey);
  const weekItemsAll = weeklySchedules[scheduleWeekKey] || [];
  const weekItems = gradeLevel
    ? weekItemsAll.filter((it: { gradeLevel: string }) => it.gradeLevel === gradeLevel || it.gradeLevel === ALL_GRADES)
    : [];
  const studentGrades = grades.filter(
    (g: { studentId: any; year: any }) => g.studentId === student.id && g.year === activeYear,
  );
  const avg = average(studentGrades);

  return (
    <div className="sa-page">
      <div className="sa-dash-header">
        <PageIntro
          eyebrow="Student dashboard"
          title={`Hi, ${student.name.split(" ")[0]}`}
          sub={gradeLevel ? `${gradeLevel} · ${activeYear} · your week at a glance` : `Not enrolled for ${activeYear}`}
        />
        <button className="sa-btn sa-btn--ghost" onClick={() => setStudentId(null)}>
          <LogOut size={15} /> Log out
        </button>
      </div>

      <Card icon={<CalendarDays size={17} />} title="Class schedule" wide>
        {weekItems.length === 0 && <p className="sa-empty-week">No classes posted for this week yet.</p>}
        <ScheduleGrid
          items={weekItems}
          weekOffset={weekOffset}
          onWeekOffsetChange={setWeekOffset}
          onItemClick={function (item: ScheduleItem): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Card>

      <div className="sa-grid-2">
        <Card icon={<Award size={17} />} title={`My grades — ${activeYear}`}>
          {studentGrades.length === 0 ? (
            <p className="sa-empty">No grades recorded yet.</p>
          ) : (
            <>
              <div className="sa-grade-summary">
                <span className="sa-grade-summary-name">Overall average</span>
                <span className={`sa-grade-avg ${gradeAvgClass(avg)}`}>{avg}%</span>
              </div>
              <ul className="sa-gradelist">
                {studentGrades.map(
                  (g) => (
                    <li key={g.id} className="sa-gradeitem sa-gradeitem--readonly">
                      <div className="sa-gradeitem-main">
                        <span className="sa-gradeitem-subject">{g.subject}</span>
                        <span className="sa-gradeitem-assignment">{g.assignment}</span>
                      </div>
                      <span className="sa-gradeitem-score">
                        {g.score}/{g.maxScore}
                      </span>
                      <span className="sa-gradeitem-date">{g.date}</span>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </Card>

        <Card icon={<ClipboardList size={17} />} title="Class tasks">
          <ul className="sa-tasklist">
            {tasks.map(
              (t) => (
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
                    <div className="sa-tag-row">
                      {t.gradeLevel && <span className="sa-badge sa-badge--grade">{t.gradeLevel}</span>}
                      {t.year && <span className="sa-badge sa-badge--year">{t.year}</span>}
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </Card>
      </div>

      <Card icon={<Bell size={17} />} title="Notice board">
        <NotificationBoard
          messages={messages.slice(0, 4)}
          setMessages={() => {}}
          editable={false}
          gradeLevels={[]}
          activeYear={""}
        />
      </Card>
    </div>
  );
}

/* ------------------------------ parent view ------------------------------ */

function ParentDashboard({
  weeklySchedules,
  messages,
  requests,
  setRequests,
  students,
  enrollments,
  parents,
  grades,
  consents,
  consentResponses,
  setConsentResponses,
}: {
  weeklySchedules: Record<string, ScheduleItem[]>;
  messages: Message[];
  requests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
  students: StudentProfile[];
  enrollments: Enrollment[];
  parents: ParentProfile[];
  grades: Grade[];
  consents: Consent[];
  consentResponses: ConsentResponse[];
  setConsentResponses: React.Dispatch<React.SetStateAction<ConsentResponse[]>>;
}) {
  const [parentId, setParentId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [teacher, setTeacher] = useState(TEACHERS[0]);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const parent = parents.find((p) => p.id === parentId) || null;

  if (!parent) {
    return <ParentLogin parents={parents} onLogin={setParentId} />;
  }

  const parentName = parent.name;
  const parentYear = parent.year;
  const children = students.filter((s) => parent.studentIds.includes(s.id));
  const activeChild = children.find((c) => c.id === activeChildId) || children[0] || null;
  const childGradeLevel = activeChild ? gradeLevelForYear(activeChild.id, enrollments, parentYear) : null;

  const weekKey = weekKeyForOffset(weekOffset);
  const scheduleWeekKey = scheduleKey(parentYear, weekKey);
  const weekItemsAll = SEED_WEEKLY_SCHEDULES[scheduleWeekKey] || [];
  const weekItems = childGradeLevel
    ? weekItemsAll.filter((it) => it.gradeLevel === childGradeLevel || it.gradeLevel === ALL_GRADES)
    : [];
  const childGrades = activeChild ? grades.filter((g) => g.studentId === activeChild.id && g.year === parentYear) : [];
  const avg = average(childGrades);

  function submit() {
    if (!topic.trim() || !message.trim()) return;
    const time = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setRequests((r: any) => [
      {
        id: uid(),
        parent: parentName,
        teacher,
        topic: topic.trim(),
        message: message.trim(),
        status: "Pending",
        time,
        reply: "",
        privateNote: "",
        year: parentYear,
      },
      ...r,
    ]);
    setTopic("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  const mineRequests = requests.filter((r) => r.parent === parentName && r.year === parentYear);
  const mineNotifications = messages.filter((m) => m.gradeLevel === childGradeLevel || m.gradeLevel === ALL_GRADES);

  return (
    <div className="sa-page">
      <div className="sa-dash-header">
        <PageIntro
          eyebrow="Parent dashboard"
          title={`Welcome, ${parentName.split(" ")[0]}`}
          sub={`Account for school year ${parentYear}.`}
        />
        <button className="sa-btn sa-btn--ghost" onClick={() => setParentId(null)}>
          <LogOut size={15} /> Log out
        </button>
      </div>

      {children.length > 1 && (
        <div className="sa-child-tabs">
          {children.map((c) => (
            <button
              key={c.id}
              className={`sa-child-tab ${activeChild?.id === c.id ? "sa-child-tab--active" : ""}`}
              onClick={() => setActiveChildId(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {!activeChild ? (
        <Card icon={<Users size={17} />} title="No linked students">
          <p className="sa-empty">Ask your teacher to link your account to a student in Students &amp; parents.</p>
        </Card>
      ) : (
        <>
          <Card icon={<CalendarDays size={17} />} title={`${activeChild.name}'s weekly schedule`} wide>
            {!childGradeLevel && (
              <p className="sa-empty-week">
                {activeChild.name} isn't enrolled for {parentYear} yet.
              </p>
            )}
            {childGradeLevel && weekItems.length === 0 && (
              <p className="sa-empty-week">No classes posted for this week yet.</p>
            )}
            <ScheduleGrid
              items={weekItems}
              weekOffset={weekOffset}
              onWeekOffsetChange={setWeekOffset}
              onItemClick={function (item: ScheduleItem): void {
                throw new Error("Function not implemented.");
              }}
            />
          </Card>

          <Card icon={<ClipboardCheck size={17} />} title={`Consent requests — ${parentYear}`} wide>
            <ConsentRequestsCard
              consents={consents}
              consentResponses={consentResponses}
              setConsentResponses={setConsentResponses}
              child={activeChild}
              childGradeLevel={childGradeLevel}
              parentYear={parentYear}
              parentName={parent.name}
            />
          </Card>

          <div className="sa-grid-2">
            <Card icon={<Award size={17} />} title={`${activeChild.name}'s grades — ${parentYear}`}>
              {childGrades.length === 0 ? (
                <p className="sa-empty">No grades recorded yet.</p>
              ) : (
                <>
                  <div className="sa-grade-summary">
                    <span className="sa-grade-summary-name">Overall average</span>
                    <span className={`sa-grade-avg ${gradeAvgClass(avg)}`}>{avg}%</span>
                  </div>
                  <ul className="sa-gradelist">
                    {childGrades.map((g) => (
                      <li key={g.id} className="sa-gradeitem sa-gradeitem--readonly">
                        <div className="sa-gradeitem-main">
                          <span className="sa-gradeitem-subject">{g.subject}</span>
                          <span className="sa-gradeitem-assignment">{g.assignment}</span>
                        </div>
                        <span className="sa-gradeitem-score">
                          {g.score}/{g.maxScore}
                        </span>
                        <span className="sa-gradeitem-date">{g.date}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>

            <Card icon={<Send size={17} />} title="Send a request to a teacher">
              <div className="sa-form">
                <p className="sa-hint">Sending as {parent.name}.</p>
                <label className="sa-field">
                  <span>Teacher</span>
                  <select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
                    {TEACHERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
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
          </div>

          <Card icon={<Inbox size={17} />} title="Your requests">
            {mineRequests.length === 0 ? (
              <p className="sa-empty">Requests you send will show up here.</p>
            ) : (
              <ul className="sa-reqlist">
                {mineRequests.map((r) => (
                  <li key={r.id} className="sa-req">
                    <div className="sa-req-top">
                      <span className="sa-req-parent">To {r.teacher}</span>
                      <span className={`sa-badge ${r.status === "Pending" ? "sa-badge--pending" : "sa-badge--done"}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="sa-req-topic">{r.topic}</p>
                    <p className="sa-req-msg">{r.message}</p>
                    {r.reply && (
                      <p className="sa-req-reply">
                        <strong>Teacher reply:</strong> {r.reply}
                      </p>
                    )}
                    <div className="sa-req-bottom">
                      <span className="sa-req-time">{r.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={<Bell size={17} />} title="Notice board">
            <NotificationBoard
              messages={mineNotifications}
              setMessages={() => {}}
              editable={false}
              gradeLevels={[]}
              activeYear={""}
            />
          </Card>
        </>
      )}
    </div>
  );
}

function ConsentRequestsCard({
  consents,
  consentResponses,
  setConsentResponses,
  child,
  childGradeLevel,
  parentYear,
  parentName,
}: {
  consents: Consent[];
  consentResponses: ConsentResponse[];
  setConsentResponses: React.Dispatch<React.SetStateAction<ConsentResponse[]>>;
  child: { id: any };
  childGradeLevel: string | null;
  parentYear: any;
  parentName: string;
}) {
  const relevant = consents.filter(
    (c: { year: any; gradeLevel: string }) =>
      c.year === parentYear && (c.gradeLevel === ALL_GRADES || c.gradeLevel === childGradeLevel),
  );
  if (relevant.length === 0) return <p className="sa-empty">No consent requests for {parentYear} right now.</p>;

  return (
    <div className="sa-consentlist">
      {relevant.map((c: Consent) => {
        const existing: ConsentResponse | null =
          consentResponses.find((r: ConsentResponse) => r.consentId === c.id && r.studentId === child.id) || null;
        return (
          <ConsentResponseItem
            key={c.id}
            consent={c}
            existing={existing}
            onRespond={(status: any, note: any) => {
              const respondedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
              setConsentResponses((list: any[]) => {
                const others = list.filter(
                  (r: { consentId: any; studentId: any }) => !(r.consentId === c.id && r.studentId === child.id),
                );
                return [
                  ...others,
                  {
                    id: existing?.id || uid(),
                    consentId: c.id,
                    studentId: child.id,
                    parentName,
                    status,
                    note,
                    respondedAt,
                  },
                ];
              });
            }}
          />
        );
      })}
    </div>
  );
}

function ConsentResponseItem({
  consent,
  existing,
  onRespond,
}: {
  consent: Consent;
  existing: ConsentResponse | null;
  onRespond: (status: string, note: string) => void;
}) {
  const [note, setNote] = useState(existing?.note || "");
  const [editing, setEditing] = useState(!existing);

  function respond(status: string) {
    onRespond(status, note.trim());
    setEditing(false);
  }

  return (
    <div className="sa-consent-card">
      <div className="sa-consent-head">
        <div>
          <span className="sa-consent-title">{consent.title}</span>
          <span className="sa-consent-meta">
            {consent.dueDate ? `Respond by ${consent.dueDate}` : "No deadline set"}
          </span>
        </div>
        {existing && !editing && (
          <span className={`sa-badge ${existing.status === "Approved" ? "sa-badge--done" : "sa-badge--danger"}`}>
            {existing.status}
          </span>
        )}
      </div>
      <p className="sa-consent-desc">{consent.description}</p>
      {existing && !editing ? (
        <div className="sa-consent-response-summary">
          {existing.note && <p className="sa-consent-note">Your note: “{existing.note}”</p>}
          <button className="sa-btn sa-btn--ghost" type="button" onClick={() => setEditing(true)}>
            Update response
          </button>
        </div>
      ) : (
        <div className="sa-form">
          <label className="sa-field">
            <span>Note (optional)</span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes for the teacher…"
            />
          </label>
          <div className="sa-form-actions">
            <button className="sa-btn sa-btn--primary" type="button" onClick={() => respond("Approved")}>
              <Check size={15} /> Approve
            </button>
            <button className="sa-btn sa-btn--danger" type="button" onClick={() => respond("Declined")}>
              <X size={15} /> Decline
            </button>
            {existing && (
              <button className="sa-btn sa-btn--ghost" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
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
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`sa-card ${wide ? "sa-card--wide" : ""}`}>
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
  onItemClick: (item: ScheduleItem) => void;
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
    const result = [];
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
          {weekOffset !== 0 && (
            <button className="sa-week-today" onClick={() => onWeekOffsetChange(0)}>
              Back to this week
            </button>
          )}
        </div>
        <button className="sa-week-btn" onClick={() => onWeekOffsetChange(weekOffset + 1)} aria-label="Next week">
          <ChevronRight size={16} />
        </button>
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
            const gradeTag = it.gradeLevel && it.gradeLevel !== ALL_GRADES ? it.gradeLevel : null;
            return (
              <div
                key={it.id}
                className={`sa-block sa-block--editable ${narrow ? "sa-block--narrow" : ""}`}
                style={{
                  gridColumn: col,
                  gridRow: `${startRow} / ${endRow}`,
                  background: colorHex(it.color),
                  width: widthCss,
                  marginLeft: marginLeftCss,
                  justifySelf: "start",
                }}
                title={`${it.subject} · ${fmt12(it.start)}–${fmt12(it.end)} · ${it.room}${gradeTag ? ` · ${gradeTag}` : ""}`}
                onClick={() => onItemClick(it)}
                role="button">
                <span className="sa-block-subject">{it.subject}</span>
                <span className="sa-block-meta">
                  {fmt12(it.start)}–{fmt12(it.end)}
                </span>
                {!narrow && (
                  <span className="sa-block-meta">
                    {gradeTag ? `${gradeTag} · ` : ""}
                    {it.room}
                  </span>
                )}
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

.sa-dash-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; }

.sa-year-bar {
  display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; background:var(--white); border:1px solid var(--paper-line);
  border-radius:0.7rem; padding:0.6rem 0.9rem; color:var(--navy-deep);
}
.sa-year-label { font-weight:700; font-size:0.82rem; }
.sa-year-bar select { font-weight:600; }
.sa-year-divider { width:1px; height:1.4rem; background:var(--paper-line); margin:0 0.2rem; }
.sa-year-input { min-width:11rem; }

.sa-subtabs { display:flex; gap:0.5rem; flex-wrap:wrap; border-bottom:1px solid var(--paper-line); padding-bottom:0.9rem; }
.sa-subtabs--nested { border-bottom:none; padding-bottom:0.2rem; }
.sa-subtab {
  display:flex; align-items:center; gap:0.4rem; padding:0.5rem 0.9rem; border-radius:0.5rem;
  border:1px solid transparent; background:transparent; color:#5B5F6B; font-weight:700; font-size:0.85rem; cursor:pointer;
}
.sa-subtab:hover { background: var(--paper-dim); }
.sa-subtab--active { background: var(--navy-deep); color: var(--white); }
.sa-tab-badge {
  background: var(--coral); color:#fff; font-size:0.65rem; font-weight:800; min-width:1.15rem; height:1.15rem;
  padding:0 0.3rem; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; line-height:1;
}

.sa-grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:1.1rem; align-items:start; }
@media (max-width: 860px) { .sa-grid-2 { grid-template-columns: 1fr; } }

.sa-card {
  background: var(--white); border:1px solid var(--paper-line); border-radius:0.9rem;
  padding: 1.15rem 1.2rem 1.3rem; box-shadow: 0 1px 0 rgba(27,31,42,0.03);
}
.sa-card--wide { grid-column: 1 / -1; }
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
.sa-field--auto { flex: 0 0 auto; min-width: 9rem; }

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
.sa-task-check { background:none; border:none; color: var(--sage); cursor:pointer; display:flex; }
.sa-task-check--static { cursor: default; }
.sa-task-body { display:flex; flex-direction:column; flex:1; gap:0.25rem; }
.sa-task-title { font-weight:600; font-size:0.9rem; }
.sa-task-meta { font-size:0.74rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }
.sa-tag-row { display:flex; gap:0.3rem; flex-wrap:wrap; }
.sa-icon-btn { background:none; border:none; color:#B3A98F; cursor:pointer; display:flex; padding:0.2rem; }
.sa-icon-btn:hover { color: var(--coral); }
.sa-icon-btn--inline { color:#8A8D96; }

.sa-board { display:flex; flex-wrap:wrap; gap:0.9rem; margin-top:1rem; }
.sa-note {
  background: #FBF6E8; border:1px solid var(--paper-line); border-radius:0.3rem;
  padding:0.8rem 0.85rem 0.7rem; width: 13.5rem; min-height:6.2rem; position:relative;
  box-shadow: 0 3px 8px rgba(27,31,42,0.08);
  display:flex; flex-direction:column; gap:0.4rem;
}
.sa-note-pin { position:absolute; top:-7px; left:50%; transform:translateX(-50%); color: var(--pin-red); filter: drop-shadow(0 1px 1px rgba(0,0,0,0.35)); }
.sa-note-edit-btn { position:absolute; top:6px; right:6px; background:rgba(255,255,255,0.75); border:none; border-radius:0.3rem; padding:0.25rem; color:#6B5D3E; cursor:pointer; display:flex; }
.sa-note-edit-btn:hover { color: var(--coral); }
.sa-note-text { font-size:0.85rem; margin:0.15rem 0 0; line-height:1.4; padding-right:1.4rem; }
.sa-note-meta { display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.2rem 0.5rem; font-size:0.7rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }

.sa-reqlist { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.65rem; }
.sa-req { border:1px solid var(--paper-line); border-radius:0.6rem; padding:0.7rem 0.8rem; background: var(--paper); }
.sa-req-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.2rem; }
.sa-req-parent { font-weight:700; font-size:0.86rem; }
.sa-req-topic { font-size:0.82rem; font-weight:600; color:var(--navy-deep); margin:0.1rem 0; }
.sa-req-msg { font-size:0.83rem; color:#5B5F6B; margin:0.15rem 0 0.5rem; }
.sa-req-reply { font-size:0.82rem; color:var(--navy-deep); background:#E7EEFB; border-radius:0.4rem; padding:0.5rem 0.6rem; margin:0.15rem 0 0.5rem; }
.sa-req-privatenote { font-size:0.78rem; color:#8A5A15; background:#FBE7CE; border-radius:0.4rem; padding:0.5rem 0.6rem; margin:0.15rem 0 0.5rem; font-style:italic; }
.sa-req-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem; }
.sa-req-time { font-size:0.72rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; }
.sa-request-context { background:var(--paper); border:1px solid var(--paper-line); border-radius:0.5rem; padding:0.6rem 0.7rem; }
.sa-badge { font-size:0.68rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:1rem; text-transform:uppercase; letter-spacing:0.04em; }
.sa-badge--pending { background:#FBE7CE; color:#8A5A15; }
.sa-badge--done { background:#DCEAE4; color:#2E5A48; }
.sa-badge--danger { background:#FADBD8; color:#96352C; }
.sa-badge--grade { background:#E4E9F2; color:var(--navy-deep); text-transform:none; letter-spacing:0; }
.sa-badge--year { background:#EDE4F7; color:#5B3A8A; text-transform:none; letter-spacing:0; }

.sa-week-tools { display:flex; flex-wrap:wrap; align-items:flex-end; gap:0.6rem 0.9rem; margin-bottom:0.9rem; padding-bottom:0.9rem; border-bottom:1px dashed var(--paper-line); }
.sa-paste-group { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
.sa-paste-group input[type="date"] { padding:0.4rem 0.5rem; font-size:0.82rem; }
.sa-week-tools-note { font-size:0.76rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; align-self:center; }

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

.sa-modal-backdrop {
  position:fixed; inset:0; background:rgba(22,32,47,0.55); display:flex; align-items:center; justify-content:center;
  padding:1rem; z-index:100;
}
.sa-modal {
  background: var(--white); border-radius:0.9rem; width:100%; max-width:30rem; max-height:88vh; overflow-y:auto;
  box-shadow: 0 20px 50px rgba(0,0,0,0.35); border:1px solid var(--paper-line);
}
.sa-modal-head {
  display:flex; align-items:center; justify-content:space-between; padding:1rem 1.2rem; border-bottom:1px solid var(--paper-line);
  position:sticky; top:0; background:var(--white); border-radius:0.9rem 0.9rem 0 0;
}
.sa-modal-head h3 { font-family:'Fraunces', serif; font-size:1.05rem; margin:0; color:var(--navy-deep); }
.sa-modal-close { background:none; border:none; color:#8A8D96; cursor:pointer; display:flex; padding:0.2rem; }
.sa-modal-close:hover { color: var(--coral); }
.sa-modal-body { padding:1.1rem 1.2rem 1.3rem; }

.sa-chips { display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.9rem; }
.sa-chip {
  display:inline-flex; align-items:center; gap:0.35rem; background:var(--paper-dim); border:1px solid var(--paper-line);
  border-radius:1rem; padding:0.3rem 0.5rem 0.3rem 0.7rem; font-size:0.78rem; font-weight:600; color:var(--navy-deep);
}
.sa-chip button { background:none; border:none; color:#8A8D96; cursor:pointer; font-size:0.95rem; line-height:1; padding:0 0.1rem; }
.sa-chip button:hover { color: var(--coral); }

.sa-people-wrap { overflow-x:auto; }
.sa-people-table { display:flex; flex-direction:column; gap:0.4rem; margin-top:0.3rem; min-width:44rem; }
.sa-people-row {
  display:grid; grid-template-columns: 1.3fr 0.9fr 1fr 1fr 1fr auto; gap:0.6rem; align-items:center;
  padding:0.55rem 0.7rem; border:1px solid var(--paper-line); border-radius:0.5rem; background:var(--paper); font-size:0.82rem;
}
.sa-people-row--parents { grid-template-columns: 1.2fr 1fr 1fr 1.4fr auto; }
.sa-people-row--head {
  background:transparent; border:none; font-weight:700; color:#8A8D96; font-size:0.7rem;
  text-transform:uppercase; letter-spacing:0.04em; padding:0 0.7rem;
}
.sa-people-name { font-weight:700; }
.sa-mono { font-family:'IBM Plex Mono', monospace; display:flex; align-items:center; gap:0.3rem; }
.sa-people-sub { color:#8A8D96; font-size:0.78rem; }
.sa-people-actions { display:flex; justify-content:flex-end; }
.sa-people-editcard {
  border:1px solid var(--sage); background:var(--paper-dim); border-radius:0.6rem; padding:0.85rem;
  display:flex; flex-direction:column; gap:0.6rem;
}

.sa-linklist {
  display:flex; flex-direction:column; gap:0.35rem; margin-top:0.3rem; max-height:8.5rem; overflow-y:auto;
  padding:0.5rem; border:1px solid var(--paper-line); border-radius:0.5rem; background:var(--paper);
}
.sa-checkline { display:flex; align-items:center; gap:0.45rem; font-size:0.84rem; font-weight:500; color:var(--ink); }
.sa-checkline input { width:auto; }

.sa-gradebook-toolbar { display:flex; gap:0.7rem; flex-wrap:wrap; margin-bottom:0.9rem; }
.sa-gradesummary { display:flex; flex-direction:column; gap:0.9rem; }
.sa-gradesummary-group h4 { font-family:'Fraunces', serif; font-size:0.88rem; margin:0 0 0.4rem; color:var(--navy-deep); }
.sa-gradesummary-group ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.3rem; }
.sa-gradesummary-group li {
  display:flex; justify-content:space-between; align-items:center; font-size:0.84rem;
  padding:0.35rem 0.55rem; background:var(--paper); border:1px solid var(--paper-line); border-radius:0.4rem;
}
.sa-grade-avg { font-family:'IBM Plex Mono', monospace; font-weight:700; font-size:0.76rem; padding:0.15rem 0.5rem; border-radius:1rem; }
.sa-grade-avg--a { background:#DCEAE4; color:#2E5A48; }
.sa-grade-avg--b { background:#E7EEFB; color:#2C4C8A; }
.sa-grade-avg--c { background:#FBE7CE; color:#8A5A15; }
.sa-grade-avg--d { background:#FADBD8; color:#96352C; }
.sa-grade-summary {
  display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;
  padding-bottom:0.6rem; border-bottom:1px dashed var(--paper-line);
}
.sa-grade-summary-name { font-family:'Fraunces', serif; font-weight:600; font-size:1rem; color:var(--navy-deep); }
.sa-gradelist { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.4rem; }
.sa-gradeitem {
  display:grid; grid-template-columns:1fr auto auto auto; gap:0.6rem; align-items:center;
  padding:0.5rem 0.6rem; border:1px solid var(--paper-line); border-radius:0.5rem; background:var(--paper);
}
.sa-gradeitem--readonly { grid-template-columns:1fr auto auto; }
.sa-gradeitem-main { display:flex; flex-direction:column; }
.sa-gradeitem-subject { font-weight:700; font-size:0.85rem; }
.sa-gradeitem-assignment { font-size:0.76rem; color:#8A8D96; }
.sa-gradeitem-score { font-family:'IBM Plex Mono', monospace; font-weight:700; font-size:0.85rem; color:var(--navy-deep); }
.sa-gradeitem-date { font-family:'IBM Plex Mono', monospace; font-size:0.72rem; color:#8A8D96; }

.sa-login { display:flex; justify-content:center; padding:2.5rem 1rem; }
.sa-login-card {
  background: var(--white); border:1px solid var(--paper-line); border-radius:1rem; padding:1.8rem 1.8rem 2rem;
  max-width:22rem; width:100%; display:flex; flex-direction:column; gap:0.7rem; box-shadow: 0 1px 0 rgba(27,31,42,0.03);
}
.sa-login-card h1 { font-family:'Fraunces', serif; font-size:1.5rem; margin:0.15rem 0 0.1rem; color:var(--navy-deep); }
.sa-login-card > p:not(.sa-error) { color:#5B5F6B; font-size:0.86rem; margin:0 0 0.4rem; }

.sa-child-tabs { display:flex; gap:0.5rem; flex-wrap:wrap; }
.sa-child-tab {
  padding:0.45rem 0.9rem; border-radius:0.5rem; border:1px solid var(--paper-line); background:var(--white);
  font-size:0.82rem; font-weight:700; color:var(--navy-deep); cursor:pointer;
}
.sa-child-tab--active { background: var(--navy-deep); color: var(--white); border-color: var(--navy-deep); }

.sa-consentlist { display:flex; flex-direction:column; gap:0.9rem; }
.sa-consent-card { border:1px solid var(--paper-line); border-radius:0.7rem; padding:0.9rem 1rem; background: var(--paper); }
.sa-consent-head { display:flex; justify-content:space-between; align-items:flex-start; gap:0.6rem; }
.sa-consent-title { display:block; font-family:'Fraunces', serif; font-weight:600; font-size:0.98rem; color:var(--navy-deep); }
.sa-consent-meta { display:block; font-size:0.74rem; color:#8A8D96; font-family:'IBM Plex Mono', monospace; margin-top:0.15rem; }
.sa-consent-desc { font-size:0.85rem; color:#5B5F6B; margin:0.6rem 0 0.7rem; }
.sa-consent-stats { display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.7rem; }
.sa-consent-responses { list-style:none; margin:0; padding:0.7rem 0 0; border-top:1px dashed var(--paper-line); display:flex; flex-direction:column; gap:0.4rem; }
.sa-consent-responses li { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; font-size:0.82rem; }
.sa-consent-response-name { font-weight:600; min-width:7rem; }
.sa-consent-note { color:#8A8D96; font-size:0.78rem; font-style:italic; }
.sa-consent-response-summary { display:flex; flex-direction:column; gap:0.5rem; align-items:flex-start; }
`;
