# EduManage Pro

## Current State
The app has a Motoko backend canister that stores only: principal profile, teachers, and students. All other data (attendance, teacher attendance, fees, exam results, notifications, homework, calendar events, leave applications, timetables, online exams, exam attempts, portfolio entries, suggestions, hall ticket design) is stored exclusively in browser localStorage. This means any data added or changed on one device is invisible on any other device.

## Requested Changes (Diff)

### Add
- Backend canister storage for all remaining data types: StudentAttendance, TeacherAttendance, FeeRecord, ExamResult, Notification, HomeworkPost, CalendarEvent, LeaveApplication, Timetable, OnlineExam, ExamAttempt, PortfolioEntry, SuggestionQuery, HallTicketDesign
- Backend CRUD functions for each new data type: get all, add, update by id, delete by id
- Frontend async sync functions in data.ts for all new data types: load from backend into localStorage cache, save to backend and cache
- On app load (initializeBackend), sync all data types from canister, not just teachers/students/principal
- All dashboard write operations (add, update, delete) must call the async backend function so data is persisted in the canister and visible on all devices

### Modify
- Motoko main.mo: add storage variables and CRUD methods for all missing data types
- data.ts initializeBackend(): extend to sync all data types from canister
- PrincipalDashboard, TeacherDashboard, StudentDashboard: switch all mutating operations (save, delete, update) to use the new async backend functions instead of pure localStorage writes

### Remove
- No features removed; no UI changes

## Implementation Plan
1. Extend main.mo with stable variables and CRUD for: StudentAttendance, TeacherAttendance, FeeRecord, ExamResult, Notification, HomeworkPost, CalendarEvent, LeaveApplication, Timetable, OnlineExam, ExamAttempt, PortfolioEntry, SuggestionQuery, HallTicketDesign
2. Add JSON-based storage for complex/nested types (schedule, questions, answers, subjects) using Text fields serialized as JSON strings
3. In data.ts, add async sync/save/delete functions for each new data type mirroring the existing teacher/student pattern
4. Extend initializeBackend() to call all new sync functions
5. Update all dashboard mutation handlers to use async backend functions (show loading states where needed)
6. Seed data on first run via initializeIfNeeded() on the backend
