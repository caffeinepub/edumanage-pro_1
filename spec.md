# EduR

## Current State
The principal's "Send Message to Parents" section has message templates with only `{studentName}` and `{class}` placeholders. When sending to multiple parents, the message is the same for everyone with only the name substituted.

## Requested Changes (Diff)

### Add
- New personalized placeholders in templates: `{feeStatus}`, `{feeAmount}`, `{totalMarks}`, `{percentage}`, `{rank}`, `{examName}`
- Auto-fill logic: for each student, look up their latest fee record and latest approved exam result, calculate rank within their class, and substitute all placeholders before sending
- New templates: "Results Update" (includes marks, rank, percentage) and "Fee Status" (includes fee status and amount)
- Preview column in the student table showing a truncated personalized message per student before sending

### Modify
- `MESSAGE_TEMPLATES` constants to include new placeholders and new template entries
- `buildMessage` function to accept fee and result data and resolve all placeholders per student
- `SendMessageToParents` component to load fees and results alongside students and pass them to `buildMessage`

### Remove
- Nothing removed

## Implementation Plan
1. Add new template strings with all placeholders
2. In `SendMessageToParents`, load `getFees()` and `getResults()` on mount
3. Build per-student lookup maps: latest fee record and latest approved exam result
4. Calculate class ranks from approved results
5. Update `buildMessage` to resolve `{feeStatus}`, `{feeAmount}`, `{totalMarks}`, `{percentage}`, `{rank}`, `{examName}`
6. Add a "Preview" column in the student rows showing a 60-char preview of the personalized message
