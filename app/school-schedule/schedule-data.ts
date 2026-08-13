import type {
  Consent,
  ConsentResponse,
  Enrollment,
  Grade,
  Message,
  ParentProfile,
  Request,
  ScheduleItem,
  StudentProfile,
  Task,
  TeacherAccount,
} from "./types";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const START_HOUR = 8;
export const END_HOUR = 16;
export const SLOTS_PER_HOUR = 2;
export const TOTAL_ROWS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;
export const ALL_GRADES = "All Grades";
export const DEFAULT_YEAR = "2026-2027";

export const TIME_OPTIONS = (() => {
  const out: string[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === END_HOUR && m === 30) continue;
      out.push(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
    }
  }
  return out;
})();

export const SUBJECT_COLORS = [
  { key: "marigold", hex: "#E8A33D" },
  { key: "sage", hex: "#4C7A6B" },
  { key: "coral", hex: "#D9695C" },
  { key: "periwinkle", hex: "#6B76B8" },
  { key: "rose", hex: "#B45C77" },
  { key: "navy", hex: "#22314A" },
] as const;

export function timeToRowIndex(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h - START_HOUR) * SLOTS_PER_HOUR + (m === 30 ? 1 : 0);
}

export function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${period}`;
}

export function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function mondayForOffset(offset: number) {
  return addDays(getMonday(new Date()), offset * 7);
}

export function weekKeyForOffset(offset: number) {
  return toDateKey(mondayForOffset(offset));
}

export function weekKeyForDateString(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return toDateKey(getMonday(d));
}

export function scheduleKey(year: string, weekKey: string) {
  return `${year}__${weekKey}`;
}

export function formatRangeForMonday(monday: Date) {
  const friday = addDays(monday, 4);
  const firstStr = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const lastStr = friday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${firstStr} – ${lastStr}, ${friday.getFullYear()}`;
}

export function formatWeekRange(offset: number) {
  return formatRangeForMonday(mondayForOffset(offset));
}

export function weekDatesForOffset(offset: number) {
  const monday = mondayForOffset(offset);
  return DAYS.map((_, i) => addDays(monday, i));
}

export function average(list: { score: number; maxScore: number }[]) {
  if (!list.length) return null;
  return Math.round(list.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / list.length);
}

export function gradeAvgClass(avg: number | null) {
  if (avg === null) return "";
  if (avg >= 90) return "sa-grade-avg--a";
  if (avg >= 80) return "sa-grade-avg--b";
  if (avg >= 70) return "sa-grade-avg--c";
  return "sa-grade-avg--d";
}

export function studentsForYear(students: StudentProfile[], enrollments: Enrollment[], year: string) {
  return students
    .map((s) => {
      const enr = enrollments.find((e) => e.studentId === s.id && e.year === year);
      return enr ? { ...s, gradeLevel: enr.gradeLevel, enrollmentId: enr.id } : null;
    })
    .filter(Boolean);
}

export function gradeLevelForYear(studentId: string, enrollments: Enrollment[], year: string) {
  const enr = enrollments.find((e) => e.studentId === studentId && e.year === year);
  return enr ? enr.gradeLevel : null;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const SCHOOL_YEARS: string[] = ["2024-2025", "2025-2026", "2026-2027"];
export const SEED_GRADE_LEVELS: string[] = ["Grade 3", "Grade 4", "Grade 5"];

export const SEED_SCHEDULE: ScheduleItem[] = [
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

export const SEED_WEEKLY_SCHEDULES: Record<string, typeof SEED_SCHEDULE> = {
  [scheduleKey(DEFAULT_YEAR, weekKeyForOffset(0))]: SEED_SCHEDULE,
};

export const SEED_TASKS: Task[] = [
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

export const SEED_MESSAGES: Message[] = [
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

export const SEED_STUDENTS: StudentProfile[] = [
  { id: uid(), name: "Leo Kim", username: "leo.kim", password: "leo2026" },
  { id: uid(), name: "Maya Chen", username: "maya.chen", password: "maya2026" },
  { id: uid(), name: "Owen Diaz", username: "owen.diaz", password: "owen2026" },
];

export const SEED_ENROLLMENTS: Enrollment[] = [
  { id: uid(), studentId: SEED_STUDENTS[0].id, year: DEFAULT_YEAR, gradeLevel: "Grade 4" },
  { id: uid(), studentId: SEED_STUDENTS[1].id, year: DEFAULT_YEAR, gradeLevel: "Grade 4" },
  { id: uid(), studentId: SEED_STUDENTS[2].id, year: DEFAULT_YEAR, gradeLevel: "Grade 3" },
  { id: uid(), studentId: SEED_STUDENTS[0].id, year: "2025-2026", gradeLevel: "Grade 3" },
];

export const SEED_PARENTS: ParentProfile[] = [
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

export const SEED_REQUESTS: Request[] = [
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

export const SEED_GRADES: Grade[] = [
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

export const CONSENT_ID_1 = uid();
export const SEED_CONSENTS: Consent[] = [
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

export const SEED_CONSENT_RESPONSES: ConsentResponse[] = [
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

export const TEACHERS: string[] = ["Ms. Alvarez", "Mr. Okafor", "Ms. Patel", "Mr. Bell", "Ms. Reyes"];

export const SEED_TEACHER_ACCOUNTS: TeacherAccount[] = [
  { id: uid(), name: "Ms. Alvarez", username: "alvarez", password: "teach2026" },
  { id: uid(), name: "Mr. Okafor", username: "okafor", password: "teach2026" },
  { id: uid(), name: "Ms. Patel", username: "patel", password: "teach2026" },
  { id: uid(), name: "Mr. Bell", username: "bell", password: "teach2026" },
  { id: uid(), name: "Ms. Reyes", username: "reyes", password: "teach2026" },
];
