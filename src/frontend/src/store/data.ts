// ============================================================
// EduManage Pro - Data Store (Backend Canister + localStorage cache)
// ALL data is now stored in the backend canister so it is
// shared across ALL devices.
// ============================================================

import { createActorWithConfig } from "@/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _backendCache: any = null;
async function getBackend(): Promise<any> {
  if (!_backendCache) {
    _backendCache = await createActorWithConfig();
  }
  return _backendCache;
}

export type Role = "principal" | "teacher" | "student";

export interface User {
  id: string;
  password: string;
  name: string;
  role: Role;
}

export interface Teacher {
  id: string;
  password: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  class: string;
  role: "teacher";
  photo?: string;
}

export interface Student {
  id: string;
  password: string;
  name: string;
  class: string;
  rollNo: string;
  parentName: string;
  parentPhone: string;
  teacherId: string;
  role: "student";
  photo?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "late";
  markedBy: string; // teacher id
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  status: "present" | "absent" | "late";
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvalNote?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "partial";
  method: string;
  description: string;
  receiptNumber?: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  studentId: string;
  teacherId: string;
  class: string;
  subjects: { subject: string; marks: number; maxMarks: number }[];
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  approvedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  postedBy: string; // principal id
  type: "general" | "homework" | "exam";
  targetClass?: string; // undefined = school-wide
  attachment?: string; // base64 data URL (PDF or image)
  attachmentName?: string; // original filename
}

export interface HomeworkPost {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  class: string;
  teacherId: string;
  postedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "holiday" | "exam" | "event";
  date: string;
  description: string;
  createdBy: string;
}

export interface LeaveApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: "teacher" | "student";
  type: "sick" | "casual" | "personal";
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Timetable {
  id: string;
  class: string;
  schedule: {
    [day: string]: { [period: string]: { subject: string; teacher: string } };
  };
  updatedAt: string;
  updatedBy: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNote?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface OnlineExam {
  id: string;
  title: string;
  subject: string;
  duration: number; // minutes
  class: string;
  teacherId: string;
  createdAt: string;
  questions: ExamQuestion[];
  status: "active" | "closed";
}

export interface ExamQuestion {
  id: string;
  type: "mcq" | "short";
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: { questionId: string; answer: string }[];
  score?: number;
  submittedAt: string;
  timeTaken?: number;
}

export interface PortfolioEntry {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  type: "academic" | "sports" | "cultural" | "skill";
  addedBy: string;
}

export interface SuggestionQuery {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  submittedAt: string;
  response?: string;
  respondedAt?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
  class?: string; // for students/teachers
}

// ============================================================
// localStorage keys (for caching only)
// ============================================================
const KEYS = {
  INITIALIZED: "edu_initialized",
  CURRENT_USER: "edu_current_user",
  PRINCIPAL: "edu_principal",
  TEACHERS: "edu_teachers",
  STUDENTS: "edu_students",
  ATTENDANCE: "edu_attendance",
  TEACHER_ATTENDANCE: "edu_teacher_attendance",
  FEES: "edu_fees",
  RESULTS: "edu_results",
  NOTIFICATIONS: "edu_notifications",
  HOMEWORK: "edu_homework",
  CALENDAR: "edu_calendar",
  LEAVES: "edu_leaves",
  TIMETABLE: "edu_timetable",
  EXAMS: "edu_exams",
  EXAM_ATTEMPTS: "edu_exam_attempts",
  PORTFOLIO: "edu_portfolio",
  SUGGESTIONS: "edu_suggestions",
  HALL_TICKET: "edu_hall_ticket_design",
};

// ============================================================
// Generic helpers
// ============================================================
export function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLS<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================================
// Auth
// ============================================================

export interface PrincipalProfile {
  id: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: "principal";
  photo?: string;
  institutionLogo?: string;
  institutionName?: string;
  institutionTagline?: string;
}

const DEFAULT_PRINCIPAL: PrincipalProfile = {
  id: "principal001",
  password: "admin123",
  name: "Dr. Rajesh Kumar",
  email: "",
  phone: "",
  role: "principal",
  photo: "",
  institutionLogo: "",
  institutionName: "Rahmaniyya Public School",
  institutionTagline: "Akampadam",
};

export function getPrincipalProfile(): PrincipalProfile {
  return getLS<PrincipalProfile>(KEYS.PRINCIPAL, DEFAULT_PRINCIPAL);
}

export function savePrincipalProfile(profile: PrincipalProfile): void {
  setLS(KEYS.PRINCIPAL, profile);
}

export function authenticate(
  role: Role,
  id: string,
  password: string,
): CurrentUser | null {
  if (role === "principal") {
    const principal = getPrincipalProfile();
    if (id === principal.id && password === principal.password) {
      return { id: principal.id, name: principal.name, role: "principal" };
    }
    return null;
  }
  if (role === "teacher") {
    const teachers = getLS<Teacher[]>(KEYS.TEACHERS, []);
    const t = teachers.find((x) => x.id === id && x.password === password);
    if (t) return { id: t.id, name: t.name, role: "teacher", class: t.class };
    return null;
  }
  if (role === "student") {
    const students = getLS<Student[]>(KEYS.STUDENTS, []);
    const s = students.find((x) => x.id === id && x.password === password);
    if (s) return { id: s.id, name: s.name, role: "student", class: s.class };
    return null;
  }
  return null;
}

export function getCurrentUser(): CurrentUser | null {
  return getLS<CurrentUser | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: CurrentUser): void {
  setLS(KEYS.CURRENT_USER, user);
}

export function logout(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

// ============================================================
// Data accessors (read from localStorage cache)
// ============================================================

export function getTeachers(): Teacher[] {
  return getLS<Teacher[]>(KEYS.TEACHERS, []);
}
export function saveTeachers(teachers: Teacher[]): void {
  setLS(KEYS.TEACHERS, teachers);
}
export function getTeacherById(id: string): Teacher | undefined {
  return getTeachers().find((t) => t.id === id);
}

export function getStudents(): Student[] {
  return getLS<Student[]>(KEYS.STUDENTS, []);
}
export function saveStudents(students: Student[]): void {
  setLS(KEYS.STUDENTS, students);
}
export function getStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}
export function getStudentsByClass(cls: string): Student[] {
  return getStudents().filter((s) => s.class === cls);
}
export function getStudentsByTeacher(teacherId: string): Student[] {
  return getStudents().filter((s) => s.teacherId === teacherId);
}

export function getAttendance(): AttendanceRecord[] {
  return getLS<AttendanceRecord[]>(KEYS.ATTENDANCE, []);
}
export function saveAttendance(records: AttendanceRecord[]): void {
  setLS(KEYS.ATTENDANCE, records);
}
export function getStudentAttendance(studentId: string): AttendanceRecord[] {
  return getAttendance().filter((a) => a.studentId === studentId);
}

export function getTeacherAttendance(): TeacherAttendance[] {
  return getLS<TeacherAttendance[]>(KEYS.TEACHER_ATTENDANCE, []);
}
export function saveTeacherAttendance(records: TeacherAttendance[]): void {
  setLS(KEYS.TEACHER_ATTENDANCE, records);
}

export function getFees(): FeeRecord[] {
  return getLS<FeeRecord[]>(KEYS.FEES, []);
}
export function saveFees(fees: FeeRecord[]): void {
  setLS(KEYS.FEES, fees);
}
export function getStudentFees(studentId: string): FeeRecord[] {
  return getFees().filter((f) => f.studentId === studentId);
}

export function getResults(): ExamResult[] {
  return getLS<ExamResult[]>(KEYS.RESULTS, []);
}
export function saveResults(results: ExamResult[]): void {
  setLS(KEYS.RESULTS, results);
}
export function getStudentResults(studentId: string): ExamResult[] {
  return getResults().filter(
    (r) => r.studentId === studentId && r.status === "approved",
  );
}

export function getNotifications(): Notification[] {
  return getLS<Notification[]>(KEYS.NOTIFICATIONS, []);
}
export function saveNotifications(n: Notification[]): void {
  setLS(KEYS.NOTIFICATIONS, n);
}

export function getHomework(): HomeworkPost[] {
  return getLS<HomeworkPost[]>(KEYS.HOMEWORK, []);
}
export function saveHomework(hw: HomeworkPost[]): void {
  setLS(KEYS.HOMEWORK, hw);
}

export function getCalendarEvents(): CalendarEvent[] {
  return getLS<CalendarEvent[]>(KEYS.CALENDAR, []);
}
export function saveCalendarEvents(events: CalendarEvent[]): void {
  setLS(KEYS.CALENDAR, events);
}

export function getLeaves(): LeaveApplication[] {
  return getLS<LeaveApplication[]>(KEYS.LEAVES, []);
}
export function saveLeaves(leaves: LeaveApplication[]): void {
  setLS(KEYS.LEAVES, leaves);
}

export function getTimetables(): Timetable[] {
  return getLS<Timetable[]>(KEYS.TIMETABLE, []);
}
export function saveTimetables(tt: Timetable[]): void {
  setLS(KEYS.TIMETABLE, tt);
}
export function getTimetableByClass(cls: string): Timetable | undefined {
  return getTimetables().find((t) => t.class === cls);
}

export function getExams(): OnlineExam[] {
  return getLS<OnlineExam[]>(KEYS.EXAMS, []);
}
export function saveExams(exams: OnlineExam[]): void {
  setLS(KEYS.EXAMS, exams);
}

export function getExamAttempts(): ExamAttempt[] {
  return getLS<ExamAttempt[]>(KEYS.EXAM_ATTEMPTS, []);
}
export function saveExamAttempts(attempts: ExamAttempt[]): void {
  setLS(KEYS.EXAM_ATTEMPTS, attempts);
}

export function getPortfolio(): PortfolioEntry[] {
  return getLS<PortfolioEntry[]>(KEYS.PORTFOLIO, []);
}
export function savePortfolio(p: PortfolioEntry[]): void {
  setLS(KEYS.PORTFOLIO, p);
}
export function getStudentPortfolio(studentId: string): PortfolioEntry[] {
  return getPortfolio().filter((p) => p.studentId === studentId);
}

export function getSuggestions(): SuggestionQuery[] {
  return getLS<SuggestionQuery[]>(KEYS.SUGGESTIONS, []);
}
export function saveSuggestions(s: SuggestionQuery[]): void {
  setLS(KEYS.SUGGESTIONS, s);
}

// ============================================================
// Hall Ticket Design
// ============================================================
export interface HallTicketSubject {
  id: string;
  name: string;
  date: string;
  time: string;
}

export interface HallTicketDesign {
  institutionName: string;
  tagline: string;
  headerBg: string;
  examName: string;
  examYear: string;
  subjects: HallTicketSubject[];
  showPrincipalSign: boolean;
  showClassTeacherSign: boolean;
  showLogo: boolean;
  borderStyle: "solid" | "double" | "dotted";
}

const DEFAULT_HALL_TICKET_DESIGN: HallTicketDesign = {
  institutionName: "Rahmaniyya Public School",
  tagline: "Akampadam · Excellence in Education",
  headerBg: "#1e40af",
  examName: "Annual Examination",
  examYear: "2026",
  subjects: [
    { id: "s1", name: "Mathematics", date: "2026-03-20", time: "10:00 AM" },
    { id: "s2", name: "Science", date: "2026-03-22", time: "10:00 AM" },
    { id: "s3", name: "English", date: "2026-03-24", time: "10:00 AM" },
  ],
  showPrincipalSign: true,
  showClassTeacherSign: true,
  showLogo: true,
  borderStyle: "solid",
};

export function getHallTicketDesign(): HallTicketDesign {
  return getLS<HallTicketDesign>(KEYS.HALL_TICKET, DEFAULT_HALL_TICKET_DESIGN);
}

export function saveHallTicketDesign(d: HallTicketDesign): void {
  setLS(KEYS.HALL_TICKET, d);
}

// ============================================================
// Backend sync status (reactive)
// ============================================================
type SyncStatusListener = (
  status: "idle" | "syncing" | "synced" | "error",
) => void;
let _syncStatus: "idle" | "syncing" | "synced" | "error" = "idle";
const _syncListeners = new Set<SyncStatusListener>();

export function getSyncStatus() {
  return _syncStatus;
}

export function subscribeSyncStatus(fn: SyncStatusListener): () => void {
  _syncListeners.add(fn);
  return () => _syncListeners.delete(fn);
}

function setSyncStatus(s: "idle" | "syncing" | "synced" | "error") {
  _syncStatus = s;
  for (const fn of _syncListeners) fn(s);
}

// ============================================================
// Type mapping helpers (frontend ↔ backend)
// ============================================================

type BackendTeacher = {
  id: string;
  subject: string;
  class: string;
  password: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo: string;
};

type BackendStudent = {
  id: string;
  class: string;
  password: string;
  name: string;
  role: string;
  parentPhone: string;
  teacherId: string;
  photo: string;
  rollNo: string;
  parentName: string;
};

type BackendPrincipalProfile = {
  id: string;
  institutionLogo: string;
  institutionName: string;
  password: string;
  name: string;
  role: string;
  email: string;
  institutionTagline: string;
  phone: string;
  photo: string;
};

type BackendStudentAttendance = {
  id: string;
  status: string;
  studentId: string;
  date: string;
  markedBy: string;
};

type BackendTeacherAttendance = {
  id: string;
  status: string;
  date: string;
  approvedBy: string;
  checkInTime: string;
  approvalStatus: string;
  approvalNote: string;
  teacherId: string;
  checkOutTime: string;
};

type BackendFeeRecord = {
  id: string;
  status: string;
  method: string;
  studentId: string;
  date: string;
  description: string;
  amount: number;
  receiptNumber: string;
};

type BackendExamResult = {
  id: string;
  status: string;
  studentId: string;
  subjects: Array<{ marks: number; subject: string; maxMarks: number }>;
  approvedAt: string;
  class: string;
  submittedAt: string;
  teacherId: string;
  examName: string;
};

type BackendNotification = {
  id: string;
  title: string;
  postedBy: string;
  date: string;
  type: string;
  message: string;
  attachmentName: string;
  targetClass: string;
  attachment: string;
};

type BackendHomework = {
  id: string;
  title: string;
  postedAt: string;
  subject: string;
  class: string;
  dueDate: string;
  description: string;
  teacherId: string;
};

type BackendCalendarEvent = {
  id: string;
  title: string;
  date: string;
  createdBy: string;
  type: string;
  description: string;
};

type BackendLeaveApplication = {
  id: string;
  status: string;
  applicantName: string;
  applicantRole: string;
  applicantId: string;
  type: string;
  submittedAt: string;
  reviewedAt: string;
  reviewedBy: string;
  toDate: string;
  fromDate: string;
  reason: string;
};

type BackendTimetable = {
  id: string;
  approvedAt: string;
  approvedBy: string;
  class: string;
  approvalStatus: string;
  approvalNote: string;
  updatedAt: string;
  updatedBy: string;
  scheduleJson: string;
};

type BackendExam = {
  id: string;
  status: string;
  title: string;
  duration: bigint;
  subject: string;
  class: string;
  createdAt: string;
  questionsJson: string;
  teacherId: string;
};

type BackendExamAttempt = {
  id: string;
  studentId: string;
  answersJson: string;
  submittedAt: string;
  score: number;
  examId: string;
  timeTaken: bigint;
};

type BackendPortfolioEntry = {
  id: string;
  title: string;
  studentId: string;
  date: string;
  type: string;
  description: string;
  addedBy: string;
};

type BackendSuggestion = {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  message: string;
  response: string;
  respondedAt: string;
};

type BackendHallTicketDesign = {
  borderStyle: string;
  institutionName: string;
  tagline: string;
  headerBg: string;
  showLogo: boolean;
  examName: string;
  showPrincipalSign: boolean;
  subjectsJson: string;
  examYear: string;
  showClassTeacherSign: boolean;
};

// --- Converters ---

function teacherToBackend(t: Teacher): BackendTeacher {
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    class: t.class,
    email: t.email,
    phone: t.phone,
    password: t.password,
    role: "teacher",
    photo: t.photo ?? "",
  };
}

function teacherFromBackend(t: BackendTeacher): Teacher {
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    class: t.class,
    email: t.email,
    phone: t.phone,
    password: t.password,
    role: "teacher",
    photo: t.photo || undefined,
  };
}

function studentToBackend(s: Student): BackendStudent {
  return {
    id: s.id,
    name: s.name,
    class: s.class,
    rollNo: s.rollNo,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    teacherId: s.teacherId,
    password: s.password,
    role: "student",
    photo: s.photo ?? "",
  };
}

function studentFromBackend(s: BackendStudent): Student {
  return {
    id: s.id,
    name: s.name,
    class: s.class,
    rollNo: s.rollNo,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    teacherId: s.teacherId,
    password: s.password,
    role: "student",
    photo: s.photo || undefined,
  };
}

function principalToBackend(p: PrincipalProfile): BackendPrincipalProfile {
  return {
    id: p.id,
    name: p.name,
    email: p.email ?? "",
    phone: p.phone ?? "",
    password: p.password,
    role: "principal",
    photo: p.photo ?? "",
    institutionLogo: p.institutionLogo ?? "",
    institutionName: p.institutionName ?? "Rahmaniyya Public School",
    institutionTagline: p.institutionTagline ?? "Akampadam",
  };
}

function principalFromBackend(p: BackendPrincipalProfile): PrincipalProfile {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    password: p.password,
    role: "principal" as const,
    photo: p.photo || "",
    institutionLogo: p.institutionLogo || "",
    institutionName: p.institutionName || "Rahmaniyya Public School",
    institutionTagline: p.institutionTagline || "Akampadam",
  };
}

function attendanceToBackend(a: AttendanceRecord): BackendStudentAttendance {
  return {
    id: a.id,
    studentId: a.studentId,
    date: a.date,
    status: a.status,
    markedBy: a.markedBy,
  };
}

function attendanceFromBackend(a: BackendStudentAttendance): AttendanceRecord {
  return {
    id: a.id,
    studentId: a.studentId,
    date: a.date,
    status: a.status as "present" | "absent" | "late",
    markedBy: a.markedBy,
  };
}

function teacherAttendanceToBackend(
  a: TeacherAttendance,
): BackendTeacherAttendance {
  return {
    id: a.id,
    teacherId: a.teacherId,
    date: a.date,
    status: a.status,
    checkInTime: a.checkInTime ?? "",
    checkOutTime: a.checkOutTime ?? "",
    approvalStatus: a.approvalStatus,
    approvedBy: a.approvedBy ?? "",
    approvalNote: a.approvalNote ?? "",
  };
}

function teacherAttendanceFromBackend(
  a: BackendTeacherAttendance,
): TeacherAttendance {
  return {
    id: a.id,
    teacherId: a.teacherId,
    date: a.date,
    status: a.status as "present" | "absent" | "late",
    checkInTime: a.checkInTime || undefined,
    checkOutTime: a.checkOutTime || undefined,
    approvalStatus: a.approvalStatus as "pending" | "approved" | "rejected",
    approvedBy: a.approvedBy || undefined,
    approvalNote: a.approvalNote || undefined,
  };
}

function feeToBackend(f: FeeRecord): BackendFeeRecord {
  return {
    id: f.id,
    studentId: f.studentId,
    amount: f.amount,
    date: f.date,
    status: f.status,
    method: f.method,
    description: f.description,
    receiptNumber: f.receiptNumber ?? "",
  };
}

function feeFromBackend(f: BackendFeeRecord): FeeRecord {
  return {
    id: f.id,
    studentId: f.studentId,
    amount: f.amount,
    date: f.date,
    status: f.status as "paid" | "pending" | "partial",
    method: f.method,
    description: f.description,
    receiptNumber: f.receiptNumber || undefined,
  };
}

function resultToBackend(r: ExamResult): BackendExamResult {
  return {
    id: r.id,
    examName: r.examName,
    studentId: r.studentId,
    teacherId: r.teacherId,
    class: r.class,
    subjects: r.subjects,
    submittedAt: r.submittedAt,
    status: r.status,
    approvedAt: r.approvedAt ?? "",
  };
}

function resultFromBackend(r: BackendExamResult): ExamResult {
  return {
    id: r.id,
    examName: r.examName,
    studentId: r.studentId,
    teacherId: r.teacherId,
    class: r.class,
    subjects: r.subjects,
    submittedAt: r.submittedAt,
    status: r.status as "pending" | "approved" | "rejected",
    approvedAt: r.approvedAt || undefined,
  };
}

function notificationToBackend(n: Notification): BackendNotification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    date: n.date,
    postedBy: n.postedBy,
    type: n.type,
    targetClass: n.targetClass ?? "",
    attachment: n.attachment ?? "",
    attachmentName: n.attachmentName ?? "",
  };
}

function notificationFromBackend(n: BackendNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    date: n.date,
    postedBy: n.postedBy,
    type: n.type as "general" | "homework" | "exam",
    targetClass: n.targetClass || undefined,
    attachment: n.attachment || undefined,
    attachmentName: n.attachmentName || undefined,
  };
}

function homeworkToBackend(h: HomeworkPost): BackendHomework {
  return {
    id: h.id,
    subject: h.subject,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate,
    class: h.class,
    teacherId: h.teacherId,
    postedAt: h.postedAt,
  };
}

function homeworkFromBackend(h: BackendHomework): HomeworkPost {
  return {
    id: h.id,
    subject: h.subject,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate,
    class: h.class,
    teacherId: h.teacherId,
    postedAt: h.postedAt,
  };
}

function calendarEventToBackend(e: CalendarEvent): BackendCalendarEvent {
  return {
    id: e.id,
    title: e.title,
    type: e.type,
    date: e.date,
    description: e.description,
    createdBy: e.createdBy,
  };
}

function calendarEventFromBackend(e: BackendCalendarEvent): CalendarEvent {
  return {
    id: e.id,
    title: e.title,
    type: e.type as "holiday" | "exam" | "event",
    date: e.date,
    description: e.description,
    createdBy: e.createdBy,
  };
}

function leaveToBackend(l: LeaveApplication): BackendLeaveApplication {
  return {
    id: l.id,
    applicantId: l.applicantId,
    applicantName: l.applicantName,
    applicantRole: l.applicantRole,
    type: l.type,
    fromDate: l.fromDate,
    toDate: l.toDate,
    reason: l.reason,
    status: l.status,
    submittedAt: l.submittedAt,
    reviewedBy: l.reviewedBy ?? "",
    reviewedAt: l.reviewedAt ?? "",
  };
}

function leaveFromBackend(l: BackendLeaveApplication): LeaveApplication {
  return {
    id: l.id,
    applicantId: l.applicantId,
    applicantName: l.applicantName,
    applicantRole: l.applicantRole as "teacher" | "student",
    type: l.type as "sick" | "casual" | "personal",
    fromDate: l.fromDate,
    toDate: l.toDate,
    reason: l.reason,
    status: l.status as "pending" | "approved" | "rejected",
    submittedAt: l.submittedAt,
    reviewedBy: l.reviewedBy || undefined,
    reviewedAt: l.reviewedAt || undefined,
  };
}

function timetableToBackend(t: Timetable): BackendTimetable {
  return {
    id: t.id,
    class: t.class,
    scheduleJson: JSON.stringify(t.schedule),
    updatedAt: t.updatedAt,
    updatedBy: t.updatedBy,
    approvalStatus: t.approvalStatus,
    approvalNote: t.approvalNote ?? "",
    approvedBy: t.approvedBy ?? "",
    approvedAt: t.approvedAt ?? "",
  };
}

function timetableFromBackend(t: BackendTimetable): Timetable {
  let schedule: Timetable["schedule"] = {};
  try {
    schedule = JSON.parse(t.scheduleJson);
  } catch {
    schedule = {};
  }
  return {
    id: t.id,
    class: t.class,
    schedule,
    updatedAt: t.updatedAt,
    updatedBy: t.updatedBy,
    approvalStatus: t.approvalStatus as "pending" | "approved" | "rejected",
    approvalNote: t.approvalNote || undefined,
    approvedBy: t.approvedBy || undefined,
    approvedAt: t.approvedAt || undefined,
  };
}

function examToBackend(e: OnlineExam): BackendExam {
  return {
    id: e.id,
    title: e.title,
    subject: e.subject,
    duration: BigInt(e.duration),
    class: e.class,
    teacherId: e.teacherId,
    createdAt: e.createdAt,
    questionsJson: JSON.stringify(e.questions),
    status: e.status,
  };
}

function examFromBackend(e: BackendExam): OnlineExam {
  let questions: ExamQuestion[] = [];
  try {
    questions = JSON.parse(e.questionsJson);
  } catch {
    questions = [];
  }
  return {
    id: e.id,
    title: e.title,
    subject: e.subject,
    duration: Number(e.duration),
    class: e.class,
    teacherId: e.teacherId,
    createdAt: e.createdAt,
    questions,
    status: e.status as "active" | "closed",
  };
}

function examAttemptToBackend(a: ExamAttempt): BackendExamAttempt {
  return {
    id: a.id,
    examId: a.examId,
    studentId: a.studentId,
    answersJson: JSON.stringify(a.answers),
    score: a.score ?? 0,
    submittedAt: a.submittedAt,
    timeTaken: BigInt(a.timeTaken ?? 0),
  };
}

function examAttemptFromBackend(a: BackendExamAttempt): ExamAttempt {
  let answers: ExamAttempt["answers"] = [];
  try {
    answers = JSON.parse(a.answersJson);
  } catch {
    answers = [];
  }
  return {
    id: a.id,
    examId: a.examId,
    studentId: a.studentId,
    answers,
    score: a.score,
    submittedAt: a.submittedAt,
    timeTaken: Number(a.timeTaken),
  };
}

function portfolioToBackend(p: PortfolioEntry): BackendPortfolioEntry {
  return {
    id: p.id,
    studentId: p.studentId,
    title: p.title,
    description: p.description,
    date: p.date,
    type: p.type,
    addedBy: p.addedBy,
  };
}

function portfolioFromBackend(p: BackendPortfolioEntry): PortfolioEntry {
  return {
    id: p.id,
    studentId: p.studentId,
    title: p.title,
    description: p.description,
    date: p.date,
    type: p.type as "academic" | "sports" | "cultural" | "skill",
    addedBy: p.addedBy,
  };
}

function suggestionToBackend(s: SuggestionQuery): BackendSuggestion {
  return {
    id: s.id,
    studentId: s.studentId,
    studentName: s.studentName,
    message: s.message,
    submittedAt: s.submittedAt,
    response: s.response ?? "",
    respondedAt: s.respondedAt ?? "",
  };
}

function suggestionFromBackend(s: BackendSuggestion): SuggestionQuery {
  return {
    id: s.id,
    studentId: s.studentId,
    studentName: s.studentName,
    message: s.message,
    submittedAt: s.submittedAt,
    response: s.response || undefined,
    respondedAt: s.respondedAt || undefined,
  };
}

function hallTicketToBackend(d: HallTicketDesign): BackendHallTicketDesign {
  return {
    institutionName: d.institutionName,
    tagline: d.tagline,
    headerBg: d.headerBg,
    examName: d.examName,
    examYear: d.examYear,
    subjectsJson: JSON.stringify(d.subjects),
    showPrincipalSign: d.showPrincipalSign,
    showClassTeacherSign: d.showClassTeacherSign,
    showLogo: d.showLogo,
    borderStyle: d.borderStyle,
  };
}

function hallTicketFromBackend(d: BackendHallTicketDesign): HallTicketDesign {
  let subjects: HallTicketSubject[] = [];
  try {
    subjects = JSON.parse(d.subjectsJson);
  } catch {
    subjects = [];
  }
  return {
    institutionName: d.institutionName,
    tagline: d.tagline,
    headerBg: d.headerBg,
    examName: d.examName,
    examYear: d.examYear,
    subjects,
    showPrincipalSign: d.showPrincipalSign,
    showClassTeacherSign: d.showClassTeacherSign,
    showLogo: d.showLogo,
    borderStyle: d.borderStyle as "solid" | "double" | "dotted",
  };
}

// ============================================================
// Backend async API - Initialize & Sync ALL data types
// ============================================================

/** Initialize backend and sync all data from canister to localStorage cache */
export async function initializeBackend(): Promise<void> {
  try {
    setSyncStatus("syncing");
    const be = await getBackend();
    await be.initializeIfNeeded();
    await Promise.all([
      syncTeachersFromBackend(),
      syncStudentsFromBackend(),
      syncPrincipalFromBackend(),
      syncAttendanceFromBackend(),
      syncTeacherAttendanceFromBackend(),
      syncFeesFromBackend(),
      syncResultsFromBackend(),
      syncNotificationsFromBackend(),
      syncHomeworkFromBackend(),
      syncCalendarEventsFromBackend(),
      syncLeavesFromBackend(),
      syncTimetablesFromBackend(),
      syncExamsFromBackend(),
      syncExamAttemptsFromBackend(),
      syncPortfolioFromBackend(),
      syncSuggestionsFromBackend(),
      syncHallTicketDesignFromBackend(),
    ]);
    setSyncStatus("synced");
  } catch (err) {
    console.error("Backend init failed, using localStorage:", err);
    setSyncStatus("error");
  }
}

/** Authenticate against backend canister */
export async function authenticateAsync(
  role: Role,
  id: string,
  password: string,
): Promise<CurrentUser | null> {
  try {
    const be = await getBackend();
    if (role === "principal") {
      const result = await be.loginPrincipal(id, password);
      if (!result) return null;
      return { id: result.id, name: result.name, role: "principal" };
    }
    if (role === "teacher") {
      const result = await be.loginTeacher(id, password);
      if (!result) return null;
      return {
        id: result.id,
        name: result.name,
        role: "teacher",
        class: result.class_ ?? result.class ?? "",
      };
    }
    if (role === "student") {
      const result = await be.loginStudent(id, password);
      if (!result) return null;
      return {
        id: result.id,
        name: result.name,
        role: "student",
        class: result.class_ ?? result.class ?? "",
      };
    }
    return null;
  } catch (err) {
    console.error(
      "authenticateAsync failed, falling back to localStorage:",
      err,
    );
    return authenticate(role, id, password);
  }
}

// ============================================================
// Sync functions (backend → localStorage cache)
// ============================================================

export async function syncTeachersFromBackend(): Promise<Teacher[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllTeachers();
    const mapped = items.map(teacherFromBackend);
    setLS(KEYS.TEACHERS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncTeachersFromBackend failed:", err);
    return getTeachers();
  }
}

export async function syncStudentsFromBackend(): Promise<Student[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllStudents();
    const mapped = items.map(studentFromBackend);
    setLS(KEYS.STUDENTS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncStudentsFromBackend failed:", err);
    return getStudents();
  }
}

export async function syncPrincipalFromBackend(): Promise<void> {
  try {
    const be = await getBackend();
    const p = await be.getPrincipalProfile();
    setLS(KEYS.PRINCIPAL, principalFromBackend(p));
  } catch (err) {
    console.error("syncPrincipalFromBackend failed:", err);
  }
}

export async function syncAttendanceFromBackend(): Promise<AttendanceRecord[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllStudentAttendance();
    const mapped = items.map(attendanceFromBackend);
    setLS(KEYS.ATTENDANCE, mapped);
    return mapped;
  } catch (err) {
    console.error("syncAttendanceFromBackend failed:", err);
    return getAttendance();
  }
}

export async function syncTeacherAttendanceFromBackend(): Promise<
  TeacherAttendance[]
> {
  try {
    const be = await getBackend();
    const items = await be.getAllTeacherAttendance();
    const mapped = items.map(teacherAttendanceFromBackend);
    setLS(KEYS.TEACHER_ATTENDANCE, mapped);
    return mapped;
  } catch (err) {
    console.error("syncTeacherAttendanceFromBackend failed:", err);
    return getTeacherAttendance();
  }
}

export async function syncFeesFromBackend(): Promise<FeeRecord[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllFeeRecords();
    const mapped = items.map(feeFromBackend);
    setLS(KEYS.FEES, mapped);
    return mapped;
  } catch (err) {
    console.error("syncFeesFromBackend failed:", err);
    return getFees();
  }
}

export async function syncResultsFromBackend(): Promise<ExamResult[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllExamResults();
    const mapped = items.map(resultFromBackend);
    setLS(KEYS.RESULTS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncResultsFromBackend failed:", err);
    return getResults();
  }
}

export async function syncNotificationsFromBackend(): Promise<Notification[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllNotifications();
    const mapped = items.map(notificationFromBackend);
    setLS(KEYS.NOTIFICATIONS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncNotificationsFromBackend failed:", err);
    return getNotifications();
  }
}

export async function syncHomeworkFromBackend(): Promise<HomeworkPost[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllHomework();
    const mapped = items.map(homeworkFromBackend);
    setLS(KEYS.HOMEWORK, mapped);
    return mapped;
  } catch (err) {
    console.error("syncHomeworkFromBackend failed:", err);
    return getHomework();
  }
}

export async function syncCalendarEventsFromBackend(): Promise<
  CalendarEvent[]
> {
  try {
    const be = await getBackend();
    const items = await be.getAllCalendarEvents();
    const mapped = items.map(calendarEventFromBackend);
    setLS(KEYS.CALENDAR, mapped);
    return mapped;
  } catch (err) {
    console.error("syncCalendarEventsFromBackend failed:", err);
    return getCalendarEvents();
  }
}

export async function syncLeavesFromBackend(): Promise<LeaveApplication[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllLeaveApplications();
    const mapped = items.map(leaveFromBackend);
    setLS(KEYS.LEAVES, mapped);
    return mapped;
  } catch (err) {
    console.error("syncLeavesFromBackend failed:", err);
    return getLeaves();
  }
}

export async function syncTimetablesFromBackend(): Promise<Timetable[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllTimetables();
    const mapped = items.map(timetableFromBackend);
    setLS(KEYS.TIMETABLE, mapped);
    return mapped;
  } catch (err) {
    console.error("syncTimetablesFromBackend failed:", err);
    return getTimetables();
  }
}

export async function syncExamsFromBackend(): Promise<OnlineExam[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllExams();
    const mapped = items.map(examFromBackend);
    setLS(KEYS.EXAMS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncExamsFromBackend failed:", err);
    return getExams();
  }
}

export async function syncExamAttemptsFromBackend(): Promise<ExamAttempt[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllExamAttempts();
    const mapped = items.map(examAttemptFromBackend);
    setLS(KEYS.EXAM_ATTEMPTS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncExamAttemptsFromBackend failed:", err);
    return getExamAttempts();
  }
}

export async function syncPortfolioFromBackend(): Promise<PortfolioEntry[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllPortfolioEntries();
    const mapped = items.map(portfolioFromBackend);
    setLS(KEYS.PORTFOLIO, mapped);
    return mapped;
  } catch (err) {
    console.error("syncPortfolioFromBackend failed:", err);
    return getPortfolio();
  }
}

export async function syncSuggestionsFromBackend(): Promise<SuggestionQuery[]> {
  try {
    const be = await getBackend();
    const items = await be.getAllSuggestions();
    const mapped = items.map(suggestionFromBackend);
    setLS(KEYS.SUGGESTIONS, mapped);
    return mapped;
  } catch (err) {
    console.error("syncSuggestionsFromBackend failed:", err);
    return getSuggestions();
  }
}

export async function syncHallTicketDesignFromBackend(): Promise<void> {
  try {
    const be = await getBackend();
    const d = await be.getHallTicketDesign();
    if (d) {
      setLS(KEYS.HALL_TICKET, hallTicketFromBackend(d));
    }
  } catch (err) {
    console.error("syncHallTicketDesignFromBackend failed:", err);
  }
}

// ============================================================
// Backend write operations (persist to canister + update cache)
// ============================================================

// --- Teachers ---
export async function saveTeacherToBackend(teacher: Teacher): Promise<void> {
  const teachers = getTeachers();
  const idx = teachers.findIndex((t) => t.id === teacher.id);
  const b = teacherToBackend(teacher);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateTeacher(teacher.id, b);
      teachers[idx] = teacher;
    } else {
      await be.addTeacher(b);
      teachers.push(teacher);
    }
  } catch (err) {
    console.error("saveTeacherToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.TEACHERS, teachers);
}

export async function deleteTeacherFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteTeacher(id);
  } catch (err) {
    console.error("deleteTeacherFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.TEACHERS,
    getTeachers().filter((t) => t.id !== id),
  );
}

// --- Students ---
export async function saveStudentToBackend(student: Student): Promise<void> {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === student.id);
  const b = studentToBackend(student);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateStudent(student.id, b);
      students[idx] = student;
    } else {
      await be.addStudent(b);
      students.push(student);
    }
  } catch (err) {
    console.error("saveStudentToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.STUDENTS, students);
}

export async function deleteStudentFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteStudent(id);
  } catch (err) {
    console.error("deleteStudentFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.STUDENTS,
    getStudents().filter((s) => s.id !== id),
  );
}

// --- Principal ---
export async function savePrincipalToBackend(
  profile: PrincipalProfile,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.savePrincipalProfile(principalToBackend(profile));
  } catch (err) {
    console.error("savePrincipalToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.PRINCIPAL, profile);
}

// --- Student Attendance ---
export async function addAttendanceToBackend(
  record: AttendanceRecord,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.addStudentAttendance(attendanceToBackend(record));
  } catch (err) {
    console.error("addAttendanceToBackend failed:", err);
    throw err;
  }
  const all = getAttendance();
  all.push(record);
  setLS(KEYS.ATTENDANCE, all);
}

export async function updateAttendanceInBackend(
  record: AttendanceRecord,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.updateStudentAttendance(record.id, attendanceToBackend(record));
  } catch (err) {
    console.error("updateAttendanceInBackend failed:", err);
    throw err;
  }
  const all = getAttendance().map((a) => (a.id === record.id ? record : a));
  setLS(KEYS.ATTENDANCE, all);
}

export async function saveAttendanceBatchToBackend(
  records: AttendanceRecord[],
): Promise<void> {
  // For batch saves (marking attendance for whole class), add each new record
  const all = getAttendance();
  const cachedIds = new Set(all.map((a) => a.id));
  try {
    const be = await getBackend();
    for (const r of records) {
      if (cachedIds.has(r.id)) {
        await be.updateStudentAttendance(r.id, attendanceToBackend(r));
      } else {
        await be.addStudentAttendance(attendanceToBackend(r));
      }
    }
  } catch (err) {
    console.error("saveAttendanceBatchToBackend failed:", err);
    throw err;
  }
  // Merge into local cache
  for (const r of records) {
    const idx = all.findIndex((a) => a.id === r.id);
    if (idx >= 0) all[idx] = r;
    else all.push(r);
  }
  setLS(KEYS.ATTENDANCE, all);
}

// --- Teacher Attendance ---
export async function addTeacherAttendanceToBackend(
  record: TeacherAttendance,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.addTeacherAttendance(teacherAttendanceToBackend(record));
  } catch (err) {
    console.error("addTeacherAttendanceToBackend failed:", err);
    throw err;
  }
  const all = getTeacherAttendance();
  all.push(record);
  setLS(KEYS.TEACHER_ATTENDANCE, all);
}

export async function updateTeacherAttendanceInBackend(
  record: TeacherAttendance,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.updateTeacherAttendance(
      record.id,
      teacherAttendanceToBackend(record),
    );
  } catch (err) {
    console.error("updateTeacherAttendanceInBackend failed:", err);
    throw err;
  }
  const all = getTeacherAttendance().map((a) =>
    a.id === record.id ? record : a,
  );
  setLS(KEYS.TEACHER_ATTENDANCE, all);
}

export async function saveTeacherAttendanceBatchToBackend(
  records: TeacherAttendance[],
): Promise<void> {
  const all = getTeacherAttendance();
  const cachedIds = new Set(all.map((a) => a.id));
  try {
    const be = await getBackend();
    for (const r of records) {
      if (cachedIds.has(r.id)) {
        await be.updateTeacherAttendance(r.id, teacherAttendanceToBackend(r));
      } else {
        await be.addTeacherAttendance(teacherAttendanceToBackend(r));
      }
    }
  } catch (err) {
    console.error("saveTeacherAttendanceBatchToBackend failed:", err);
    throw err;
  }
  for (const r of records) {
    const idx = all.findIndex((a) => a.id === r.id);
    if (idx >= 0) all[idx] = r;
    else all.push(r);
  }
  setLS(KEYS.TEACHER_ATTENDANCE, all);
}

// --- Fees ---
export async function saveFeeToBackend(fee: FeeRecord): Promise<void> {
  const all = getFees();
  const idx = all.findIndex((f) => f.id === fee.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateFeeRecord(fee.id, feeToBackend(fee));
      all[idx] = fee;
    } else {
      await be.addFeeRecord(feeToBackend(fee));
      all.push(fee);
    }
  } catch (err) {
    console.error("saveFeeToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.FEES, all);
}

export async function saveFeesToBackend(fees: FeeRecord[]): Promise<void> {
  const cachedIds = new Set(getFees().map((f) => f.id));
  try {
    const be = await getBackend();
    for (const fee of fees) {
      if (cachedIds.has(fee.id)) {
        await be.updateFeeRecord(fee.id, feeToBackend(fee));
      } else {
        await be.addFeeRecord(feeToBackend(fee));
      }
    }
  } catch (err) {
    console.error("saveFeesToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.FEES, fees);
}

// --- Results ---
export async function saveResultToBackend(result: ExamResult): Promise<void> {
  const all = getResults();
  const idx = all.findIndex((r) => r.id === result.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateExamResult(result.id, resultToBackend(result));
      all[idx] = result;
    } else {
      await be.addExamResult(resultToBackend(result));
      all.push(result);
    }
  } catch (err) {
    console.error("saveResultToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.RESULTS, all);
}

export async function deleteResultFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteExamResult(id);
  } catch (err) {
    console.error("deleteResultFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.RESULTS,
    getResults().filter((r) => r.id !== id),
  );
}

export async function saveResultsBatchToBackend(
  results: ExamResult[],
): Promise<void> {
  const all = getResults();
  const cachedIds = new Set(all.map((r) => r.id));
  try {
    const be = await getBackend();
    for (const result of results) {
      if (cachedIds.has(result.id)) {
        await be.updateExamResult(result.id, resultToBackend(result));
      } else {
        await be.addExamResult(resultToBackend(result));
      }
    }
  } catch (err) {
    console.error("saveResultsBatchToBackend failed:", err);
    throw err;
  }
  for (const r of results) {
    const idx = all.findIndex((x) => x.id === r.id);
    if (idx >= 0) all[idx] = r;
    else all.push(r);
  }
  setLS(KEYS.RESULTS, all);
}

// --- Notifications ---
export async function saveNotificationToBackend(
  n: Notification,
): Promise<void> {
  const all = getNotifications();
  const idx = all.findIndex((x) => x.id === n.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateNotification(n.id, notificationToBackend(n));
      all[idx] = n;
    } else {
      await be.addNotification(notificationToBackend(n));
      all.push(n);
    }
  } catch (err) {
    console.error("saveNotificationToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.NOTIFICATIONS, all);
}

export async function deleteNotificationFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteNotification(id);
  } catch (err) {
    console.error("deleteNotificationFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.NOTIFICATIONS,
    getNotifications().filter((n) => n.id !== id),
  );
}

// --- Homework ---
export async function saveHomeworkToBackend(h: HomeworkPost): Promise<void> {
  const all = getHomework();
  const idx = all.findIndex((x) => x.id === h.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateHomework(h.id, homeworkToBackend(h));
      all[idx] = h;
    } else {
      await be.addHomework(homeworkToBackend(h));
      all.push(h);
    }
  } catch (err) {
    console.error("saveHomeworkToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.HOMEWORK, all);
}

export async function deleteHomeworkFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteHomework(id);
  } catch (err) {
    console.error("deleteHomeworkFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.HOMEWORK,
    getHomework().filter((h) => h.id !== id),
  );
}

// --- Calendar Events ---
export async function saveCalendarEventToBackend(
  e: CalendarEvent,
): Promise<void> {
  const all = getCalendarEvents();
  const idx = all.findIndex((x) => x.id === e.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateCalendarEvent(e.id, calendarEventToBackend(e));
      all[idx] = e;
    } else {
      await be.addCalendarEvent(calendarEventToBackend(e));
      all.push(e);
    }
  } catch (err) {
    console.error("saveCalendarEventToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.CALENDAR, all);
}

export async function deleteCalendarEventFromBackend(
  id: string,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteCalendarEvent(id);
  } catch (err) {
    console.error("deleteCalendarEventFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.CALENDAR,
    getCalendarEvents().filter((e) => e.id !== id),
  );
}

// --- Leaves ---
export async function saveLeaveToBackend(l: LeaveApplication): Promise<void> {
  const all = getLeaves();
  const idx = all.findIndex((x) => x.id === l.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateLeaveApplication(l.id, leaveToBackend(l));
      all[idx] = l;
    } else {
      await be.addLeaveApplication(leaveToBackend(l));
      all.push(l);
    }
  } catch (err) {
    console.error("saveLeaveToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.LEAVES, all);
}

// --- Timetables ---
export async function saveTimetableToBackend(t: Timetable): Promise<void> {
  const all = getTimetables();
  const idx = all.findIndex((x) => x.id === t.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateTimetable(t.id, timetableToBackend(t));
      all[idx] = t;
    } else {
      await be.addTimetable(timetableToBackend(t));
      all.push(t);
    }
  } catch (err) {
    console.error("saveTimetableToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.TIMETABLE, all);
}

export async function saveTimetablesToBackend(
  timetables: Timetable[],
): Promise<void> {
  const cachedIds = new Set(getTimetables().map((t) => t.id));
  try {
    const be = await getBackend();
    for (const t of timetables) {
      if (cachedIds.has(t.id)) {
        await be.updateTimetable(t.id, timetableToBackend(t));
      } else {
        await be.addTimetable(timetableToBackend(t));
      }
    }
  } catch (err) {
    console.error("saveTimetablesToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.TIMETABLE, timetables);
}

// --- Online Exams ---
export async function saveExamToBackend(e: OnlineExam): Promise<void> {
  const all = getExams();
  const idx = all.findIndex((x) => x.id === e.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateExam(e.id, examToBackend(e));
      all[idx] = e;
    } else {
      await be.addExam(examToBackend(e));
      all.push(e);
    }
  } catch (err) {
    console.error("saveExamToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.EXAMS, all);
}

export async function saveExamsToBackend(exams: OnlineExam[]): Promise<void> {
  const cachedIds = new Set(getExams().map((e) => e.id));
  try {
    const be = await getBackend();
    for (const e of exams) {
      if (cachedIds.has(e.id)) {
        await be.updateExam(e.id, examToBackend(e));
      } else {
        await be.addExam(examToBackend(e));
      }
    }
  } catch (err) {
    console.error("saveExamsToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.EXAMS, exams);
}

// --- Exam Attempts ---
export async function saveExamAttemptToBackend(a: ExamAttempt): Promise<void> {
  try {
    const be = await getBackend();
    await be.addExamAttempt(examAttemptToBackend(a));
  } catch (err) {
    console.error("saveExamAttemptToBackend failed:", err);
    throw err;
  }
  const all = getExamAttempts();
  all.push(a);
  setLS(KEYS.EXAM_ATTEMPTS, all);
}

// --- Portfolio ---
export async function savePortfolioEntryToBackend(
  p: PortfolioEntry,
): Promise<void> {
  const all = getPortfolio();
  const idx = all.findIndex((x) => x.id === p.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updatePortfolioEntry(p.id, portfolioToBackend(p));
      all[idx] = p;
    } else {
      await be.addPortfolioEntry(portfolioToBackend(p));
      all.push(p);
    }
  } catch (err) {
    console.error("savePortfolioEntryToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.PORTFOLIO, all);
}

export async function deletePortfolioEntryFromBackend(
  id: string,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.deletePortfolioEntry(id);
  } catch (err) {
    console.error("deletePortfolioEntryFromBackend failed:", err);
    throw err;
  }
  setLS(
    KEYS.PORTFOLIO,
    getPortfolio().filter((p) => p.id !== id),
  );
}

// --- Suggestions ---
export async function saveSuggestionToBackend(
  s: SuggestionQuery,
): Promise<void> {
  const all = getSuggestions();
  const idx = all.findIndex((x) => x.id === s.id);
  try {
    const be = await getBackend();
    if (idx >= 0) {
      await be.updateSuggestion(s.id, suggestionToBackend(s));
      all[idx] = s;
    } else {
      await be.addSuggestion(suggestionToBackend(s));
      all.push(s);
    }
  } catch (err) {
    console.error("saveSuggestionToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.SUGGESTIONS, all);
}

// --- Hall Ticket Design ---
export async function saveHallTicketDesignToBackend(
  d: HallTicketDesign,
): Promise<void> {
  try {
    const be = await getBackend();
    await be.saveHallTicketDesign(hallTicketToBackend(d));
  } catch (err) {
    console.error("saveHallTicketDesignToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.HALL_TICKET, d);
}

// ============================================================
// Utility
// ============================================================
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function calcAttendancePercent(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const present = records.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;
  return Math.round((present / records.length) * 100);
}

export function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Legacy alias (kept for backwards compatibility with old code paths)
export function initializeData(): void {
  // No-op: data is now seeded in the backend canister via initializeIfNeeded()
}

// ============================================================
// Game Score helpers
// ============================================================
export interface GameScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  gameId: string;
  stars: bigint;
  score: bigint;
  total: bigint;
  playedAt: string;
}

export async function saveGameScoreToBackend(
  record: GameScoreRecord,
): Promise<void> {
  const b = await getBackend();
  await b.saveGameScore(record);
}

export async function getGameLeaderboardFromBackend(
  gameId: string,
  studentClass: string,
): Promise<GameScoreRecord[]> {
  const b = await getBackend();
  // The backend method uses 'class' as parameter name (reserved keyword workaround)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const scores = await b.getGameLeaderboard(gameId, studentClass);
  return scores as GameScoreRecord[];
}

export async function getMyGameScoresFromBackend(
  studentId: string,
): Promise<GameScoreRecord[]> {
  const b = await getBackend();
  const scores = await b.getMyGameScores(studentId);
  return scores as GameScoreRecord[];
}
