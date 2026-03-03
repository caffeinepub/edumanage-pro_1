import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
    addStudent(student: Student): Promise<void>;
    addTeacher(teacher: Teacher): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    deleteTeacher(id: string): Promise<void>;
    getPrincipalProfile(): Promise<PrincipalProfile>;
    getStudentById(id: string): Promise<Student | null>;
    getStudents(): Promise<Array<Student>>;
    getStudentsByClass(className: string): Promise<Array<Student>>;
    getStudentsByTeacher(teacherId: string): Promise<Array<Student>>;
    getTeacherById(id: string): Promise<Teacher | null>;
    getTeachers(): Promise<Array<Teacher>>;
    initializeIfNeeded(): Promise<void>;
    initializeStudents(): Promise<void>;
    initializeTeachers(): Promise<void>;
    loginPrincipal(id: string, password: string): Promise<{
        id: string;
        name: string;
        role: string;
    } | null>;
    loginStudent(id: string, password: string): Promise<{
        id: string;
        studentClass: string;
        name: string;
        role: string;
    } | null>;
    loginTeacher(id: string, password: string): Promise<{
        id: string;
        studentClass: string;
        name: string;
        role: string;
    } | null>;
    savePrincipalProfile(profile: PrincipalProfile): Promise<void>;
    updateStudent(id: string, updatedStudent: Student): Promise<boolean>;
    updateTeacher(id: string, updatedTeacher: Teacher): Promise<boolean>;
}
