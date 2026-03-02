# EduManage Pro

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full school management web app with three user roles: Principal, Teacher, Student
- Role-based login page with mock credentials stored/checked in localStorage
- Principal dashboard: manage teachers/students, post notifications, academic calendar, publish results, leave approvals, school stats
- Teacher dashboard: add/remove students, mark attendance, fee updates, upload marks, student progress, portfolio, timetable, homework, online exams, hall tickets, leave application, personal attendance
- Student dashboard: results, progress charts, timetable, hall ticket, online exams, fee status, notifications, attendance, leave application, suggestions
- Chart.js integration for progress visualization (bar, line, radar charts)
- Toast notification system
- Modal dialogs for all forms
- Search/filter on all data tables
- Pre-populated sample data: 1 principal, 3 teachers, 5 students with realistic records

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Create `frontend/index.html` as the single-page app entry point
2. Inline all CSS in `<style>` block: sidebar layout, dashboard cards, tables, modals, toast, responsive
3. Inline all JS in `<script>` block:
   - localStorage init with sample data
   - Auth flow (login/logout, role detection, session persistence)
   - Router (show/hide sections based on nav clicks)
   - Principal module: teacher CRUD, student list, notifications, calendar, results approval, leave approvals, stats
   - Teacher module: student CRUD, attendance marking, fee updates, marks upload, portfolio, timetable, homework, exam builder, hall tickets
   - Student module: results view, progress charts, timetable view, hall ticket, exam attempt, fee view, notifications, attendance view, leave apply, suggestions
   - Chart.js calls for progress charts (bar, line, radar)
   - Toast and modal helpers
4. Load Chart.js and Font Awesome from CDN
