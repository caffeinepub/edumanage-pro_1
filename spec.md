# EduManage Pro

## Current State
Full-featured school management system with Principal, Teacher, and Student portals. Principal dashboard includes: Overview, Manage Teachers, Manage Students, Post Notifications, Academic Calendar, Publish Results, Hall Tickets, Leave Approvals, Teacher Attendance, Student Suggestions, Timetable Approval, My Profile.

Student data model includes `parentPhone` and `parentName` fields.

## Requested Changes (Diff)

### Add
- New "Send Message to Parents" section in the principal sidebar
- Feature to compose a custom message and send it to parent phone numbers of all or selected students
- Filter by class to narrow recipients
- "Send via WhatsApp" button per parent that opens `https://wa.me/<phone>?text=<encoded message>` in a new tab
- "Send to All" button that opens WhatsApp links for all selected/filtered students in sequence (one tab per parent)
- Message templates: quick-fill buttons for common message types (Results, Fee Reminder, Notification, General)
- Recipient table showing student name, class, parent name, parent phone, and a checkbox to select/deselect
- Select All / Deselect All option
- Filter by class dropdown

### Modify
- Principal sidebar navItems: add "Send Message" item with a MessageSquare icon
- renderSection switch: add case for "send-message"

### Remove
- Nothing removed

## Implementation Plan
1. Add `SendMessageToParents` component in PrincipalDashboard.tsx
   - State: message text, selected student IDs, class filter
   - Message template quick-fill buttons (Results, Fee Reminder, Announcement, General)
   - Recipient table with checkboxes, student name, class, parent name, parent phone
   - Class filter dropdown (All + unique classes)
   - Select All / Deselect All toggle
   - "Send to Selected via WhatsApp" button - iterates selected students and opens wa.me links
   - Individual "Send" button per row
2. Add nav item `{ id: "send-message", label: "Send Message to Parents", icon: <Send /> }` to navItems array
3. Add `case "send-message": return <SendMessageToParents />;` to renderSection
