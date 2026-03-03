// Safe re-export of the backend canister binding.
// This file exists so TypeScript path aliases can point here instead of the
// auto-generated backend.ts which uses the reserved word 'class' as a
// parameter name (causing TS parse errors in the local stub).
// At deploy time, the real backend.ts is regenerated with valid bindings.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const backend: any = null; // replaced at runtime via dynamic import in data.ts

// Re-export a minimal safe interface so type imports still work
export interface backendInterface {
  addStudent(student: BackendStudent): Promise<void>;
  addTeacher(teacher: BackendTeacher): Promise<void>;
  deleteStudent(id: string): Promise<void>;
  deleteTeacher(id: string): Promise<void>;
  getPrincipalProfile(): Promise<BackendPrincipalProfile>;
  getStudentById(id: string): Promise<BackendStudent | null>;
  getStudents(): Promise<Array<BackendStudent>>;
  getStudentsByClass(className: string): Promise<Array<BackendStudent>>;
  getStudentsByTeacher(teacherId: string): Promise<Array<BackendStudent>>;
  getTeacherById(id: string): Promise<BackendTeacher | null>;
  getTeachers(): Promise<Array<BackendTeacher>>;
  initializeIfNeeded(): Promise<void>;
  initializeStudents(): Promise<void>;
  initializeTeachers(): Promise<void>;
  loginPrincipal(
    id: string,
    password: string,
  ): Promise<{ id: string; name: string; role: string } | null>;
  loginStudent(
    id: string,
    password: string,
  ): Promise<{
    id: string;
    studentClass: string;
    name: string;
    role: string;
  } | null>;
  loginTeacher(
    id: string,
    password: string,
  ): Promise<{
    id: string;
    studentClass: string;
    name: string;
    role: string;
  } | null>;
  savePrincipalProfile(profile: BackendPrincipalProfile): Promise<void>;
  updateStudent(id: string, updatedStudent: BackendStudent): Promise<boolean>;
  updateTeacher(id: string, updatedTeacher: BackendTeacher): Promise<boolean>;
}

export interface BackendPrincipalProfile {
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

export interface BackendTeacher {
  id: string;
  subject: string;
  studentClass: string;
  password: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo: string;
}

export interface BackendStudent {
  id: string;
  studentClass: string;
  password: string;
  name: string;
  role: string;
  parentPhone: string;
  teacherId: string;
  photo: string;
  rollNo: string;
  parentName: string;
}
