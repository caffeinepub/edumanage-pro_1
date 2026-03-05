# EduManage Pro

## Current State
The principal dashboard has a "Fee Overview" section (`FeeOverview` component) that:
- Shows daily/weekly/monthly/yearly fee status summaries
- Has class and status filters
- Displays a paginated table of fee records
- Has a CSV download button

It does NOT have:
- A student name filter
- PDF download
- Add fee record option
- Delete fee record option

The `FeeRecord` interface: `{ id, studentId, amount, date, status, method, description, receiptNumber? }`

Backend functions available: `getFees`, `saveFees`, `saveFeeToBackend`, `getStudents`, `generateId`, `formatDate`

There is no `deleteFeeFromBackend` function yet — deletion must be handled locally by filtering and saving the updated array.

## Requested Changes (Diff)

### Add
- Student name filter (search input) in the Fee Overview filters row
- "Add Fee Record" button that opens a dialog: select student, amount, date, status, method, description, receipt number
- Delete button per row in the fee table (with confirmation)
- PDF download button that prints a styled fee report (school name, filters applied, table of records, summary totals)
- Rename the section in the sidebar from "Fee Overview" to "Fee Report"

### Modify
- `FeeOverview` function renamed to `FeeReport` and the sidebar nav item updated accordingly
- Filter row extended with student name search input and PDF download button alongside CSV button
- Table rows now include a delete action column

### Remove
- Nothing removed

## Implementation Plan
1. Add a `deleteFeeRecord` helper in the local data store (filter + save locally + remove from backend cache)
2. In `FeeReport`:
   - Add `studentSearch` state and filter logic (case-insensitive name match)
   - Add "Add Fee Record" dialog with full form fields (student select, amount, date, status, method, description, receipt number)
   - Add delete handler per row with a confirm step
   - Add `handleDownloadPDF` using `window.print()` on a dynamically built printable div
   - Add PDF button next to CSV button
3. Rename component, nav item id and label, and switch case from `fee-overview` to `fee-report`
4. Apply deterministic `data-ocid` markers to all new interactive elements
