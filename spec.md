# EduManage Pro

## Current State
The app uses a localStorage cache backed by a backend canister. All data syncs from canister on load, and writes go to both the canister and localStorage. However, every write operation (save, update) currently makes an extra `getAll` call first to check if a record exists before deciding to call `add` or `update`. This doubles every write round-trip and makes the app noticeably slow.

Additionally, the app loading screen has no meaningful progress feedback — it shows a single "Connecting to school server..." message and users wait without any indication of progress.

## Requested Changes (Diff)

### Add
- A `FeeReport` section in the principal dashboard: filter by class and/or student, view a detailed table, and download as PDF.
- A smarter `initializeBackend` that shows parallel sync progress.

### Modify
- All write operations in `data.ts` that do an extra `getAll` check before add/update:
  - `saveTeacherToBackend` — remove inner `getAllTeachers` lookup; use `updateTeacher` directly if `id` matches, else `addTeacher`
  - `saveStudentToBackend` — same pattern
  - `saveFeeToBackend` — remove inner `getAllFeeRecords` lookup
  - `saveResultToBackend` — remove inner `getAllExamResults` lookup
  - `saveNotificationToBackend` — remove inner `getAllNotifications` lookup
  - `saveHomeworkToBackend` — remove inner `getAllHomework` lookup
  - `saveCalendarEventToBackend` — remove inner `getAllCalendarEvents` lookup
  - `saveLeaveToBackend` — remove inner `getAllLeaveApplications` lookup
  - `saveTimetableToBackend` — remove inner `getAllTimetables` lookup
  - `saveExamToBackend` — remove inner `getAllExams` lookup
  - `saveExamAttemptToBackend` — remove inner `getAllExamAttempts` lookup
  - `savePortfolioEntryToBackend` — remove inner `getAllPortfolioEntries` lookup
  - `saveSuggestionToBackend` — remove inner `getAllSuggestions` lookup
- Strategy: use the localStorage cache to determine add vs update (if `id` exists in local cache = update, else add). This avoids any extra backend round-trip.
- `saveFeesToBackend` batch — same optimization: use local cache as source of truth for existing IDs.
- `saveResultsBatchToBackend` — same
- `saveAttendanceBatchToBackend` — same
- `saveTeacherAttendanceBatchToBackend` — same

### Remove
- Nothing removed from the UI.

## Implementation Plan
1. Refactor all single-record write helpers in `data.ts` to check localStorage cache for existence instead of calling `getAll` on backend. This eliminates one backend round-trip per write operation.
2. Refactor all batch write helpers (`saveFeesToBackend`, `saveResultsBatchToBackend`, `saveAttendanceBatchToBackend`, `saveTeacherAttendanceBatchToBackend`) the same way.
3. Add a `FeeReport` section to the principal dashboard sidebar with class+student filters and a print/PDF download button.
4. Ensure all changes pass typecheck and lint.
