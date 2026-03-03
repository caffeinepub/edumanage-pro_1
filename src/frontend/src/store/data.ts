// ============================================================
// EduManage Pro - Data Store (localStorage + Backend Canister)
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
// localStorage keys
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
// Seed / Initialize
// ============================================================
export function initializeData(): void {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;

  const teachers: Teacher[] = [
    {
      id: "teacher001",
      password: "teacher123",
      name: "Mrs. Priya Sharma",
      subject: "Mathematics",
      email: "priya@school.edu",
      phone: "9876543210",
      class: "10A",
      role: "teacher",
    },
    {
      id: "teacher002",
      password: "teacher123",
      name: "Mr. Amit Verma",
      subject: "Science",
      email: "amit@school.edu",
      phone: "9876543211",
      class: "9B",
      role: "teacher",
    },
    {
      id: "teacher003",
      password: "teacher123",
      name: "Ms. Neha Gupta",
      subject: "English",
      email: "neha@school.edu",
      phone: "9876543212",
      class: "8C",
      role: "teacher",
    },
  ];

  const students: Student[] = [
    {
      id: "student001",
      password: "student123",
      name: "Rahul Mehra",
      class: "10A",
      rollNo: "01",
      parentName: "Mr. Suresh Mehra",
      parentPhone: "9876500001",
      teacherId: "teacher001",
      role: "student",
    },
    {
      id: "student002",
      password: "student123",
      name: "Priya Singh",
      class: "10A",
      rollNo: "02",
      parentName: "Mr. Vikram Singh",
      parentPhone: "9876500002",
      teacherId: "teacher001",
      role: "student",
    },
    {
      id: "student003",
      password: "student123",
      name: "Arjun Patel",
      class: "9B",
      rollNo: "01",
      parentName: "Mr. Ravi Patel",
      parentPhone: "9876500003",
      teacherId: "teacher002",
      role: "student",
    },
    {
      id: "student004",
      password: "student123",
      name: "Sneha Joshi",
      class: "9B",
      rollNo: "02",
      parentName: "Mr. Anand Joshi",
      parentPhone: "9876500004",
      teacherId: "teacher002",
      role: "student",
    },
    {
      id: "student005",
      password: "student123",
      name: "Vikram Das",
      class: "8C",
      rollNo: "01",
      parentName: "Mr. Mohan Das",
      parentPhone: "9876500005",
      teacherId: "teacher003",
      role: "student",
    },
  ];

  // Attendance for last 10 days
  const attendance: AttendanceRecord[] = [];
  const today = new Date();
  const statuses: ("present" | "absent" | "late")[] = [
    "present",
    "present",
    "present",
    "present",
    "absent",
    "present",
    "late",
    "present",
    "present",
    "present",
  ];
  for (const s of students) {
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      attendance.push({
        id: `att_${s.id}_${i}`,
        studentId: s.id,
        date: d.toISOString().split("T")[0],
        status: statuses[i % statuses.length],
        markedBy: s.teacherId,
      });
    }
  }

  // Teacher attendance
  const teacherAttendance: TeacherAttendance[] = [];
  for (const t of teachers) {
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      teacherAttendance.push({
        id: `tatt_${t.id}_${i}`,
        teacherId: t.id,
        date: d.toISOString().split("T")[0],
        status: i === 4 ? "absent" : "present",
        checkInTime: i === 4 ? undefined : "08:30",
        checkOutTime: i === 4 ? undefined : "15:30",
        approvalStatus: "approved",
      });
    }
  }

  // Fee records
  const fees: FeeRecord[] = [
    {
      id: "fee001",
      studentId: "student001",
      amount: 15000,
      date: "2026-01-15",
      status: "paid",
      method: "Online Transfer",
      description: "Term 1 Tuition Fee",
      receiptNumber: "RPS-2026-001",
    },
    {
      id: "fee002",
      studentId: "student002",
      amount: 15000,
      date: "2026-01-20",
      status: "paid",
      method: "Cheque",
      description: "Term 1 Tuition Fee",
      receiptNumber: "RPS-2026-002",
    },
    {
      id: "fee003",
      studentId: "student003",
      amount: 15000,
      date: "2026-02-01",
      status: "partial",
      method: "Cash",
      description: "Term 1 Tuition Fee (partial)",
      receiptNumber: "RPS-2026-003",
    },
    {
      id: "fee004",
      studentId: "student004",
      amount: 15000,
      date: "",
      status: "pending",
      method: "",
      description: "Term 1 Tuition Fee",
    },
    {
      id: "fee005",
      studentId: "student005",
      amount: 15000,
      date: "",
      status: "pending",
      method: "",
      description: "Term 1 Tuition Fee",
    },
    {
      id: "fee006",
      studentId: "student001",
      amount: 2500,
      date: "2026-01-15",
      status: "paid",
      method: "Online Transfer",
      description: "Lab Fee",
      receiptNumber: "RPS-2026-004",
    },
  ];

  // Exam results
  const results: ExamResult[] = [
    {
      id: "res001",
      examName: "Unit Test 1",
      studentId: "student001",
      teacherId: "teacher001",
      class: "10A",
      subjects: [
        { subject: "Mathematics", marks: 88, maxMarks: 100 },
        { subject: "Science", marks: 82, maxMarks: 100 },
        { subject: "English", marks: 79, maxMarks: 100 },
        { subject: "Social Studies", marks: 85, maxMarks: 100 },
        { subject: "Hindi", marks: 90, maxMarks: 100 },
      ],
      submittedAt: "2026-01-25",
      status: "approved",
      approvedAt: "2026-01-26",
    },
    {
      id: "res002",
      examName: "Unit Test 1",
      studentId: "student002",
      teacherId: "teacher001",
      class: "10A",
      subjects: [
        { subject: "Mathematics", marks: 75, maxMarks: 100 },
        { subject: "Science", marks: 80, maxMarks: 100 },
        { subject: "English", marks: 92, maxMarks: 100 },
        { subject: "Social Studies", marks: 78, maxMarks: 100 },
        { subject: "Hindi", marks: 85, maxMarks: 100 },
      ],
      submittedAt: "2026-01-25",
      status: "approved",
      approvedAt: "2026-01-26",
    },
    {
      id: "res003",
      examName: "Mid Term",
      studentId: "student001",
      teacherId: "teacher001",
      class: "10A",
      subjects: [
        { subject: "Mathematics", marks: 91, maxMarks: 100 },
        { subject: "Science", marks: 87, maxMarks: 100 },
        { subject: "English", marks: 83, maxMarks: 100 },
        { subject: "Social Studies", marks: 89, maxMarks: 100 },
        { subject: "Hindi", marks: 94, maxMarks: 100 },
      ],
      submittedAt: "2026-02-20",
      status: "pending",
    },
    {
      id: "res004",
      examName: "Unit Test 1",
      studentId: "student003",
      teacherId: "teacher002",
      class: "9B",
      subjects: [
        { subject: "Mathematics", marks: 70, maxMarks: 100 },
        { subject: "Science", marks: 88, maxMarks: 100 },
        { subject: "English", marks: 76, maxMarks: 100 },
      ],
      submittedAt: "2026-01-25",
      status: "approved",
      approvedAt: "2026-01-27",
    },
  ];

  // Notifications
  const notifications: Notification[] = [
    {
      id: "notif001",
      title: "Annual Sports Day Announcement",
      message:
        "We are pleased to announce that the Annual Sports Day will be held on March 15, 2026. All students are required to participate in at least one event. Registration forms are available from your class teachers.",
      date: "2026-02-25",
      postedBy: "principal001",
      type: "general",
    },
    {
      id: "notif002",
      title: "Parent-Teacher Meeting",
      message:
        "A Parent-Teacher Meeting is scheduled for Saturday, March 8, 2026. Parents are requested to collect their ward's progress report and meet respective subject teachers between 9 AM - 1 PM.",
      date: "2026-02-28",
      postedBy: "principal001",
      type: "general",
    },
    {
      id: "notif003",
      title: "Library Book Return",
      message:
        "All students must return borrowed library books by March 5, 2026. Fine will be charged at ₹5 per day for late returns.",
      date: "2026-03-01",
      postedBy: "principal001",
      type: "general",
    },
  ];

  // Homework
  const homework: HomeworkPost[] = [
    {
      id: "hw001",
      subject: "Mathematics",
      title: "Quadratic Equations Practice",
      description:
        "Complete exercises 5.1 to 5.4 from Chapter 5. Solve at least 15 problems showing all working steps. Due Monday.",
      dueDate: "2026-03-09",
      class: "10A",
      teacherId: "teacher001",
      postedAt: "2026-03-02",
    },
    {
      id: "hw002",
      subject: "Science",
      title: "Lab Report - Chemical Reactions",
      description:
        "Write a detailed lab report on the experiments conducted in class today. Include observations, reactions, and conclusions. Minimum 2 pages.",
      dueDate: "2026-03-08",
      class: "9B",
      teacherId: "teacher002",
      postedAt: "2026-03-01",
    },
    {
      id: "hw003",
      subject: "English",
      title: "Essay - My Favourite Season",
      description:
        "Write a 500-word essay on 'My Favourite Season'. Focus on descriptive language and paragraph structure. Handwritten submissions only.",
      dueDate: "2026-03-07",
      class: "8C",
      teacherId: "teacher003",
      postedAt: "2026-03-01",
    },
  ];

  // Calendar events
  const calendar: CalendarEvent[] = [
    {
      id: "cal001",
      title: "Holi Holiday",
      type: "holiday",
      date: "2026-03-14",
      description:
        "School closed for Holi festival. Classes resume on March 16.",
      createdBy: "principal001",
    },
    {
      id: "cal002",
      title: "Annual Sports Day",
      type: "event",
      date: "2026-03-15",
      description:
        "Annual Sports Day at school ground. All students to report by 8:00 AM in sports uniform.",
      createdBy: "principal001",
    },
    {
      id: "cal003",
      title: "Mid-Term Examinations Begin",
      type: "exam",
      date: "2026-03-20",
      description:
        "Mid-Term examinations start from March 20. Timetable will be shared by class teachers.",
      createdBy: "principal001",
    },
    {
      id: "cal004",
      title: "Parent-Teacher Meeting",
      type: "event",
      date: "2026-03-08",
      description:
        "PTM for all classes from 9 AM to 1 PM. Parents are requested to bring ward's handbook.",
      createdBy: "principal001",
    },
  ];

  // Leave applications
  const leaves: LeaveApplication[] = [
    {
      id: "leave001",
      applicantId: "teacher002",
      applicantName: "Mr. Amit Verma",
      applicantRole: "teacher",
      type: "sick",
      fromDate: "2026-03-05",
      toDate: "2026-03-06",
      reason: "Suffering from fever and doctor has advised 2 days rest.",
      status: "pending",
      submittedAt: "2026-03-04",
    },
    {
      id: "leave002",
      applicantId: "student001",
      applicantName: "Rahul Mehra",
      applicantRole: "student",
      type: "personal",
      fromDate: "2026-03-10",
      toDate: "2026-03-10",
      reason: "Family function - cousin's wedding ceremony.",
      status: "approved",
      submittedAt: "2026-03-03",
    },
  ];

  // Timetable for class 10A
  const timetable: Timetable[] = [
    {
      id: "tt001",
      class: "10A",
      schedule: {
        Monday: {
          "Period 1": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 2": { subject: "Science", teacher: "Mr. Amit Verma" },
          "Period 3": { subject: "English", teacher: "Ms. Neha Gupta" },
          "Period 4": { subject: "Social Studies", teacher: "Mr. Kumar" },
          "Period 5": { subject: "Lunch Break", teacher: "" },
          "Period 6": { subject: "Hindi", teacher: "Mrs. Dubey" },
          "Period 7": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 8": { subject: "Physical Education", teacher: "Mr. Rajan" },
        },
        Tuesday: {
          "Period 1": { subject: "English", teacher: "Ms. Neha Gupta" },
          "Period 2": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 3": { subject: "Science Lab", teacher: "Mr. Amit Verma" },
          "Period 4": { subject: "Science Lab", teacher: "Mr. Amit Verma" },
          "Period 5": { subject: "Lunch Break", teacher: "" },
          "Period 6": { subject: "Social Studies", teacher: "Mr. Kumar" },
          "Period 7": { subject: "Hindi", teacher: "Mrs. Dubey" },
          "Period 8": { subject: "Art & Craft", teacher: "Ms. Patel" },
        },
        Wednesday: {
          "Period 1": { subject: "Science", teacher: "Mr. Amit Verma" },
          "Period 2": { subject: "Hindi", teacher: "Mrs. Dubey" },
          "Period 3": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 4": { subject: "English", teacher: "Ms. Neha Gupta" },
          "Period 5": { subject: "Lunch Break", teacher: "" },
          "Period 6": { subject: "Computer Science", teacher: "Mr. Sinha" },
          "Period 7": { subject: "Social Studies", teacher: "Mr. Kumar" },
          "Period 8": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
        },
        Thursday: {
          "Period 1": { subject: "Hindi", teacher: "Mrs. Dubey" },
          "Period 2": { subject: "English", teacher: "Ms. Neha Gupta" },
          "Period 3": { subject: "Social Studies", teacher: "Mr. Kumar" },
          "Period 4": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 5": { subject: "Lunch Break", teacher: "" },
          "Period 6": { subject: "Science", teacher: "Mr. Amit Verma" },
          "Period 7": { subject: "Computer Science", teacher: "Mr. Sinha" },
          "Period 8": { subject: "Music", teacher: "Mrs. Roy" },
        },
        Friday: {
          "Period 1": { subject: "Computer Science", teacher: "Mr. Sinha" },
          "Period 2": { subject: "Science", teacher: "Mr. Amit Verma" },
          "Period 3": { subject: "Hindi", teacher: "Mrs. Dubey" },
          "Period 4": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 5": { subject: "Lunch Break", teacher: "" },
          "Period 6": { subject: "English", teacher: "Ms. Neha Gupta" },
          "Period 7": { subject: "Social Studies", teacher: "Mr. Kumar" },
          "Period 8": { subject: "Library", teacher: "Mrs. Kaur" },
        },
        Saturday: {
          "Period 1": { subject: "Mathematics", teacher: "Mrs. Priya Sharma" },
          "Period 2": { subject: "English", teacher: "Ms. Neha Gupta" },
          "Period 3": { subject: "Science", teacher: "Mr. Amit Verma" },
          "Period 4": { subject: "Hindi", teacher: "Mrs. Dubey" },
          "Period 5": { subject: "Lunch Break", teacher: "" },
          "Period 6": { subject: "Social Studies", teacher: "Mr. Kumar" },
          "Period 7": { subject: "Physical Education", teacher: "Mr. Rajan" },
          "Period 8": { subject: "Assembly / Activities", teacher: "" },
        },
      },
      updatedAt: "2026-02-01",
      updatedBy: "teacher001",
      approvalStatus: "approved",
    },
  ];

  // Online exam sample
  const exams: OnlineExam[] = [
    {
      id: "exam001",
      title: "Mathematics Quick Quiz",
      subject: "Mathematics",
      duration: 20,
      class: "10A",
      teacherId: "teacher001",
      createdAt: "2026-03-01",
      status: "active",
      questions: [
        {
          id: "q1",
          type: "mcq",
          question: "What is the value of x in the equation 2x + 5 = 15?",
          options: ["3", "5", "7", "10"],
          correctAnswer: "5",
        },
        {
          id: "q2",
          type: "mcq",
          question: "Which of the following is a quadratic equation?",
          options: ["2x + 3 = 0", "x² + 3x + 2 = 0", "x³ - 1 = 0", "√x = 4"],
          correctAnswer: "x² + 3x + 2 = 0",
        },
        {
          id: "q3",
          type: "mcq",
          question: "The sum of angles in a triangle is:",
          options: ["90°", "180°", "270°", "360°"],
          correctAnswer: "180°",
        },
        {
          id: "q4",
          type: "short",
          question: "Define the Pythagorean theorem and write its formula.",
        },
        {
          id: "q5",
          type: "mcq",
          question: "What is the HCF of 12 and 18?",
          options: ["3", "4", "6", "9"],
          correctAnswer: "6",
        },
      ],
    },
  ];

  // Portfolio entries
  const portfolio: PortfolioEntry[] = [
    {
      id: "port001",
      studentId: "student001",
      title: "Science Olympiad - District Winner",
      description:
        "Won first prize at the District Level Science Olympiad 2025. Project on renewable energy sources.",
      date: "2025-11-15",
      type: "academic",
      addedBy: "teacher001",
    },
    {
      id: "port002",
      studentId: "student002",
      title: "Inter-School Debate Champion",
      description:
        "Won the inter-school debate competition on the topic 'Technology and Education'. Represented the school at state level.",
      date: "2025-12-10",
      type: "cultural",
      addedBy: "teacher001",
    },
    {
      id: "port003",
      studentId: "student001",
      title: "Football Team Captain",
      description:
        "Led the school football team to victory in the inter-school tournament. Scored 5 goals in the final match.",
      date: "2026-01-20",
      type: "sports",
      addedBy: "teacher001",
    },
    {
      id: "port004",
      studentId: "student003",
      title: "Advanced Programming Skills",
      description:
        "Completed Python programming certification from NPTEL. Built a weather app as final project.",
      date: "2026-02-05",
      type: "skill",
      addedBy: "teacher002",
    },
  ];

  const suggestions: SuggestionQuery[] = [
    {
      id: "sug001",
      studentId: "student001",
      studentName: "Rahul Mehra",
      message:
        "Can we have more practical sessions in the science lab? It would help us understand concepts better.",
      submittedAt: "2026-02-28",
      response:
        "Thank you for your suggestion. We will look into increasing practical sessions in the upcoming term.",
      respondedAt: "2026-03-01",
    },
  ];

  // Save all to localStorage
  setLS(KEYS.PRINCIPAL, {
    id: "principal001",
    password: "admin123",
    name: "Dr. Rajesh Kumar",
    email: "",
    phone: "",
    role: "principal" as Role,
  });
  setLS(KEYS.TEACHERS, teachers);
  setLS(KEYS.STUDENTS, students);
  setLS(KEYS.ATTENDANCE, attendance);
  setLS(KEYS.TEACHER_ATTENDANCE, teacherAttendance);
  setLS(KEYS.FEES, fees);
  setLS(KEYS.RESULTS, results);
  setLS(KEYS.NOTIFICATIONS, notifications);
  setLS(KEYS.HOMEWORK, homework);
  setLS(KEYS.CALENDAR, calendar);
  setLS(KEYS.LEAVES, leaves);
  setLS(KEYS.TIMETABLE, timetable);
  setLS(KEYS.EXAMS, exams);
  setLS(KEYS.EXAM_ATTEMPTS, []);
  setLS(KEYS.PORTFOLIO, portfolio);
  setLS(KEYS.SUGGESTIONS, suggestions);
  localStorage.setItem(KEYS.INITIALIZED, "true");
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
// Data accessors / mutators
// ============================================================

// Teachers
export function getTeachers(): Teacher[] {
  return getLS<Teacher[]>(KEYS.TEACHERS, []);
}
export function saveTeachers(teachers: Teacher[]): void {
  setLS(KEYS.TEACHERS, teachers);
}
export function getTeacherById(id: string): Teacher | undefined {
  return getTeachers().find((t) => t.id === id);
}

// Students
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

// Attendance
export function getAttendance(): AttendanceRecord[] {
  return getLS<AttendanceRecord[]>(KEYS.ATTENDANCE, []);
}
export function saveAttendance(records: AttendanceRecord[]): void {
  setLS(KEYS.ATTENDANCE, records);
}
export function getStudentAttendance(studentId: string): AttendanceRecord[] {
  return getAttendance().filter((a) => a.studentId === studentId);
}

// Teacher Attendance
export function getTeacherAttendance(): TeacherAttendance[] {
  return getLS<TeacherAttendance[]>(KEYS.TEACHER_ATTENDANCE, []);
}
export function saveTeacherAttendance(records: TeacherAttendance[]): void {
  setLS(KEYS.TEACHER_ATTENDANCE, records);
}

// Fees
export function getFees(): FeeRecord[] {
  return getLS<FeeRecord[]>(KEYS.FEES, []);
}
export function saveFees(fees: FeeRecord[]): void {
  setLS(KEYS.FEES, fees);
}
export function getStudentFees(studentId: string): FeeRecord[] {
  return getFees().filter((f) => f.studentId === studentId);
}

// Results
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

// Notifications
export function getNotifications(): Notification[] {
  return getLS<Notification[]>(KEYS.NOTIFICATIONS, []);
}
export function saveNotifications(n: Notification[]): void {
  setLS(KEYS.NOTIFICATIONS, n);
}

// Homework
export function getHomework(): HomeworkPost[] {
  return getLS<HomeworkPost[]>(KEYS.HOMEWORK, []);
}
export function saveHomework(hw: HomeworkPost[]): void {
  setLS(KEYS.HOMEWORK, hw);
}

// Calendar
export function getCalendarEvents(): CalendarEvent[] {
  return getLS<CalendarEvent[]>(KEYS.CALENDAR, []);
}
export function saveCalendarEvents(events: CalendarEvent[]): void {
  setLS(KEYS.CALENDAR, events);
}

// Leaves
export function getLeaves(): LeaveApplication[] {
  return getLS<LeaveApplication[]>(KEYS.LEAVES, []);
}
export function saveLeaves(leaves: LeaveApplication[]): void {
  setLS(KEYS.LEAVES, leaves);
}

// Timetable
export function getTimetables(): Timetable[] {
  return getLS<Timetable[]>(KEYS.TIMETABLE, []);
}
export function saveTimetables(tt: Timetable[]): void {
  setLS(KEYS.TIMETABLE, tt);
}
export function getTimetableByClass(cls: string): Timetable | undefined {
  return getTimetables().find((t) => t.class === cls);
}

// Exams
export function getExams(): OnlineExam[] {
  return getLS<OnlineExam[]>(KEYS.EXAMS, []);
}
export function saveExams(exams: OnlineExam[]): void {
  setLS(KEYS.EXAMS, exams);
}

// Exam Attempts
export function getExamAttempts(): ExamAttempt[] {
  return getLS<ExamAttempt[]>(KEYS.EXAM_ATTEMPTS, []);
}
export function saveExamAttempts(attempts: ExamAttempt[]): void {
  setLS(KEYS.EXAM_ATTEMPTS, attempts);
}

// Portfolio
export function getPortfolio(): PortfolioEntry[] {
  return getLS<PortfolioEntry[]>(KEYS.PORTFOLIO, []);
}
export function savePortfolio(p: PortfolioEntry[]): void {
  setLS(KEYS.PORTFOLIO, p);
}
export function getStudentPortfolio(studentId: string): PortfolioEntry[] {
  return getPortfolio().filter((p) => p.studentId === studentId);
}

// Suggestions
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
  return getLS<HallTicketDesign>(
    "edu_hall_ticket_design",
    DEFAULT_HALL_TICKET_DESIGN,
  );
}

export function saveHallTicketDesign(d: HallTicketDesign): void {
  setLS("edu_hall_ticket_design", d);
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

// Local type aliases matching backend canister interface shapes
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

// ============================================================
// Backend async API
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
    ]);
    setSyncStatus("synced");
  } catch (err) {
    console.error("Backend init failed, using localStorage:", err);
    setSyncStatus("error");
    // Fall back to initializing from localStorage
    initializeData();
  }
}

/** Load teachers from backend canister and update localStorage cache */
export async function syncTeachersFromBackend(): Promise<Teacher[]> {
  try {
    const be = await getBackend();
    const backendTeachers = await be.getTeachers();
    const teachers = backendTeachers.map(teacherFromBackend);
    setLS(KEYS.TEACHERS, teachers);
    return teachers;
  } catch (err) {
    console.error("syncTeachersFromBackend failed:", err);
    return getLS<Teacher[]>(KEYS.TEACHERS, []);
  }
}

/** Load students from backend canister and update localStorage cache */
export async function syncStudentsFromBackend(): Promise<Student[]> {
  try {
    const be = await getBackend();
    const backendStudents = await be.getStudents();
    const students = backendStudents.map(studentFromBackend);
    setLS(KEYS.STUDENTS, students);
    return students;
  } catch (err) {
    console.error("syncStudentsFromBackend failed:", err);
    return getLS<Student[]>(KEYS.STUDENTS, []);
  }
}

/** Load principal profile from backend canister and update localStorage cache */
export async function syncPrincipalFromBackend(): Promise<void> {
  try {
    const be = await getBackend();
    const p = await be.getPrincipalProfile();
    const profile = principalFromBackend(p);
    setLS(KEYS.PRINCIPAL, profile);
  } catch (err) {
    console.error("syncPrincipalFromBackend failed:", err);
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
        class: result.studentClass ?? result.class ?? "",
      };
    }
    if (role === "student") {
      const result = await be.loginStudent(id, password);
      if (!result) return null;
      return {
        id: result.id,
        name: result.name,
        role: "student",
        class: result.studentClass ?? result.class ?? "",
      };
    }
    return null;
  } catch (err) {
    console.error(
      "authenticateAsync failed, falling back to localStorage:",
      err,
    );
    // Fall back to sync auth from localStorage cache
    return authenticate(role, id, password);
  }
}

/** Save (add or update) a teacher to the backend canister and localStorage cache */
export async function saveTeacherToBackend(teacher: Teacher): Promise<void> {
  const backendTeacher = teacherToBackend(teacher);
  try {
    const be = await getBackend();
    // Check if teacher already exists
    const existing = await be.getTeacherById(teacher.id);
    if (existing) {
      await be.updateTeacher(teacher.id, backendTeacher);
    } else {
      await be.addTeacher(backendTeacher);
    }
  } catch (err) {
    console.error("saveTeacherToBackend failed:", err);
    throw err;
  }
  // Always update localStorage cache
  const teachers = getLS<Teacher[]>(KEYS.TEACHERS, []);
  const idx = teachers.findIndex((t) => t.id === teacher.id);
  if (idx >= 0) {
    teachers[idx] = teacher;
  } else {
    teachers.push(teacher);
  }
  setLS(KEYS.TEACHERS, teachers);
}

/** Delete a teacher from the backend canister and localStorage cache */
export async function deleteTeacherFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteTeacher(id);
  } catch (err) {
    console.error("deleteTeacherFromBackend failed:", err);
    throw err;
  }
  const teachers = getLS<Teacher[]>(KEYS.TEACHERS, []).filter(
    (t) => t.id !== id,
  );
  setLS(KEYS.TEACHERS, teachers);
}

/** Save (add or update) a student to the backend canister and localStorage cache */
export async function saveStudentToBackend(student: Student): Promise<void> {
  const backendStudent = studentToBackend(student);
  try {
    const be = await getBackend();
    const existing = await be.getStudentById(student.id);
    if (existing) {
      await be.updateStudent(student.id, backendStudent);
    } else {
      await be.addStudent(backendStudent);
    }
  } catch (err) {
    console.error("saveStudentToBackend failed:", err);
    throw err;
  }
  const students = getLS<Student[]>(KEYS.STUDENTS, []);
  const idx = students.findIndex((s) => s.id === student.id);
  if (idx >= 0) {
    students[idx] = student;
  } else {
    students.push(student);
  }
  setLS(KEYS.STUDENTS, students);
}

/** Delete a student from the backend canister and localStorage cache */
export async function deleteStudentFromBackend(id: string): Promise<void> {
  try {
    const be = await getBackend();
    await be.deleteStudent(id);
  } catch (err) {
    console.error("deleteStudentFromBackend failed:", err);
    throw err;
  }
  const students = getLS<Student[]>(KEYS.STUDENTS, []).filter(
    (s) => s.id !== id,
  );
  setLS(KEYS.STUDENTS, students);
}

/** Save principal profile to backend canister and localStorage cache */
export async function savePrincipalToBackend(
  profile: PrincipalProfile,
): Promise<void> {
  const backendProfile = principalToBackend(profile);
  try {
    const be = await getBackend();
    await be.savePrincipalProfile(backendProfile);
  } catch (err) {
    console.error("savePrincipalToBackend failed:", err);
    throw err;
  }
  setLS(KEYS.PRINCIPAL, profile);
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
