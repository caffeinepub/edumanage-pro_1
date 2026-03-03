# EduManage Pro

## Current State

The app is a full school management system (Principal, Teacher, Student portals) with all data stored entirely in browser `localStorage`. This means data entered on one device is not visible on any other device -- each browser has its own isolated copy.

Key data types currently in localStorage:
- Principal profile (name, password, photo, logo)
- Teachers list (with photos)
- Students list (with photos)
- Attendance records (student & teacher)
- Fee records
- Exam results
- Notifications (with attachments)
- Homework posts
- Calendar events
- Leave applications
- Timetables
- Online exams & attempts
- Portfolio entries
- Suggestions/queries
- Hall ticket design

The backend canister (`main.mo`) is a minimal stub with only a `ping()` function.

## Requested Changes (Diff)

### Add
- Full Motoko backend with stable storage for all data types
- Backend API functions for CRUD operations on every data type
- Auth functions: login (principal/teacher/student)
- Principal profile management (name, password, photo as base64, institution logo as base64)
- Teacher management (add, update, delete, get all, get by id)
- Student management (add, update, delete, get all, get by id, get by class, get by teacher)
- Attendance (student): add record, get all, get by student
- Teacher attendance: add record, get all, update approval status
- Fee records: add, update, get all, get by student
- Exam results: add, update status (approve/reject), get all, get by student, delete
- Notifications: add (with optional attachment), delete, get all
- Homework: add, delete, get all
- Calendar events: add, delete, get all
- Leave applications: add, update status, get all
- Timetables: save/update by class, get all, get by class, update approval
- Online exams: add, update status, delete, get all
- Exam attempts: add, get all, get by exam, get by student
- Portfolio entries: add, delete, get all, get by student
- Suggestions: add, update with response, get all
- Hall ticket design: save, get

### Modify
- Frontend `store/data.ts`: replace all `localStorage` reads/writes with async calls to the backend canister
- `App.tsx`: handle async initialization (loading state while fetching from canister)
- All dashboard pages: update to call backend functions instead of localStorage helpers

### Remove
- `localStorage`-based data persistence (replace entirely with canister calls)
- `initializeData()` seed function that wrote to localStorage (seed data will be initialized in the Motoko backend)

## Implementation Plan

1. Generate Motoko backend with stable vars for all data types, typed records, and full CRUD + auth query/update functions
2. Update `backend.d.ts` bindings to expose all new canister functions
3. Rewrite `store/data.ts` to be an async API layer calling the backend canister
4. Update `App.tsx` and all pages/components to use async data calls with proper loading states
5. Remove all direct `localStorage` usage from app logic
6. Ensure photos/attachments stored as base64 Text in the canister
7. Validate, typecheck, and build
