export interface Enrollment {
  id: string;
  studentId: string;
  year: string;
  gradeLevel: string;
}

export interface ScheduleItem {
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

export interface Task {
  id: string;
  title: string;
  due: string;
  done: boolean;
  assigned: string;
  gradeLevel: string;
  year: string;
}

export interface Message {
  id: string;
  author: string;
  text: string;
  time: string;
  gradeLevel: string;
  year: string;
}

export interface Request {
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

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
  year: string;
}

export interface Consent {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  dueDate: string;
  createdAt: string;
  year: string;
}

export interface ConsentResponse {
  id: string;
  consentId: string;
  studentId: string;
  parentName: string;
  status: "Approved" | "Denied";
  note: string;
  respondedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  username: string;
  password: string;
}

export interface TeacherAccount extends Profile {}

export interface StudentProfile extends Profile {
  gradeLevel?: string;
}

export interface ParentProfile extends Profile {
  studentIds: string[];
  year: string;
}
