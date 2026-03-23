# EduR

## Current State
PrincipalDashboard.tsx contains FeeReports and SendMessageToParents components that appear blank when opened. Both components read data from localStorage via a one-shot `useState` initializer that only fires at mount time. There is no `useEffect` to refresh data, no error boundary around `renderSection()`, and the Tabs/TabsContent pattern in FeeReports can cause invisible content on re-renders.

## Requested Changes (Diff)

### Add
- `useEffect` in `FeeReports` to re-read `getFees()` and `getStudents()` after mount (and when section becomes active), so data loads even if backend sync hasn't completed before mount
- `useEffect` in `SendMessageToParents` to re-read `getStudents()` after mount
- A simple functional error boundary wrapper around `renderSection()` to prevent whole-dashboard blank screens from component crashes

### Modify
- `FeeReports`: Convert `allFees` and `allStudents` from one-shot `useState` initializer to updatable state with `useEffect` refresh
- `FeeReports`: Fix `Tabs`/`TabsContent` pattern — use four separate `<TabsContent>` elements (one per period value) instead of a single dynamic one, to avoid invisible content race condition
- `FeeReports`: Fix `f.receiptNumber` in PDF template string and CSV export to use `?? "—"` guard
- `SendMessageToParents`: Convert `allStudents` from one-shot initializer to updatable state with `useEffect` refresh

### Remove
- Nothing removed

## Implementation Plan
1. In `FeeReports`: change `useState<FeeRecord[]>(() => getFees())` to `useState<FeeRecord[]>([])` and add `useEffect(() => { setAllFees(getFees()); setAllStudents(getStudents()); }, [])` to load data after mount
2. In `FeeReports`: replace single `<TabsContent value={period}>` with four `<TabsContent value="daily">`, `<TabsContent value="weekly">`, etc. each rendering the summary cards and filtering the correct period
3. In `FeeReports` PDF/CSV: replace `f.receiptNumber` with `f.receiptNumber ?? "—"` (PDF) and `f.receiptNumber ?? ""` (CSV)
4. In `SendMessageToParents`: change `useState<Student[]>(() => getStudents())` to `useState<Student[]>([])` and add `useEffect(() => { setAllStudents(getStudents()); }, [])` 
5. Wrap `{renderSection()}` in the main return with a simple try/catch error boundary component that shows a fallback instead of blanking the whole dashboard
