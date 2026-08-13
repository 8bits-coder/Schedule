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
import {
  ALL_GRADES,
  DAYS,
  DEFAULT_YEAR,
  END_HOUR,
  SCHOOL_YEARS,
  SEED_CONSENT_RESPONSES,
  SEED_CONSENTS,
  SEED_ENROLLMENTS,
  SEED_GRADE_LEVELS,
  SEED_GRADES,
  SEED_MESSAGES,
  SEED_PARENTS,
  SEED_REQUESTS,
  SEED_SCHEDULE,
  SEED_STUDENTS,
  SEED_TASKS,
  SEED_TEACHER_ACCOUNTS,
  SEED_WEEKLY_SCHEDULES,
  START_HOUR,
  SUBJECT_COLORS,
  TEACHERS,
  TIME_OPTIONS,
  TOTAL_ROWS,
  average,
  fmt12,
  formatRangeForMonday,
  formatWeekRange,
  getMonday,
  gradeAvgClass,
  gradeLevelForYear,
  scheduleKey,
  studentsForYear,
  timeToRowIndex,
  uid,
  weekDatesForOffset,
  weekKeyForDateString,
  weekKeyForOffset,
} from "./schedule-data";
import { CSS } from "./css";

/* -------------------------------- shell -------------------------------- */

export default function SchoolScheduleClient() {
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
  weeklySchedules: { [key: string]: ScheduleItem[] };
  setWeeklySchedules: React.Dispatch<React.SetStateAction<{ [key: string]: ScheduleItem[] }>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  requests: Request[];
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
  students: StudentProfile[];
  setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>;
  enrollments: Enrollment[];
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  parents: ParentProfile[];
  setParents: React.Dispatch<React.SetStateAction<ParentProfile[]>>;
  gradeLevels: string[];
  setGradeLevels: React.Dispatch<React.SetStateAction<string[]>>;
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
  consents: Consent[];
  setConsents: React.Dispatch<React.SetStateAction<Consent[]>>;
  consentResponses: ConsentResponse[];
  schoolYears: string[];
  setSchoolYears: React.Dispatch<React.SetStateAction<string[]>>;
  activeYear: string;
  setActiveYear: React.Dispatch<React.SetStateAction<string>>;
  activeGrade: string;
  setActiveGrade: React.Dispatch<React.SetStateAction<string>>;
  schoolGrades: string[];
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
  const [clipboard, setClipboard] = useState<{ items: ScheduleItem[]; sourceLabel: string } | null>(null);
  const [pasteDate, setPasteDate] = useState(() => weekKeyForOffset(1));
  const [pasteConfirm, setPasteConfirm] = useState("");
  const [filterGrade, setFilterGrade] = useState(ALL_GRADES);

  const teacherAccount = SEED_TEACHER_ACCOUNTS.find((t) => t.id === teacherId) || null;

  const weekKey = weekKeyForOffset(weekOffset);
  const scheduleWeekKey = scheduleKey(activeYear, weekKey);
  const weekItems = weeklySchedules[scheduleWeekKey] || [];
  const editingItem = weekItems.find((s: ScheduleItem) => s.id === editingId) || null;
  const visibleWeekItems =
    filterGrade === ALL_GRADES
      ? weekItems
      : weekItems.filter((it: ScheduleItem) => it.gradeLevel === filterGrade || it.gradeLevel === ALL_GRADES);
  const pendingRequestCount = requests.filter((r: Request) => r.status === "Pending").length;
  const yearStudents = studentsForYear(students, enrollments, activeYear);

  useEffect(() => {
    setEditingId(null);
  }, [weekOffset]);

  if (!teacherAccount) {
    return <TeacherLogin onLogin={setTeacherId} />;
  }

  function handleSave(item: ScheduleItem) {
    setWeeklySchedules((ws: { [key: string]: ScheduleItem[] }) => {
      const list = ws[scheduleWeekKey] || [];
      const exists = list.some((x: ScheduleItem) => x.id === item.id);
      const updated = exists ? list.map((x: ScheduleItem) => (x.id === item.id ? item : x)) : [...list, item];
      return { ...ws, [scheduleWeekKey]: updated };
    });
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setWeeklySchedules((ws: { [key: string]: ScheduleItem[] }) => ({
      ...ws,
      [scheduleWeekKey]: (ws[scheduleWeekKey] || []).filter((x: ScheduleItem) => x.id !== id),
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
    setWeeklySchedules((ws: { [key: string]: ScheduleItem[] }) => ({
      ...ws,
      [targetKey]: clipboard.items.map((it: ScheduleItem) => ({ ...it, id: uid() })),
    }));
    setPasteConfirm(`Pasted ${clipboard.items.length} classes into ${targetLabel}.`);
    setTimeout(() => setPasteConfirm(""), 3500);
  }

  function addStudent(profile: StudentProfile, gradeLevel: string) {
    setStudents((list: StudentProfile[]) => [...list, profile]);
    setEnrollments((list: Enrollment[]) => [
      ...list,
      { id: uid(), studentId: profile.id, year: activeYear, gradeLevel },
    ]);
  }

  function saveStudent(profile: StudentProfile, gradeLevel: string) {
    setStudents((list: StudentProfile[]) => list.map((x: StudentProfile) => (x.id === profile.id ? profile : x)));
    setEnrollments((list: Enrollment[]) => {
      const exists = list.some((e: Enrollment) => e.studentId === profile.id && e.year === activeYear);
      return exists
        ? list.map((e: Enrollment) => (e.studentId === profile.id && e.year === activeYear ? { ...e, gradeLevel } : e))
        : [...list, { id: uid(), studentId: profile.id, year: activeYear, gradeLevel }];
    });
  }

  function deleteStudent(id: string) {
    setStudents((list: StudentProfile[]) => list.filter((x: StudentProfile) => x.id !== id));
    setEnrollments((list: Enrollment[]) => list.filter((e: Enrollment) => e.studentId !== id));
    setGrades((list: Grade[]) => list.filter((g: Grade) => g.studentId !== id));
    setParents((list: ParentProfile[]) =>
      list.map((p: ParentProfile) => ({ ...p, studentIds: p.studentIds.filter((sid: string) => sid !== id) })),
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
  setActiveYear: React.Dispatch<React.SetStateAction<string>>;
  activeGrade: string;
  setActiveGrade: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [newYear, setNewYear] = useState("");

  function addYear() {
    const v = newYear.trim();
    if (!v || schoolYears.includes(v)) return;
    setSchoolYears((list: string[]) => [...list, v]);
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
    ? messages.filter((m: Message) => m.year === activeYear).filter((m: Message) => m.author === author)
    : messages;

  function post() {
    if (!text.trim()) return;
    const time = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((m: Message[]) => [{ id: uid(), author, text: text.trim(), time, gradeLevel, year: activeYear }, ...m]);
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
                {studentGrades.map((g) => (
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
                  <div className="sa-tag-row">
                    {t.gradeLevel && <span className="sa-badge sa-badge--grade">{t.gradeLevel}</span>}
                    {t.year && <span className="sa-badge sa-badge--year">{t.year}</span>}
                  </div>
                </div>
              </li>
            ))}
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
