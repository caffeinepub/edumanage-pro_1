# EduR

## Current State
Principal dashboard has tabs: Overview, Manage Teachers, Manage Students, Post Notifications, Academic Calendar, Publish Results, Leave Approvals, Teacher Attendance, Student Suggestions, Timetable Approval, Expenses & Income, My Profile.

The Hall Ticket, Fee Reports, and Send Message to Parents tabs were previously removed from the principal sidebar.

## Requested Changes (Diff)

### Add
- **Hall Ticket** tab in principal sidebar: Principal can design hall tickets (institution name, header color, exam details, subject schedule with dates/times, signatures). Uses `saveHallTicketDesign`/`getHallTicketDesign` from backend bindings. Full design form + preview.
- **Fee Reports** tab in principal sidebar: Shows all fee records with filters by class/status, period summaries (daily/weekly/monthly/yearly), PDF/CSV download, add/delete fee entries.
- **Send Message to Parents** tab in principal sidebar: Bulk WhatsApp messaging with templates, personalization per student (wa.me links), and ability to reply/compose messages for parents.

### Modify
- `navItems` array in PrincipalDashboard: add hall-ticket, fee-reports, send-message entries.
- `renderSection` switch: add cases for the three new tabs.

### Remove
- Nothing.

## Implementation Plan
1. Add `HallTicketDesign` (principal version with full design controls) component function to PrincipalDashboard.tsx.
2. Add `FeeReports` component function with fee listing, filters, summaries, PDF/CSV export.
3. Add `SendMessageToParents` component function with WhatsApp message templates and per-student wa.me links.
4. Add the three nav items to `navItems` array.
5. Add the three cases to `renderSection` switch.
