import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExamAttempt {
    id: string;
    studentId: string;
    answersJson: string;
    submittedAt: string;
    score: number;
    examId: string;
    timeTaken: bigint;
}
export interface PrincipalProfile {
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
}
export interface StudentAttendance {
    id: string;
    status: string;
    studentId: string;
    date: string;
    markedBy: string;
}
export interface Suggestion {
    id: string;
    studentId: string;
    studentName: string;
    submittedAt: string;
    message: string;
    response: string;
    respondedAt: string;
}
export interface AuthWithClassResult {
    id: string;
    class: string;
    name: string;
    role: string;
}
export type FeeStatus = string;
export interface Teacher {
    id: string;
    subject: string;
    class: string;
    password: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    photo: string;
}
export interface Timetable {
    id: string;
    approvedAt: string;
    approvedBy: string;
    class: string;
    approvalStatus: string;
    approvalNote: string;
    updatedAt: string;
    updatedBy: string;
    scheduleJson: string;
}
export interface TeacherAttendance {
    id: string;
    status: string;
    date: string;
    approvedBy: string;
    checkInTime: string;
    approvalStatus: string;
    approvalNote: string;
    teacherId: string;
    checkOutTime: string;
}
export interface SubjectMarks {
    marks: number;
    subject: string;
    maxMarks: number;
}
export interface FeeRecord {
    id: string;
    status: FeeStatus;
    method: string;
    studentId: string;
    date: string;
    description: string;
    amount: number;
    receiptNumber: string;
}
export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    createdBy: string;
    type: string;
    description: string;
}
export interface Notification {
    id: string;
    title: string;
    postedBy: string;
    date: string;
    type: string;
    message: string;
    attachmentName: string;
    targetClass: string;
    attachment: string;
}
export interface GameScore {
    id: string;
    total: bigint;
    studentId: string;
    studentName: string;
    playedAt: string;
    class: string;
    gameId: string;
    score: bigint;
    stars: bigint;
}
export interface Exam {
    id: string;
    status: string;
    title: string;
    duration: bigint;
    subject: string;
    class: string;
    createdAt: string;
    questionsJson: string;
    teacherId: string;
}
export interface LeaveApplication {
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
}
export interface HallTicketDesign {
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
}
export interface ExamResult {
    id: string;
    status: string;
    studentId: string;
    subjects: Array<SubjectMarks>;
    approvedAt: string;
    class: string;
    submittedAt: string;
    teacherId: string;
    examName: string;
}
export interface Homework {
    id: string;
    title: string;
    postedAt: string;
    subject: string;
    class: string;
    dueDate: string;
    description: string;
    teacherId: string;
}
export interface PortfolioEntry {
    id: string;
    title: string;
    studentId: string;
    date: string;
    type: string;
    description: string;
    addedBy: string;
}
export interface AuthResult {
    id: string;
    name: string;
    role: string;
}
export interface Student {
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
}
export interface backendInterface {
    addCalendarEvent(event: CalendarEvent): Promise<void>;
    addExam(exam: Exam): Promise<void>;
    addExamAttempt(attempt: ExamAttempt): Promise<void>;
    addExamResult(result: ExamResult): Promise<void>;
    addFeeRecord(record: FeeRecord): Promise<void>;
    addHomework(assignment: Homework): Promise<void>;
    addLeaveApplication(application: LeaveApplication): Promise<void>;
    addNotification(notification: Notification): Promise<void>;
    addPortfolioEntry(entry: PortfolioEntry): Promise<void>;
    addStudent(student: Student): Promise<void>;
    addStudentAttendance(attendance: StudentAttendance): Promise<void>;
    addSuggestion(suggestion: Suggestion): Promise<void>;
    addTeacher(teacher: Teacher): Promise<void>;
    addTeacherAttendance(attendance: TeacherAttendance): Promise<void>;
    addTimetable(timetable: Timetable): Promise<void>;
    deleteCalendarEvent(id: string): Promise<void>;
    deleteExam(id: string): Promise<void>;
    deleteExamAttempt(id: string): Promise<void>;
    deleteExamResult(id: string): Promise<void>;
    deleteFeeRecord(id: string): Promise<void>;
    deleteHomework(id: string): Promise<void>;
    deleteLeaveApplication(id: string): Promise<void>;
    deleteNotification(id: string): Promise<void>;
    deletePortfolioEntry(id: string): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    deleteStudentAttendance(id: string): Promise<void>;
    deleteSuggestion(id: string): Promise<void>;
    deleteTeacher(id: string): Promise<void>;
    deleteTeacherAttendance(id: string): Promise<void>;
    deleteTimetable(id: string): Promise<void>;
    getAllCalendarEvents(): Promise<Array<CalendarEvent>>;
    getAllExamAttempts(): Promise<Array<ExamAttempt>>;
    getAllExamResults(): Promise<Array<ExamResult>>;
    getAllExams(): Promise<Array<Exam>>;
    getAllFeeRecords(): Promise<Array<FeeRecord>>;
    getAllHomework(): Promise<Array<Homework>>;
    getAllLeaveApplications(): Promise<Array<LeaveApplication>>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAllPortfolioEntries(): Promise<Array<PortfolioEntry>>;
    getAllStudentAttendance(): Promise<Array<StudentAttendance>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllSuggestions(): Promise<Array<Suggestion>>;
    getAllTeacherAttendance(): Promise<Array<TeacherAttendance>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAllTimetables(): Promise<Array<Timetable>>;
    getGameLeaderboard(gameId: string, class: string): Promise<Array<GameScore>>;
    getGameScoresForStudent(studentId: string): Promise<Array<GameScore>>;
    getHallTicketDesign(): Promise<HallTicketDesign | null>;
    getMyGameScores(studentId: string): Promise<Array<GameScore>>;
    getPrincipalProfile(): Promise<PrincipalProfile>;
    initializeIfNeeded(): Promise<void>;
    initializeStudents(): Promise<void>;
    initializeTeachers(): Promise<void>;
    loginPrincipal(id: string, password: string): Promise<AuthResult | null>;
    loginStudent(id: string, password: string): Promise<AuthWithClassResult | null>;
    loginTeacher(id: string, password: string): Promise<AuthWithClassResult | null>;
    saveGameScore(gameScore: GameScore): Promise<void>;
    saveHallTicketDesign(newDesign: HallTicketDesign): Promise<void>;
    savePrincipalProfile(profile: PrincipalProfile): Promise<void>;
    updateCalendarEvent(id: string, event: CalendarEvent): Promise<boolean>;
    updateExam(id: string, exam: Exam): Promise<boolean>;
    updateExamAttempt(id: string, attempt: ExamAttempt): Promise<boolean>;
    updateExamResult(id: string, result: ExamResult): Promise<boolean>;
    updateFeeRecord(id: string, record: FeeRecord): Promise<boolean>;
    updateHomework(id: string, assignment: Homework): Promise<boolean>;
    updateLeaveApplication(id: string, application: LeaveApplication): Promise<boolean>;
    updateNotification(id: string, notification: Notification): Promise<boolean>;
    updatePortfolioEntry(id: string, entry: PortfolioEntry): Promise<boolean>;
    updateStudent(id: string, student: Student): Promise<boolean>;
    updateStudentAttendance(id: string, attendance: StudentAttendance): Promise<boolean>;
    updateSuggestion(id: string, suggestion: Suggestion): Promise<boolean>;
    updateTeacher(id: string, teacher: Teacher): Promise<boolean>;
    updateTeacherAttendance(id: string, attendance: TeacherAttendance): Promise<boolean>;
    updateTimetable(id: string, timetable: Timetable): Promise<boolean>;
}
