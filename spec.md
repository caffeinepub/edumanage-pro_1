# EduManage Pro

## Current State

Full-stack school management system for Rahmaniyya Public School, Akampadam. Three portals: Principal, Teacher, Student. All data stored in backend canister for cross-device sync. React + TypeScript frontend with Motoko backend.

### Backend
Complete backend with CRUD for: teachers, students, principal profile, student attendance, teacher attendance, fee records, exam results, notifications, homework, calendar events, leave applications, timetables, online exams, exam attempts, portfolio entries, suggestions, hall ticket design, and game scores.

### Frontend - Principal Portal
- My Profile (name, email, phone, username, password, photo, institution logo, school name)
- Manage Students (add/edit/delete, photo upload, year-end promotion)
- Manage Teachers (add/edit/delete, photo upload)
- Student Attendance (view attendance for all classes)
- Teacher Attendance Approval (approve/reject teacher attendance submissions)
- Upload/Publish Results (enter marks per student with custom total marks per subject, publish results, delete results)
- Download Ranked Results (PDF/print ranked table)
- Post Notifications (add/delete announcements with PDF/image attachment)
- Academic Calendar (add/delete events)
- Fee Overview (daily/weekly/monthly/yearly summary with filters and CSV download)
- Fee Report (filter by class/student, add/delete, PDF + CSV download)
- Timetable Approval (approve/reject submitted timetables)
- Hall Tickets (custom design: school name, tagline, header color, exam details, subject schedule with dates/times, signatures, border style; preview per student; print)
- Student Suggestions (view and reply to student queries)
- Send Message to Parents (WhatsApp-based messaging to parent phone numbers, with templates)
- Leave Management (approve/reject leave applications)
- Online Exams management

### Frontend - Teacher Portal
- My Profile (view photo, name, subject, class, email, phone)
- Mark Student Attendance (by class, today only)
- View/Upload Student Marks (with custom total marks per subject per exam)
- Progress Cards (download per-student or all-student progress cards with photo, rank, percentage, grade, subject marks)
- Homework Management (add/delete homework posts)
- Fee Updates (update student fee with receipt number)
- Student Portfolio (add portfolio entries)
- Timetable (create/submit timetable for principal approval)
- Online Exams (create/manage exams)
- Teacher Attendance (mark today's attendance with check-in/check-out time and status)
- Leave Applications (submit leave requests)
- My Results / Publish Results

### Frontend - Student Portal
- My Profile (view photo, name, class, roll number, parent info)
- My Results (exam results with rank, percentage, total marks)
- My Attendance
- My Timetable (view approved timetable)
- My Homework
- Fee Status (view fee records with receipt number)
- Notifications (view announcements with PDF/image attachments)
- Leave Application (submit leave requests)
- Suggestions & Queries (submit queries, view replies)
- AI Assistant (in-app chatbot answering questions about attendance, results, fees, homework)
- Learning Games (class-appropriate educational games with leaderboard):
  - LKG/UKG: Alphabet Match, Number Counting, Color Match
  - Class 1-3: Word Builder, Spell the Word, Rhyming Words
  - Class 1-4: Maths Challenge, Times Table Quiz
  - Class 3-4: Sentence Scramble
  - Leaderboard tab showing top 10 classmates per game

### PWA
Configured as Progressive Web App with service worker, manifest, offline support, school logo as app icon.

## Requested Changes (Diff)

### Add
- Nothing new; this is a full rebuild/redeploy of existing functionality

### Modify
- Ensure all data syncs cross-device via backend canister (already implemented in data.ts)
- Ensure teacher attendance only allows today (not previous dates)
- Ensure hall ticket is removed from student portal

### Remove
- Nothing

## Implementation Plan

1. Preserve existing App.tsx, backend.d.ts, data.ts store -- these are correct
2. Rebuild/validate all three dashboards (Principal, Teacher, Student) with full feature set
3. Ensure LoginPage shows school logo from principal profile or fallback to /assets/uploads/logo-rah-1-1.png
4. Ensure PWA manifest and service worker are configured
5. Validate build passes typecheck and lint
