import {
  Bell,
  Calendar,
  CheckSquare,
  DashboardLayout,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "@/components/DashboardLayout";
import { TablePagination } from "@/components/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/hooks/usePagination";
import {
  type CalendarEvent,
  type CurrentUser,
  type ExamResult,
  type FeeRecord,
  type FinancialRecord,
  type HallTicketDesign,
  type HallTicketSubject,
  type LeaveApplication,
  type Notification,
  type Student,
  type SuggestionQuery,
  type Teacher,
  type TeacherAttendance,
  type Timetable,
  calcAttendancePercent,
  deleteCalendarEventFromBackend,
  deleteFinancialRecord,
  deleteNotificationFromBackend,
  deleteResultFromBackend,
  deleteStudentFromBackend,
  deleteTeacherFromBackend,
  formatDate,
  generateId,
  getAttendance,
  getCalendarEvents,
  getFees,
  getFinancialRecords,
  getHallTicketDesign,
  getLeaves,
  getNotifications,
  getPrincipalProfile,
  getResults,
  getStudents,
  getSuggestions,
  getTeacherAttendance,
  getTeachers,
  getTimetables,
  saveCalendarEventToBackend,
  saveCalendarEvents,
  saveFeeToBackend,
  saveFees,
  saveFinancialRecord,
  saveHallTicketDesign,
  saveHallTicketDesignToBackend,
  saveLeaveToBackend,
  saveLeaves,
  saveNotificationToBackend,
  saveNotifications,
  savePrincipalProfile,
  savePrincipalToBackend,
  saveResultToBackend,
  saveResults,
  saveStudentToBackend,
  saveStudents,
  saveSuggestionToBackend,
  saveSuggestions,
  saveTeacherAttendance,
  saveTeacherToBackend,
  saveTeachers,
  saveTimetableToBackend,
  saveTimetables,
  setCurrentUser,
  syncStudentsFromBackend,
  syncTeachersFromBackend,
  updateTeacherAttendanceInBackend,
} from "@/store/data";
import {
  Check,
  Clock,
  DollarSign,
  Download,
  FileDown,
  LayoutGrid,
  MessageSquare,
  Paperclip,
  Plus,
  Printer,
  Send,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: CurrentUser;
  onLogout: () => void;
}

// ============================================================
// Section Error Boundary
// ============================================================
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode; name: string }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-destructive">
            Something went wrong loading {this.props.name}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {this.state.error ||
              "An unexpected error occurred. Please try refreshing the page."}
          </p>
          <Button onClick={() => this.setState({ hasError: false, error: "" })}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// Overview
// ============================================================
function Overview() {
  const teachers = useMemo(() => getTeachers(), []);
  const students = useMemo(() => getStudents(), []);
  const attendance = useMemo(() => getAttendance(), []);
  const results = useMemo(() => getResults(), []);
  const leaves = useMemo(() => getLeaves(), []);

  // Build attendance index for O(1) lookups per student
  const attendanceByStudent = useMemo(() => {
    const map: Record<string, typeof attendance> = {};
    for (const a of attendance) {
      if (!map[a.studentId]) map[a.studentId] = [];
      map[a.studentId].push(a);
    }
    return map;
  }, [attendance]);

  // Avg attendance across all students (memoized)
  const avgAtt = useMemo(() => {
    if (students.length === 0) return 0;
    const total = students.reduce((acc, s) => {
      const recs = attendanceByStudent[s.id] ?? [];
      return acc + calcAttendancePercent(recs);
    }, 0);
    return Math.round(total / students.length);
  }, [students, attendanceByStudent]);

  const pendingResults = useMemo(
    () => results.filter((r) => r.status === "pending").length,
    [results],
  );
  const pendingLeaves = useMemo(
    () =>
      leaves.filter(
        (l) => l.status === "pending" && l.applicantRole === "teacher",
      ).length,
    [leaves],
  );

  const statCards = [
    {
      label: "Total Teachers",
      value: teachers.length,
      icon: "👩‍🏫",
      color: "oklch(0.92 0.08 264)",
    },
    {
      label: "Total Students",
      value: students.length,
      icon: "🎓",
      color: "oklch(0.92 0.1 150)",
    },
    {
      label: "Avg Attendance",
      value: `${avgAtt}%`,
      icon: "📊",
      color: "oklch(0.95 0.1 70)",
    },
    {
      label: "Pending Approvals",
      value: pendingResults + pendingLeaves,
      icon: "⏳",
      color: "oklch(0.95 0.1 25)",
    },
  ];

  const notifications = useMemo(() => getNotifications().slice(0, 3), []);
  const calEvents = useMemo(
    () =>
      getCalendarEvents()
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [],
  );

  // Fee summary for overview
  const feeSummary = useMemo(() => {
    const fees = getFees();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    function buildStats(records: typeof fees) {
      const paid = records
        .filter((r) => r.status === "paid")
        .reduce((a, r) => a + r.amount, 0);
      const pending = records
        .filter((r) => r.status === "pending")
        .reduce((a, r) => a + r.amount, 0);
      const partial = records
        .filter((r) => r.status === "partial")
        .reduce((a, r) => a + r.amount, 0);
      const paidCount = records.filter((r) => r.status === "paid").length;
      const pendingCount = records.filter((r) => r.status === "pending").length;
      const partialCount = records.filter((r) => r.status === "partial").length;
      const total = paid + pending + partial;
      const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;
      return {
        paid,
        pending,
        partial,
        paidCount,
        pendingCount,
        partialCount,
        count: records.length,
        total,
        collectionRate,
      };
    }

    const daily = fees.filter((r) => r.date === todayStr);
    const weekly = fees.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return d >= weekAgo && d <= now;
    });
    const monthly = fees.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const yearly = fees.filter((r) => {
      if (!r.date) return false;
      return new Date(r.date).getFullYear() === currentYear;
    });

    return {
      daily: buildStats(daily),
      weekly: buildStats(weekly),
      monthly: buildStats(monthly),
      yearly: buildStats(yearly),
    };
  }, []);

  const [feePeriod, setFeePeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");

  return (
    <div>
      <h2 className="section-title">School Overview</h2>
      <p className="section-subtitle">
        Welcome back,{" "}
        {JSON.parse(localStorage.getItem("edu_current_user") ?? "{}").name}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: c.color }}
            >
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Fee Status Summary — All Periods */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">
            Fee Collection Summary
          </h3>
        </div>

        {/* Period tabs for mobile detail view */}
        <div className="flex gap-1 mb-3 sm:hidden">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFeePeriod(p)}
              data-ocid={`overview.fee_summary.${p}_tab`}
              className={`flex-1 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                feePeriod === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Mobile: single period detail */}
        <div className="sm:hidden bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-3 capitalize font-medium">
            {feePeriod === "daily"
              ? "Today"
              : feePeriod === "weekly"
                ? "Last 7 Days"
                : feePeriod === "monthly"
                  ? "This Month"
                  : "This Year"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-0.5">
                Collected
              </p>
              <p className="text-lg font-bold text-green-700 dark:text-green-400">
                ₹{feeSummary[feePeriod].paid.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-green-600/70">
                {feeSummary[feePeriod].paidCount} records
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-0.5">
                Pending
              </p>
              <p className="text-lg font-bold text-red-700 dark:text-red-400">
                ₹{feeSummary[feePeriod].pending.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-red-600/70">
                {feeSummary[feePeriod].pendingCount} records
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mb-0.5">
                Partial
              </p>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                ₹{feeSummary[feePeriod].partial.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-orange-600/70">
                {feeSummary[feePeriod].partialCount} records
              </p>
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Collection Rate
              </p>
              <p className="text-lg font-bold text-foreground">
                {feeSummary[feePeriod].collectionRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                {feeSummary[feePeriod].count} total
              </p>
            </div>
          </div>
        </div>

        {/* Desktop: all 4 periods side by side */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => {
            const s = feeSummary[p];
            const labels = {
              daily: "Today",
              weekly: "This Week",
              monthly: "This Month",
              yearly: "This Year",
            };
            return (
              <div
                key={p}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                {/* Period header */}
                <div className="bg-primary/10 border-b border-border px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {labels[p]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.count} records
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  {/* Collected */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        Collected
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ₹{s.paid.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({s.paidCount})
                      </span>
                    </div>
                  </div>
                  {/* Pending */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        Pending
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        ₹{s.pending.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({s.pendingCount})
                      </span>
                    </div>
                  </div>
                  {/* Partial */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        Partial
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        ₹{s.partial.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({s.partialCount})
                      </span>
                    </div>
                  </div>
                  {/* Divider + Collection rate */}
                  <div className="border-t border-border pt-2 mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        Collection Rate
                      </span>
                      <span
                        className={`text-xs font-bold ${s.collectionRate >= 70 ? "text-green-600" : s.collectionRate >= 40 ? "text-orange-500" : "text-red-500"}`}
                      >
                        {s.collectionRate}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${s.collectionRate >= 70 ? "bg-green-500" : s.collectionRate >= 40 ? "bg-orange-400" : "bg-red-500"}`}
                        style={{ width: `${s.collectionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Class breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Class Summary</h3>
          <div className="space-y-2">
            {teachers.map((t) => {
              const cls = students.filter((s) => s.class === t.class); // small array, OK
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Class {t.class}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.name} · {t.subject}
                    </p>
                  </div>
                  <Badge variant="secondary">{cls.length} students</Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Recent Announcements
          </h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="border-l-4 pl-3 py-1"
                style={{ borderColor: "oklch(0.48 0.15 264)" }}
              >
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(n.date)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">
            Upcoming Events
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calEvents.map((e) => {
              const typeColors: Record<string, string> = {
                holiday: "badge-success",
                exam: "badge-destructive",
                event: "badge-info",
              };
              return (
                <div key={e.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[e.type]}`}
                    >
                      {e.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(e.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {e.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Manage Teachers
// ============================================================
function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(getTeachers());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    email: "",
    phone: "",
    class: "",
    id: "",
    password: "",
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Debounce search input 300ms to avoid re-filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.class.toLowerCase().includes(q),
    );
  }, [teachers, debouncedSearch]);

  const { paged: pagedTeachers, pagination } = usePagination(filtered, 15);

  const handleAdd = async () => {
    if (!form.name || !form.id || !form.password) {
      toast.error("Name, ID and Password are required");
      return;
    }
    if (teachers.find((t) => t.id === form.id)) {
      toast.error("Teacher ID already exists");
      return;
    }
    const newTeacher: Teacher = { ...form, role: "teacher", photo: form.photo };
    try {
      await saveTeacherToBackend(newTeacher);
      const updated = await syncTeachersFromBackend();
      setTeachers(updated);
    } catch {
      // Fallback: save locally only
      const updated = [...teachers, newTeacher];
      saveTeachers(updated);
      setTeachers(updated);
    }
    setPhotoPreview("");
    setForm({
      name: "",
      subject: "",
      email: "",
      phone: "",
      class: "",
      id: "",
      password: "",
      photo: "",
    });
    setOpen(false);
    toast.success("Teacher added successfully");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeacherFromBackend(id);
      const updated = await syncTeachersFromBackend();
      setTeachers(updated);
    } catch {
      const updated = teachers.filter((t) => t.id !== id);
      saveTeachers(updated);
      setTeachers(updated);
    }
    toast.success("Teacher removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Manage Teachers</h2>
          <p className="section-subtitle">
            {teachers.length} teachers registered
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {/* Photo upload */}
              <div className="space-y-1">
                <Label>Teacher Photo (optional)</Label>
                <div className="flex items-center gap-3">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    className="text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          setPhotoPreview(dataUrl);
                          setForm((f) => ({ ...f, photo: dataUrl }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              {(
                [
                  ["name", "Full Name"],
                  ["subject", "Subject"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["class", "Assigned Class"],
                  ["id", "Login ID"],
                  ["password", "Password"],
                ] as [keyof typeof form, string][]
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={label}
                    type={key === "password" ? "password" : "text"}
                  />
                </div>
              ))}
              <Button onClick={handleAdd} className="w-full mt-2">
                Add Teacher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, subject or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedTeachers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                  data-ocid="teachers.empty_state"
                >
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              pagedTeachers.map((t, idx) => (
                <TableRow key={t.id} data-ocid={`teachers.item.${idx + 1}`}>
                  <TableCell>
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-9 h-9 rounded-full object-cover border border-border"
                        style={{ maxWidth: "36px", maxHeight: "36px" }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.class}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.phone}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-destructive hover:text-destructive/80"
                      data-ocid={`teachers.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination pagination={pagination} />
      </div>
    </div>
  );
}

// ============================================================
// Manage Students
// ============================================================
function ManageStudents() {
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    class: "",
    rollNo: "",
    parentName: "",
    parentPhone: "",
    id: "",
    password: "",
    teacherId: "",
    photo: "",
  });

  // Year-End Promotion state
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoSource, setPromoSource] = useState("");
  const [promoTarget, setPromoTarget] = useState("");
  const [promoTeacher, setPromoTeacher] = useState("");

  const teachers = useMemo(() => getTeachers(), []);

  // O(1) teacher lookup map
  const teacherMap = useMemo(
    () => Object.fromEntries(teachers.map((t) => [t.id, t.name])),
    [teachers],
  );
  const getTeacherName = (id: string) => teacherMap[id] ?? id;

  const uniqueClasses = useMemo(
    () => Array.from(new Set(students.map((s) => s.class))).sort(),
    [students],
  );
  const promoCount = useMemo(
    () =>
      promoSource ? students.filter((s) => s.class === promoSource).length : 0,
    [students, promoSource],
  );

  // Debounce search input 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.rollNo.includes(debouncedSearch),
    );
  }, [students, debouncedSearch]);

  const { paged: pagedStudents, pagination: studentPagination } = usePagination(
    filtered,
    15,
  );

  const resetForm = () => {
    setForm({
      name: "",
      class: "",
      rollNo: "",
      parentName: "",
      parentPhone: "",
      id: "",
      password: "",
      teacherId: "",
      photo: "",
    });
    setPhotoPreview("");
  };

  const handleAdd = async () => {
    if (!form.name || !form.id || !form.password) {
      toast.error("Name, Login ID and Password are required");
      return;
    }
    if (students.find((s) => s.id === form.id)) {
      toast.error("Student ID already exists");
      return;
    }
    const newStudent: Student = {
      id: form.id,
      password: form.password,
      name: form.name,
      class: form.class,
      rollNo: form.rollNo,
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      teacherId: form.teacherId,
      role: "student",
      photo: form.photo || undefined,
    };
    try {
      await saveStudentToBackend(newStudent);
      const updated = await syncStudentsFromBackend();
      setStudents(updated);
    } catch {
      const updated = [...students, newStudent];
      saveStudents(updated);
      setStudents(updated);
    }
    resetForm();
    setOpen(false);
    toast.success("Student added successfully");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudentFromBackend(id);
      const updated = await syncStudentsFromBackend();
      setStudents(updated);
    } catch {
      const updated = students.filter((s) => s.id !== id);
      saveStudents(updated);
      setStudents(updated);
    }
    toast.success("Student removed");
  };

  const handlePromote = async () => {
    if (!promoSource || !promoTarget) {
      toast.error("Please select source class and enter target class");
      return;
    }
    if (promoSource === promoTarget) {
      toast.error("Source and target class cannot be the same");
      return;
    }
    if (promoCount === 0) {
      toast.error("No students found in the selected source class");
      return;
    }
    const updated = students.map((s) => {
      if (s.class === promoSource) {
        return {
          ...s,
          class: promoTarget,
          teacherId: promoTeacher || s.teacherId,
        };
      }
      return s;
    });
    // Save promoted students to backend
    const promoted = updated.filter(
      (s) =>
        s.class === promoTarget &&
        students.find((os) => os.id === s.id && os.class === promoSource),
    );
    try {
      await Promise.all(promoted.map((s) => saveStudentToBackend(s)));
      const synced = await syncStudentsFromBackend();
      setStudents(synced);
    } catch {
      saveStudents(updated);
      setStudents(updated);
    }
    toast.success(
      `${promoCount} student${promoCount > 1 ? "s" : ""} promoted from Class ${promoSource} to Class ${promoTarget}`,
    );
    setPromoSource("");
    setPromoTarget("");
    setPromoTeacher("");
    setPromoOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Manage Students</h2>
          <p className="section-subtitle">
            {students.length} students across all classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year-End Promotion button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPromoOpen(!promoOpen)}
          >
            <GraduationCap className="w-4 h-4" />
            Year-End Promotion
          </Button>
          {/* Add Student dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {/* Photo upload */}
                <div className="space-y-1">
                  <Label>Student Photo (optional)</Label>
                  <div className="flex items-center gap-3">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            setPhotoPreview(dataUrl);
                            setForm((f) => ({ ...f, photo: dataUrl }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                {(
                  [
                    ["name", "Full Name"],
                    ["class", "Class"],
                    ["rollNo", "Roll Number"],
                    ["parentName", "Parent Name"],
                    ["parentPhone", "Parent Phone"],
                    ["id", "Login ID"],
                    ["password", "Password"],
                  ] as [keyof typeof form, string][]
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label>{label}</Label>
                    <Input
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      placeholder={label}
                      type={key === "password" ? "password" : "text"}
                    />
                  </div>
                ))}
                {/* Class Teacher assignment */}
                <div className="space-y-1">
                  <Label>Class Teacher (optional)</Label>
                  <Select
                    value={form.teacherId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, teacherId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — Class {t.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full mt-2">
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Year-End Promotion Panel */}
      {promoOpen && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Year-End Class Promotion
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Move all students from one class to a new class for the next
            academic year.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Source Class (current year)</Label>
              <Select value={promoSource} onValueChange={setPromoSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Target Class (next year)</Label>
              <Input
                placeholder="e.g. 7A, 11B, XI"
                value={promoTarget}
                onChange={(e) => setPromoTarget(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Reassign Class Teacher (optional)</Label>
              <Select value={promoTeacher} onValueChange={setPromoTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Keep existing teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__keep__">
                    Keep existing teachers
                  </SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — Class {t.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {promoSource && promoTarget && (
            <div className="mt-4 p-3 rounded-md bg-muted text-sm text-foreground">
              <strong>
                {promoCount} student{promoCount !== 1 ? "s" : ""}
              </strong>{" "}
              in Class <strong>{promoSource}</strong> will be moved to Class{" "}
              <strong>{promoTarget}</strong>
              {promoTeacher && promoTeacher !== "__keep__"
                ? ` and reassigned to ${getTeacherName(promoTeacher)}`
                : ""}
              .
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button onClick={handlePromote} className="gap-1.5">
              <GraduationCap className="w-4 h-4" />
              Promote Students
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPromoOpen(false);
                setPromoSource("");
                setPromoTarget("");
                setPromoTeacher("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by name, class or roll no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Parent Phone</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-8"
                  data-ocid="students.empty_state"
                >
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              pagedStudents.map((s, idx) => (
                <TableRow key={s.id} data-ocid={`students.item.${idx + 1}`}>
                  <TableCell>
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={s.name}
                        className="w-9 h-9 rounded-full object-cover border border-border"
                        style={{ maxWidth: "36px", maxHeight: "36px" }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.class}</Badge>
                  </TableCell>
                  <TableCell>{s.rollNo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.parentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.parentPhone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTeacherName(s.teacherId)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="text-destructive hover:text-destructive/80"
                      data-ocid={`students.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination pagination={studentPagination} />
      </div>
    </div>
  );
}

// ============================================================
// Post Notifications
// ============================================================
function PostNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(
    getNotifications(),
  );
  const [form, setForm] = useState({ title: "", message: "" });
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment(ev.target?.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }
    const newN: Notification = {
      id: generateId("notif"),
      title: form.title,
      message: form.message,
      date: new Date().toISOString().split("T")[0],
      postedBy: "principal001",
      type: "general",
      ...(attachment && attachmentName ? { attachment, attachmentName } : {}),
    };
    try {
      await saveNotificationToBackend(newN);
    } catch (err) {
      console.error("saveNotificationToBackend failed:", err);
      saveNotifications([newN, ...notifications]);
    }
    setNotifications((prev) => [newN, ...prev]);
    setForm({ title: "", message: "" });
    clearAttachment();
    toast.success("Notification posted");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationFromBackend(id);
    } catch (err) {
      console.error("deleteNotificationFromBackend failed:", err);
      saveNotifications(notifications.filter((n) => n.id !== id));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const isImageAttachment = (name: string) =>
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name);

  return (
    <div>
      <h2 className="section-title">Post Notifications</h2>
      <p className="section-subtitle">
        Create school-wide announcements with optional PDF or image attachments
      </p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-2xl">
        <h3 className="font-semibold text-foreground mb-4">New Announcement</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              placeholder="Announcement title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Message</Label>
            <Textarea
              placeholder="Write the announcement message..."
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
            />
          </div>

          {/* Attachment upload */}
          <div className="space-y-2">
            <Label>Attachment (optional)</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                id="notif-attachment"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                data-ocid="notifications.upload_button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
                {attachmentName ? "Change File" : "Attach PDF / Image"}
              </Button>
              {attachmentName && (
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Preview */}
            {attachment && attachmentName && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                {isImageAttachment(attachmentName) ? (
                  <>
                    <img
                      src={attachment}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-md border border-border flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attachmentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Image attachment
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-red-100 rounded-md border border-border flex items-center justify-center flex-shrink-0">
                      <FileDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attachmentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF attachment
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handlePost}
            className="gap-1.5"
            data-ocid="notifications.submit_button"
          >
            <Bell className="w-4 h-4" /> Post Announcement
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Attachment</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="font-medium">{n.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(n.date)}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {n.message}
                </TableCell>
                <TableCell>
                  {n.attachment && n.attachmentName ? (
                    isImageAttachment(n.attachmentName) ? (
                      <a
                        href={n.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        title={n.attachmentName}
                      >
                        <img
                          src={n.attachment}
                          alt={n.attachmentName}
                          className="w-8 h-8 object-cover rounded border border-border"
                        />
                        <span className="text-xs max-w-[100px] truncate hidden sm:inline">
                          {n.attachmentName}
                        </span>
                      </a>
                    ) : (
                      <a
                        href={n.attachment}
                        download={n.attachmentName}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
                        title={`Download ${n.attachmentName}`}
                      >
                        <FileDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="max-w-[100px] truncate hidden sm:inline">
                          {n.attachmentName}
                        </span>
                      </a>
                    )
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================
// Academic Calendar
// ============================================================
function AcademicCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(getCalendarEvents());
  const [form, setForm] = useState({
    title: "",
    type: "event" as CalendarEvent["type"],
    date: "",
    description: "",
  });

  const handleAdd = async () => {
    if (!form.title || !form.date) {
      toast.error("Title and date are required");
      return;
    }
    const newE: CalendarEvent = {
      id: generateId("cal"),
      ...form,
      createdBy: "principal001",
    };
    const sorted = [...events, newE].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    try {
      await saveCalendarEventToBackend(newE);
    } catch (err) {
      console.error("saveCalendarEventToBackend failed:", err);
      saveCalendarEvents(sorted);
    }
    setEvents(sorted);
    setForm({ title: "", type: "event", date: "", description: "" });
    toast.success("Event added to calendar");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCalendarEventFromBackend(id);
    } catch (err) {
      console.error("deleteCalendarEventFromBackend failed:", err);
      saveCalendarEvents(events.filter((e) => e.id !== id));
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success("Event removed");
  };

  const typeColors: Record<string, string> = {
    holiday: "badge-success",
    exam: "badge-destructive",
    event: "badge-info",
  };

  return (
    <div>
      <h2 className="section-title">Academic Calendar</h2>
      <p className="section-subtitle">Manage holidays, exams, and events</p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-2xl">
        <h3 className="font-semibold text-foreground mb-4">Add Event</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Event title"
            />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, type: v as CalendarEvent["type"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief description..."
            />
          </div>
        </div>
        <Button className="mt-3 gap-1.5" onClick={handleAdd}>
          <Calendar className="w-4 h-4" /> Add to Calendar
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatDate(e.date)}
                </TableCell>
                <TableCell className="font-medium">{e.title}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[e.type]}`}
                  >
                    {e.type}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {e.description}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================
// Publish Results
// ============================================================
function PublishResults() {
  const [results, setResults] = useState<ExamResult[]>(() => getResults());
  const students = useMemo(() => getStudents(), []);

  const [filterExam, setFilterExam] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  const pending = useMemo(
    () => results.filter((r) => r.status === "pending"),
    [results],
  );
  const published = useMemo(
    () => results.filter((r) => r.status === "approved"),
    [results],
  );

  // Unique exam names and classes from published results
  const examNames = useMemo(
    () => Array.from(new Set(published.map((r) => r.examName))).sort(),
    [published],
  );
  const classNames = useMemo(
    () => Array.from(new Set(published.map((r) => r.class))).sort(),
    [published],
  );

  // O(1) student name lookup map
  const studentMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s.name])),
    [students],
  );
  const getStudentName = (id: string) => studentMap[id] ?? id;

  // Filtered published results (memoized)
  const filteredPublished = useMemo(() => {
    return published.filter((r) => {
      if (filterExam !== "all" && r.examName !== filterExam) return false;
      if (filterClass !== "all" && r.class !== filterClass) return false;
      return true;
    });
  }, [published, filterExam, filterClass]);

  const { paged: pagedPublished, pagination: publishedPagination } =
    usePagination(filteredPublished, 15);

  const handleApprove = async (id: string) => {
    const approvedRecord = results.find((r) => r.id === id);
    const updated = results.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "approved" as const,
            approvedAt: new Date().toISOString().split("T")[0],
          }
        : r,
    );
    const updatedRecord = updated.find((r) => r.id === id);
    if (updatedRecord) {
      try {
        await saveResultToBackend(updatedRecord);
      } catch (err) {
        console.error("saveResultToBackend failed:", err);
        if (approvedRecord) saveResults(updated);
      }
    }
    setResults(updated);
    toast.success("Result approved and published");
  };

  const handleReject = async (id: string) => {
    const updated = results.map((r) =>
      r.id === id ? { ...r, status: "rejected" as const } : r,
    );
    const updatedRecord = updated.find((r) => r.id === id);
    if (updatedRecord) {
      try {
        await saveResultToBackend(updatedRecord);
      } catch (err) {
        console.error("saveResultToBackend (reject) failed:", err);
        saveResults(updated);
      }
    }
    setResults(updated);
    toast.success("Result rejected");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResultFromBackend(id);
    } catch (err) {
      console.error("deleteResultFromBackend failed:", err);
      saveResults(results.filter((r) => r.id !== id));
    }
    setResults((prev) => prev.filter((r) => r.id !== id));
    toast.success("Result deleted");
  };

  const calcTotal = (r: ExamResult) =>
    r.subjects.reduce((a, s) => a + s.marks, 0);
  const calcMax = (r: ExamResult) =>
    r.subjects.reduce((a, s) => a + s.maxMarks, 0);

  const getGrade = (marks: number, maxMarks: number): string => {
    if (maxMarks === 0) return "—";
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  };

  const handleDownloadRanked = () => {
    // Filter published results
    const filtered = published.filter((r) => {
      if (filterExam !== "all" && r.examName !== filterExam) return false;
      if (filterClass !== "all" && r.class !== filterClass) return false;
      return true;
    });

    if (filtered.length === 0) {
      toast.error("No results match the selected filters");
      return;
    }

    // Sort by total marks descending
    const sorted = [...filtered].sort((a, b) => calcTotal(b) - calcTotal(a));

    // Assign ranks (ties share same rank)
    let currentRank = 1;
    const ranked = sorted.map((r, idx) => {
      if (idx > 0 && calcTotal(r) < calcTotal(sorted[idx - 1])) {
        currentRank = idx + 1;
      }
      return { rank: currentRank, result: r };
    });

    // Collect all unique subjects across filtered results
    const allSubjects = Array.from(
      new Set(filtered.flatMap((r) => r.subjects.map((s) => s.subject))),
    ).sort();

    const principalProfile = getPrincipalProfile();
    const schoolName =
      principalProfile.name || "Rahmaniyya Public School, Akampadam";
    const examLabel = filterExam === "all" ? "All Exams" : filterExam;
    const classLabel =
      filterClass === "all" ? "All Classes" : `Class ${filterClass}`;
    const printDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Build subject header cells
    const subjectHeaders = allSubjects
      .map(
        (s) =>
          `<th style="background:#1e40af;color:white;padding:8px 10px;border:1px solid #c7d2fe;font-size:11px;white-space:nowrap;">${s}</th>`,
      )
      .join("");

    // Build rows
    const rows = ranked
      .map(({ rank, result }) => {
        const total = calcTotal(result);
        const max = calcMax(result);
        const pct = max > 0 ? Math.round((total / max) * 100) : 0;
        const rankBg =
          rank === 1
            ? "#fef9c3"
            : rank === 2
              ? "#f1f5f9"
              : rank === 3
                ? "#fff7ed"
                : "white";

        const subjectCells = allSubjects
          .map((subj) => {
            const entry = result.subjects.find((s) => s.subject === subj);
            if (!entry) {
              return `<td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:12px;text-align:center;color:#94a3b8;">—</td>`;
            }
            const grade = getGrade(entry.marks, entry.maxMarks);
            return `<td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:12px;text-align:center;">${entry.marks}/${entry.maxMarks} <span style="font-size:10px;font-weight:600;color:#1e40af;">(${grade})</span></td>`;
          })
          .join("");

        return `
          <tr style="background:${rankBg};">
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:13px;font-weight:700;text-align:center;color:${rank <= 3 ? "#1e40af" : "#374151"};">
              ${rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
            </td>
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:13px;font-weight:600;">${getStudentName(result.studentId)}</td>
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:12px;text-align:center;">${result.class}</td>
            ${subjectCells}
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:13px;font-weight:700;text-align:center;">${total}</td>
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:12px;text-align:center;">${max}</td>
            <td style="padding:7px 10px;border:1px solid #e2e8f0;font-size:13px;font-weight:700;text-align:center;color:${pct >= 60 ? "#15803d" : "#b91c1c"};">${pct}%</td>
          </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Ranked Results – ${examLabel} – ${classLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #111; padding: 24px; }
    .header { background: #1e40af; color: white; border-radius: 10px 10px 0 0; padding: 20px 28px; display: flex; align-items: center; gap: 16px; }
    .header h1 { font-size: 20px; font-weight: 800; letter-spacing: 0.02em; }
    .header p { font-size: 13px; opacity: 0.85; margin-top: 2px; }
    .meta { background: #eff6ff; border: 1px solid #bfdbfe; border-top: none; padding: 12px 28px; display: flex; gap: 24px; flex-wrap: wrap; }
    .meta span { font-size: 12px; color: #1e40af; font-weight: 600; }
    .meta span b { color: #111; font-weight: 700; }
    .table-wrap { overflow-x: auto; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none; }
    table { width: 100%; border-collapse: collapse; background: white; }
    thead tr { background: #1e3a8a; }
    thead th { color: white; padding: 10px 10px; border: 1px solid #3b5bdb; font-size: 12px; font-weight: 700; text-align: center; white-space: nowrap; }
    thead th:nth-child(2) { text-align: left; }
    tbody tr:hover { background: #eff6ff !important; }
    tfoot td { background: #f1f5f9; font-weight: 700; font-size: 12px; padding: 8px 10px; border: 1px solid #e2e8f0; }
    .print-btn { display: inline-flex; align-items: center; gap: 8px; background: #1e40af; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px; }
    .print-btn:hover { background: #1e3a8a; }
    @media print {
      body { padding: 0; background: white; }
      .print-btn { display: none; }
      .header { border-radius: 0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div>
    <div class="header">
      <div>
        <h1>${schoolName}</h1>
        <p>Ranked Examination Results</p>
      </div>
    </div>
    <div class="meta">
      <span>📋 Exam: <b>${examLabel}</b></span>
      <span>🏫 Class: <b>${classLabel}</b></span>
      <span>👥 Students: <b>${ranked.length}</b></span>
      <span>📅 Generated: <b>${printDate}</b></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:54px;">Rank</th>
            <th style="text-align:left;min-width:140px;">Student Name</th>
            <th style="width:70px;">Class</th>
            ${subjectHeaders}
            <th style="width:80px;">Awarded</th>
            <th style="width:70px;">Total Max</th>
            <th style="width:70px;">%</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      toast.error("Popup blocked. Please allow popups and try again.");
    }
  };

  return (
    <div>
      <h2 className="section-title">Publish Results</h2>
      <p className="section-subtitle">
        Approve or reject exam results submitted by teachers
      </p>

      {/* Pending */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-foreground">Pending Approval</h3>
          {pending.length > 0 && (
            <Badge className="bg-warning/20 text-warning-foreground border-warning/30">
              {pending.length}
            </Badge>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            No results pending approval
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {getStudentName(r.studentId)}
                    </TableCell>
                    <TableCell>{r.examName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.class}</Badge>
                    </TableCell>
                    <TableCell>
                      {calcTotal(r)}/{calcMax(r)} (
                      {Math.round((calcTotal(r) / calcMax(r)) * 100)}%)
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(r.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-1 h-7 px-2 text-xs"
                          onClick={() => handleApprove(r.id)}
                        >
                          <Check className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1 h-7 px-2 text-xs"
                          onClick={() => handleReject(r.id)}
                        >
                          <X className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Published */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="font-semibold text-foreground">Published Results</h3>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Exam filter */}
            <Select value={filterExam} onValueChange={setFilterExam}>
              <SelectTrigger className="h-8 text-xs w-40">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {examNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Class filter */}
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classNames.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Download button */}
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleDownloadRanked}
            >
              <Download className="w-3.5 h-3.5" /> Download Ranked Results
            </Button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPublished.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-6"
                    data-ocid="results.empty_state"
                  >
                    No published results
                  </TableCell>
                </TableRow>
              ) : (
                pagedPublished.map((r, idx) => (
                  <TableRow key={r.id} data-ocid={`results.item.${idx + 1}`}>
                    <TableCell className="font-medium">
                      {getStudentName(r.studentId)}
                    </TableCell>
                    <TableCell>{r.examName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.class}</Badge>
                    </TableCell>
                    <TableCell>
                      {calcTotal(r)}/{calcMax(r)}
                    </TableCell>
                    <TableCell>
                      <Badge className="badge-success">
                        {Math.round((calcTotal(r) / calcMax(r)) * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(r.approvedAt ?? "")}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="text-destructive hover:text-destructive/80"
                        data-ocid={`results.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination pagination={publishedPagination} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Leave Approvals
// ============================================================
function LeaveApprovals() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>(getLeaves());

  const teacherLeaves = leaves.filter((l) => l.applicantRole === "teacher");

  const handleApprove = async (id: string) => {
    const updated = leaves.map((l) =>
      l.id === id
        ? {
            ...l,
            status: "approved" as const,
            reviewedBy: "principal001",
            reviewedAt: new Date().toISOString().split("T")[0],
          }
        : l,
    );
    const updatedRecord = updated.find((l) => l.id === id);
    if (updatedRecord) {
      try {
        await saveLeaveToBackend(updatedRecord);
      } catch (err) {
        console.error("saveLeaveToBackend (approve) failed:", err);
        saveLeaves(updated);
      }
    }
    setLeaves(updated);
    toast.success("Leave approved");
  };

  const handleReject = async (id: string) => {
    const updated = leaves.map((l) =>
      l.id === id
        ? {
            ...l,
            status: "rejected" as const,
            reviewedBy: "principal001",
            reviewedAt: new Date().toISOString().split("T")[0],
          }
        : l,
    );
    const updatedRecord = updated.find((l) => l.id === id);
    if (updatedRecord) {
      try {
        await saveLeaveToBackend(updatedRecord);
      } catch (err) {
        console.error("saveLeaveToBackend (reject) failed:", err);
        saveLeaves(updated);
      }
    }
    setLeaves(updated);
    toast.success("Leave rejected");
  };

  const statusBadge = (status: string) => {
    if (status === "approved")
      return (
        <span className="badge-success inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
          Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="badge-destructive inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
          Rejected
        </span>
      );
    return (
      <span className="badge-warning inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
        Pending
      </span>
    );
  };

  return (
    <div>
      <h2 className="section-title">Leave Approvals</h2>
      <p className="section-subtitle">Review teacher leave applications</p>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacherLeaves.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No leave applications
                </TableCell>
              </TableRow>
            ) : (
              teacherLeaves.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    {l.applicantName}
                  </TableCell>
                  <TableCell className="capitalize">{l.type}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(l.fromDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(l.toDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {l.reason}
                  </TableCell>
                  <TableCell>{statusBadge(l.status)}</TableCell>
                  <TableCell>
                    {l.status === "pending" && (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => handleApprove(l.id)}
                        >
                          <Check className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => handleReject(l.id)}
                        >
                          <X className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}
                    {l.status !== "pending" && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(l.reviewedAt ?? "")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================
// My Profile
// ============================================================
interface ProfileProps {
  user: CurrentUser;
  onNameChange: (name: string) => void;
}

function MyProfile({ user, onNameChange }: ProfileProps) {
  const loadProfile = () => getPrincipalProfile();
  const [profile, setProfileState] = useState(loadProfile);
  const [form, setForm] = useState({
    name: profile.name,
    username: profile.id,
    email: profile.email ?? "",
    phone: profile.phone ?? "",
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [principalPhoto, setPrincipalPhoto] = useState<string>(
    profile.photo ?? "",
  );
  const [institutionLogo, setInstitutionLogo] = useState<string>(
    profile.institutionLogo ?? "",
  );

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    saveKey: "photo" | "institutionLogo",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setter(dataUrl);
      const updated = { ...getPrincipalProfile(), [saveKey]: dataUrl };
      savePrincipalProfile(updated);
      setProfileState(updated);
      toast.success(
        saveKey === "photo"
          ? "Principal photo updated"
          : "Institution logo updated",
      );
      try {
        await savePrincipalToBackend(updated);
      } catch {
        // Ignore — already saved locally
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!form.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    const updated = {
      ...profile,
      name: form.name.trim(),
      id: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };
    savePrincipalProfile(updated);
    setProfileState(updated);
    setCurrentUser({ ...user, id: updated.id, name: updated.name });
    onNameChange(updated.name);
    toast.success("Profile updated successfully");
    try {
      await savePrincipalToBackend(updated);
    } catch {
      // Ignore — already saved locally
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (pwForm.currentPassword !== profile.password) {
      toast.error("Current password is incorrect");
      return;
    }
    if (!pwForm.newPassword || pwForm.newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    const updated = { ...getPrincipalProfile(), password: pwForm.newPassword };
    savePrincipalProfile(updated);
    setProfileState(updated);
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success("Password changed successfully");
    try {
      await savePrincipalToBackend(updated);
    } catch {
      // Ignore — already saved locally
    }
  };

  return (
    <div>
      <h2 className="section-title">My Profile</h2>
      <p className="section-subtitle">
        Update your photo, institution logo, contact details, and password
      </p>

      {/* Photo upload row */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mb-6">
        {/* Principal Photo */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Principal Photo
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              {principalPhoto ? (
                <img
                  src={principalPhoto}
                  alt="Principal"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white border-2 border-border"
                  style={{ backgroundColor: "oklch(0.55 0.15 210)" }}
                >
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center">
              <Label
                htmlFor="principal-photo-upload"
                className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <User className="w-4 h-4" />
                {principalPhoto ? "Change Photo" : "Upload Photo"}
              </Label>
              <input
                id="principal-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleImageUpload(e, setPrincipalPhoto, "photo")
                }
              />
              {principalPhoto && (
                <button
                  type="button"
                  className="block mx-auto mt-1 text-xs text-destructive hover:underline"
                  onClick={() => {
                    setPrincipalPhoto("");
                    const updated = {
                      ...getPrincipalProfile(),
                      photo: "",
                    };
                    savePrincipalProfile(updated);
                    setProfileState(updated);
                    toast.success("Photo removed");
                    savePrincipalToBackend(updated).catch(() => {});
                  }}
                >
                  Remove photo
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or WebP · Max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Institution Logo */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Institution Logo
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <img
                src={
                  institutionLogo ||
                  "/assets/generated/rahmaniyya-logo-transparent.dim_300x300.png"
                }
                alt="Institution Logo"
                className="w-24 h-24 rounded-lg object-contain border-2 border-border bg-muted/30"
              />
            </div>
            <div className="text-center">
              <Label
                htmlFor="institution-logo-upload"
                className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="w-4 h-4" />
                {institutionLogo ? "Change Logo" : "Upload Logo"}
              </Label>
              <input
                id="institution-logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleImageUpload(e, setInstitutionLogo, "institutionLogo")
                }
              />
              {institutionLogo && (
                <button
                  type="button"
                  className="block mx-auto mt-1 text-xs text-destructive hover:underline"
                  onClick={() => {
                    setInstitutionLogo("");
                    const updated = {
                      ...getPrincipalProfile(),
                      institutionLogo: "",
                    };
                    savePrincipalProfile(updated);
                    setProfileState(updated);
                    toast.success("Logo reset to default");
                    savePrincipalToBackend(updated).catch(() => {});
                  }}
                >
                  Reset to default
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Replaces logo on login page
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-3xl">
        {/* Profile info */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Profile Information
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="space-y-1">
              <Label>Username (Login ID)</Label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                placeholder="Login username"
              />
              <p className="text-xs text-muted-foreground">
                Used to log in to the principal portal
              </p>
            </div>
            <Button onClick={handleSaveProfile} className="w-full gap-1.5">
              <Check className="w-4 h-4" /> Save Profile
            </Button>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Change Password
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, currentPassword: e.target.value }))
                }
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, newPassword: e.target.value }))
                }
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-1">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                placeholder="Repeat new password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              variant="outline"
              className="w-full gap-1.5"
            >
              <Check className="w-4 h-4" /> Change Password
            </Button>
          </div>

          {/* Current info summary */}
          <div className="mt-5 pt-4 border-t border-border space-y-1">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Current login info
            </p>
            <p className="text-sm text-foreground">
              Username: <span className="font-mono">{profile.id}</span>
            </p>
            {profile.email && (
              <p className="text-sm text-foreground">Email: {profile.email}</p>
            )}
            {profile.phone && (
              <p className="text-sm text-foreground">Phone: {profile.phone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Teacher Attendance Approvals
// ============================================================
function TeacherAttendanceApprovals() {
  const teachers = getTeachers();
  const [records, setRecords] = useState<TeacherAttendance[]>(
    getTeacherAttendance(),
  );
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const teacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name ?? id;

  const handleApprove = async (recordId: string) => {
    const updated = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            approvalStatus: "approved" as const,
            approvedBy: "principal",
            approvalNote: noteMap[recordId] || "",
          }
        : r,
    );
    const updatedRecord = updated.find((r) => r.id === recordId);
    if (updatedRecord) {
      try {
        await updateTeacherAttendanceInBackend(updatedRecord);
      } catch (err) {
        console.error(
          "updateTeacherAttendanceInBackend (approve) failed:",
          err,
        );
        saveTeacherAttendance(updated);
      }
    }
    setRecords(updated);
    toast.success("Attendance approved");
  };

  const handleReject = async (recordId: string) => {
    const updated = records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            approvalStatus: "rejected" as const,
            approvedBy: "principal",
            approvalNote: noteMap[recordId] || "",
          }
        : r,
    );
    const updatedRecord = updated.find((r) => r.id === recordId);
    if (updatedRecord) {
      try {
        await updateTeacherAttendanceInBackend(updatedRecord);
      } catch (err) {
        console.error("updateTeacherAttendanceInBackend (reject) failed:", err);
        saveTeacherAttendance(updated);
      }
    }
    setRecords(updated);
    toast.success("Attendance rejected");
  };

  const pending = records.filter((r) => r.approvalStatus === "pending");
  const reviewed = records.filter((r) => r.approvalStatus !== "pending");

  const approvalBadge = (status: TeacherAttendance["approvalStatus"]) => {
    if (status === "approved")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-success">
          Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-destructive">
          Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-warning">
        Pending
      </span>
    );
  };

  return (
    <div>
      <h2 className="section-title">Teacher Attendance Approvals</h2>
      <p className="section-subtitle">
        Review and approve teacher self-marked attendance
      </p>

      {/* Pending */}
      <h3 className="font-semibold text-foreground mb-3">
        Pending Approval ({pending.length})
      </h3>
      {pending.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground mb-6">
          No pending attendance records
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {teacherName(r.teacherId)}
                    </TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.status === "present" ? "badge-success" : r.status === "absent" ? "badge-destructive" : "badge-warning"}`}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell>{r.checkInTime || "—"}</TableCell>
                    <TableCell>{r.checkOutTime || "—"}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Optional note"
                        className="h-7 text-xs w-32"
                        value={noteMap[r.id] || ""}
                        onChange={(e) =>
                          setNoteMap({ ...noteMap, [r.id]: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(r.id)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleReject(r.id)}
                        >
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reviewed */}
      <h3 className="font-semibold text-foreground mb-3">
        Reviewed Records ({reviewed.length})
      </h3>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewed
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {teacherName(r.teacherId)}
                  </TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.status === "present" ? "badge-success" : r.status === "absent" ? "badge-destructive" : "badge-warning"}`}
                    >
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell>{r.checkInTime || "—"}</TableCell>
                  <TableCell>{r.checkOutTime || "—"}</TableCell>
                  <TableCell>{approvalBadge(r.approvalStatus)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.approvalNote || "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================
// Student Suggestions & Queries
// ============================================================
function StudentSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestionQuery[]>(
    getSuggestions(),
  );
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const handleReply = async (id: string) => {
    const text = replyTexts[id]?.trim();
    if (!text) {
      toast.error("Please write a reply before submitting");
      return;
    }
    const updated = suggestions.map((s) =>
      s.id === id
        ? {
            ...s,
            response: text,
            respondedAt: new Date().toISOString().split("T")[0],
          }
        : s,
    );
    const updatedRecord = updated.find((s) => s.id === id);
    if (updatedRecord) {
      try {
        await saveSuggestionToBackend(updatedRecord);
      } catch (err) {
        console.error("saveSuggestionToBackend (reply) failed:", err);
        saveSuggestions(updated);
      }
    }
    setSuggestions(updated);
    setReplyTexts((prev) => ({ ...prev, [id]: "" }));
    toast.success("Reply sent to student");
  };

  const unanswered = suggestions.filter((s) => !s.response);
  const answered = suggestions.filter((s) => s.response);

  return (
    <div>
      <h2 className="section-title">Student Suggestions &amp; Queries</h2>
      <p className="section-subtitle">
        View and reply to suggestions and queries submitted by students
      </p>

      {/* Pending */}
      <h3 className="font-semibold text-foreground mb-3 mt-2">
        Pending ({unanswered.length})
      </h3>
      {unanswered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground mb-6">
          No pending suggestions or queries
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {unanswered
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
            .map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">
                    {s.studentName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(s.submittedAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-3">{s.message}</p>
                <Textarea
                  rows={3}
                  placeholder="Write your reply..."
                  value={replyTexts[s.id] ?? ""}
                  onChange={(e) =>
                    setReplyTexts((prev) => ({
                      ...prev,
                      [s.id]: e.target.value,
                    }))
                  }
                  className="mb-2"
                />
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleReply(s.id)}
                >
                  <MessageSquare className="w-4 h-4" /> Send Reply
                </Button>
              </div>
            ))}
        </div>
      )}

      {/* Answered */}
      <h3 className="font-semibold text-foreground mb-3">
        Replied ({answered.length})
      </h3>
      {answered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          No replied suggestions yet
        </div>
      ) : (
        <div className="space-y-3">
          {answered
            .sort((a, b) =>
              (b.respondedAt ?? "").localeCompare(a.respondedAt ?? ""),
            )
            .map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground text-sm">
                    {s.studentName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(s.submittedAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-2">{s.message}</p>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    Your Reply:
                  </p>
                  <p className="text-sm text-foreground">{s.response}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(s.respondedAt ?? "")}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Hall Tickets
// ============================================================
function PrincipalHallTickets() {
  const [design, setDesign] = useState<HallTicketDesign>(() => {
    const d = getHallTicketDesign();
    return { ...d, subjects: d.subjects ?? [] };
  });

  const allStudents = getStudents();
  const classes = Array.from(new Set(allStudents.map((s) => s.class))).sort();
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] ?? "");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const studentsInClass = allStudents.filter((s) => s.class === selectedClass);

  // Auto-select first student when class changes
  const firstStudentId = studentsInClass[0]?.id;
  useEffect(() => {
    if (studentsInClass.length > 0 && firstStudentId) {
      setSelectedStudentId(firstStudentId);
    } else {
      setSelectedStudentId("");
    }
  }, [studentsInClass.length, firstStudentId]);

  const selectedStudent =
    studentsInClass.find((s) => s.id === selectedStudentId) ??
    studentsInClass[0];

  const printStyleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Remove stale instance if present (prevents duplicate on fast re-mount)
    document.getElementById("hall-ticket-print-style")?.remove();
    const style = document.createElement("style");
    style.id = "hall-ticket-print-style";
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #hall-ticket-print-wrapper,
        #hall-ticket-print-wrapper * { visibility: visible !important; }
        #hall-ticket-print-wrapper {
          position: fixed !important;
          top: 0; left: 0;
          width: 100vw;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px;
          background: white;
        }
        @page { margin: 1cm; size: A4; }
      }
    `;
    document.head.appendChild(style);
    printStyleRef.current = style;
    return () => {
      try {
        if (printStyleRef.current?.parentNode) {
          printStyleRef.current.parentNode.removeChild(printStyleRef.current);
        }
      } catch (_) {
        // ignore cleanup errors
      }
      printStyleRef.current = null;
    };
  }, []);

  const handleSaveDesign = async () => {
    try {
      await saveHallTicketDesignToBackend(design);
    } catch (err) {
      console.error("saveHallTicketDesignToBackend failed:", err);
      saveHallTicketDesign(design);
    }
    toast.success("Hall ticket design saved");
  };

  const handleAddSubject = () => {
    const newSubject: HallTicketSubject = {
      id: generateId("subj"),
      name: "",
      date: "",
      time: "",
    };
    setDesign((d) => ({ ...d, subjects: [...d.subjects, newSubject] }));
  };

  const handleDeleteSubject = (id: string) => {
    setDesign((d) => ({
      ...d,
      subjects: d.subjects.filter((s) => s.id !== id),
    }));
  };

  const handleSubjectChange = (
    id: string,
    field: keyof HallTicketSubject,
    value: string,
  ) => {
    setDesign((d) => ({
      ...d,
      subjects: d.subjects.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const principalProfile = getPrincipalProfile();
  const logoSrc =
    principalProfile.institutionLogo ||
    "/assets/generated/rahmaniyya-logo-transparent.dim_300x300.png";

  const borderStyleMap: Record<HallTicketDesign["borderStyle"], string> = {
    solid: "3px solid",
    double: "6px double",
    dotted: "3px dotted",
  };
  const ticketBorder = `${borderStyleMap[design.borderStyle] ?? "3px solid"} ${design.headerBg}`;

  return (
    <div>
      <div className="mb-6">
        <h2 className="section-title">Hall Tickets</h2>
        <p className="section-subtitle">
          Design the hall ticket template and preview per student
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Left Panel: Design Editor ── */}
        <div className="xl:w-[400px] shrink-0 space-y-4">
          {/* Institution & Header */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Institution &amp; Header
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Institution Name</Label>
                <Input
                  value={design.institutionName}
                  onChange={(e) =>
                    setDesign((d) => ({
                      ...d,
                      institutionName: e.target.value,
                    }))
                  }
                  placeholder="School name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tagline / Sub-text</Label>
                <Input
                  value={design.tagline}
                  onChange={(e) =>
                    setDesign((d) => ({ ...d, tagline: e.target.value }))
                  }
                  placeholder="Sub-text below school name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Header Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.headerBg}
                    onChange={(e) =>
                      setDesign((d) => ({ ...d, headerBg: e.target.value }))
                    }
                    className="w-9 h-9 rounded border border-border cursor-pointer p-0.5 bg-transparent"
                  />
                  <Input
                    value={design.headerBg}
                    onChange={(e) =>
                      setDesign((d) => ({ ...d, headerBg: e.target.value }))
                    }
                    placeholder="#1e40af"
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Exam Details
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Exam Name</Label>
                <Input
                  value={design.examName}
                  onChange={(e) =>
                    setDesign((d) => ({ ...d, examName: e.target.value }))
                  }
                  placeholder="e.g. Annual Examination"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Exam Year</Label>
                <Input
                  value={design.examYear}
                  onChange={(e) =>
                    setDesign((d) => ({ ...d, examYear: e.target.value }))
                  }
                  placeholder="e.g. 2026"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Subject Schedule */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Subject Schedule
            </h3>
            <div className="space-y-2 mb-3">
              {(design.subjects ?? []).map((subj, idx) => (
                <div
                  key={subj.id}
                  className="flex items-start gap-1.5 bg-muted/40 rounded-lg p-2"
                >
                  <span className="text-xs text-muted-foreground font-mono pt-1 w-4 shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 grid grid-cols-1 gap-1.5">
                    <Input
                      value={subj.name}
                      onChange={(e) =>
                        handleSubjectChange(subj.id, "name", e.target.value)
                      }
                      placeholder="Subject name"
                      className="h-7 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <Input
                        type="date"
                        value={subj.date}
                        onChange={(e) =>
                          handleSubjectChange(subj.id, "date", e.target.value)
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        value={subj.time}
                        onChange={(e) =>
                          handleSubjectChange(subj.id, "time", e.target.value)
                        }
                        placeholder="e.g. 10:00 AM"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(subj.id)}
                    className="text-destructive hover:text-destructive/70 mt-0.5 shrink-0"
                    title="Remove subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(design.subjects ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No subjects added yet
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs h-8"
              onClick={handleAddSubject}
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </Button>
          </div>

          {/* Signature Options */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Signature &amp; Logo Options
            </h3>
            <div className="space-y-3">
              {(
                [
                  ["showPrincipalSign", "Show Principal Signature"] as const,
                  [
                    "showClassTeacherSign",
                    "Show Class Teacher Signature",
                  ] as const,
                  ["showLogo", "Show Logo as Watermark"] as const,
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label
                    className="text-xs cursor-pointer"
                    htmlFor={`toggle-${key}`}
                  >
                    {label}
                  </Label>
                  <Switch
                    id={`toggle-${key}`}
                    checked={design[key]}
                    onCheckedChange={(checked) =>
                      setDesign((d) => ({ ...d, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Border Style */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Border Style
            </h3>
            <Select
              value={design.borderStyle}
              onValueChange={(v) =>
                setDesign((d) => ({
                  ...d,
                  borderStyle: v as HallTicketDesign["borderStyle"],
                }))
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save button */}
          <Button onClick={handleSaveDesign} className="w-full gap-2">
            <Check className="w-4 h-4" /> Save Design
          </Button>
        </div>

        {/* ── Right Panel: Preview & Print ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Preview for Student
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-8 text-sm w-32">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Student</Label>
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger className="h-8 text-sm w-48">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsInClass.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="h-8 gap-1.5 text-sm"
                >
                  <Printer className="w-4 h-4" /> Print Hall Ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Hall Ticket Preview */}
          <div id="hall-ticket-print-wrapper">
            <div
              id="principal-hall-ticket-preview"
              className="bg-white rounded-lg overflow-hidden"
              style={{
                border: ticketBorder,
                maxWidth: "720px",
                fontFamily: "'Times New Roman', Times, serif",
                color: "#111",
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center gap-4"
                style={{ backgroundColor: design.headerBg }}
              >
                {design.showLogo && (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      padding: "4px",
                    }}
                  />
                )}
                <div className="flex-1 text-center">
                  <h1
                    className="text-xl font-bold tracking-wide"
                    style={{
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {design.institutionName}
                  </h1>
                  {design.tagline && (
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {design.tagline}
                    </p>
                  )}
                </div>
                {design.showLogo && <div className="w-16 shrink-0" />}
              </div>

              {/* Title Banner */}
              <div
                className="text-center py-2.5"
                style={{
                  backgroundColor: `${design.headerBg}22`,
                  borderBottom: `2px solid ${design.headerBg}44`,
                }}
              >
                <p
                  className="text-base font-bold tracking-widest uppercase"
                  style={{ color: design.headerBg, letterSpacing: "0.2em" }}
                >
                  Hall Ticket
                </p>
                <p className="text-sm font-medium" style={{ color: "#444" }}>
                  {design.examName} — {design.examYear}
                </p>
              </div>

              {/* Body */}
              <div className="px-6 pt-4 pb-5 relative">
                {/* Watermark */}
                {design.showLogo && (
                  <img
                    src={logoSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute pointer-events-none select-none"
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "contain",
                      opacity: 0.05,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}

                {/* Student Info */}
                <div className="flex items-start gap-5 mb-5">
                  {/* Photo */}
                  <div
                    className="shrink-0 w-20 h-24 rounded overflow-hidden flex items-center justify-center text-2xl font-bold"
                    style={{
                      border: `2px solid ${design.headerBg}`,
                      color: "white",
                      backgroundColor: design.headerBg,
                    }}
                  >
                    {selectedStudent?.photo ? (
                      <img
                        src={selectedStudent.photo}
                        alt={selectedStudent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (selectedStudent?.name?.charAt(0) ?? "?")
                    )}
                  </div>

                  {/* Details table */}
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ["Student Name", selectedStudent?.name ?? "—"],
                      ["Roll Number", selectedStudent?.rollNo ?? "—"],
                      ["Class / Section", selectedStudent?.class ?? "—"],
                      ["Student ID", selectedStudent?.id ?? "—"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border-b border-gray-200 pb-1"
                      >
                        <span
                          className="block text-xs font-semibold uppercase tracking-wider"
                          style={{ color: design.headerBg }}
                        >
                          {label}
                        </span>
                        <span className="font-medium text-gray-800">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject Schedule */}
                <div className="mb-5">
                  <h3
                    className="text-sm font-bold uppercase tracking-wider mb-2"
                    style={{ color: design.headerBg }}
                  >
                    Examination Schedule
                  </h3>
                  <table
                    className="w-full text-sm"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: design.headerBg,
                          color: "white",
                        }}
                      >
                        <th className="px-3 py-2 text-left text-xs font-semibold">
                          #
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">
                          Subject
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">
                          Time
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">
                          Invigilator Sign
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(design.subjects ?? []).map((subj, idx) => (
                        <tr
                          key={subj.id}
                          style={{
                            backgroundColor:
                              idx % 2 === 0 ? "white" : `${design.headerBg}0d`,
                          }}
                        >
                          <td
                            className="px-3 py-2 text-xs"
                            style={{
                              border: "1px solid #e5e7eb",
                              color: "#666",
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className="px-3 py-2 text-sm font-medium"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            {subj.name || "—"}
                          </td>
                          <td
                            className="px-3 py-2 text-xs"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            {subj.date
                              ? new Date(subj.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </td>
                          <td
                            className="px-3 py-2 text-xs"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            {subj.time || "—"}
                          </td>
                          <td
                            className="px-3 py-2"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            <div
                              className="border-b border-gray-400 mt-4"
                              style={{ minWidth: "80px" }}
                            />
                          </td>
                        </tr>
                      ))}
                      {(design.subjects ?? []).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-3 text-center text-xs text-gray-500 italic"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            No subjects scheduled
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                <div
                  className="text-xs mb-5 p-3 rounded"
                  style={{
                    backgroundColor: `${design.headerBg}0d`,
                    border: `1px solid ${design.headerBg}33`,
                    color: "#555",
                  }}
                >
                  <p
                    className="font-semibold mb-1"
                    style={{ color: design.headerBg }}
                  >
                    Instructions:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>
                      This hall ticket must be presented at the examination
                      hall.
                    </li>
                    <li>
                      Students must arrive 15 minutes before the examination.
                    </li>
                    <li>
                      Mobile phones and electronic devices are strictly
                      prohibited.
                    </li>
                    <li>Lost hall ticket will not be re-issued.</li>
                  </ol>
                </div>

                {/* Signatures */}
                {(design.showPrincipalSign || design.showClassTeacherSign) && (
                  <div
                    className="flex items-end justify-between mt-6 pt-4"
                    style={{ borderTop: "1px solid #e5e7eb" }}
                  >
                    {design.showClassTeacherSign && (
                      <div className="text-center">
                        <div
                          className="border-b-2 mb-1 mx-auto"
                          style={{
                            width: "120px",
                            borderColor: design.headerBg,
                          }}
                        />
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "#555" }}
                        >
                          Class Teacher
                        </p>
                        <p className="text-xs" style={{ color: "#888" }}>
                          Signature &amp; Date
                        </p>
                      </div>
                    )}
                    {design.showPrincipalSign && (
                      <div className="text-center">
                        <div
                          className="border-b-2 mb-1 mx-auto"
                          style={{
                            width: "120px",
                            borderColor: design.headerBg,
                          }}
                        />
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "#555" }}
                        >
                          Principal
                        </p>
                        <p className="text-xs" style={{ color: "#888" }}>
                          Signature &amp; Seal
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-6 py-2 text-center text-xs"
                style={{
                  backgroundColor: `${design.headerBg}18`,
                  borderTop: `1px solid ${design.headerBg}33`,
                  color: "#666",
                }}
              >
                {design.institutionName} · {design.examName} {design.examYear} ·
                Official Hall Ticket
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Timetable Approval
// ============================================================
const DAYS_TT = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const PERIODS_TT = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
  "Period 7",
  "Period 8",
];

function TimetableApproval({ user }: { user: CurrentUser }) {
  const [timetables, setTimetables] = useState<Timetable[]>(getTimetables());
  const teachers = getTeachers();
  const [filterTab, setFilterTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [selectedTT, setSelectedTT] = useState<Timetable | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const getTeacherName = (teacherId: string) =>
    teachers.find((t) => t.id === teacherId)?.name ?? teacherId;

  const pendingCount = timetables.filter(
    (t) => t.approvalStatus === "pending",
  ).length;
  const approvedCount = timetables.filter(
    (t) => t.approvalStatus === "approved",
  ).length;
  const rejectedCount = timetables.filter(
    (t) => t.approvalStatus === "rejected",
  ).length;

  const filtered = timetables.filter((t) => {
    if (filterTab === "all") return true;
    return t.approvalStatus === filterTab;
  });

  const handleApprove = async (tt: Timetable) => {
    const updated = timetables.map((t) =>
      t.id === tt.id
        ? {
            ...t,
            approvalStatus: "approved" as const,
            approvedBy: user.id,
            approvedAt: new Date().toISOString().split("T")[0],
            approvalNote: undefined,
          }
        : t,
    );
    const updatedRecord = updated.find((t) => t.id === tt.id);
    if (updatedRecord) {
      try {
        await saveTimetableToBackend(updatedRecord);
      } catch (err) {
        console.error("saveTimetableToBackend (approve) failed:", err);
        saveTimetables(updated);
      }
    }
    setTimetables(updated);
    setSelectedTT(null);
    setShowRejectInput(false);
    toast.success(`Timetable for Class ${tt.class} approved`);
  };

  const handleReject = async (tt: Timetable) => {
    if (!rejectNote.trim()) {
      toast.error("Please provide a rejection note");
      return;
    }
    const updated = timetables.map((t) =>
      t.id === tt.id
        ? {
            ...t,
            approvalStatus: "rejected" as const,
            approvedBy: user.id,
            approvedAt: new Date().toISOString().split("T")[0],
            approvalNote: rejectNote.trim(),
          }
        : t,
    );
    const updatedRecord = updated.find((t) => t.id === tt.id);
    if (updatedRecord) {
      try {
        await saveTimetableToBackend(updatedRecord);
      } catch (err) {
        console.error("saveTimetableToBackend (reject) failed:", err);
        saveTimetables(updated);
      }
    }
    setTimetables(updated);
    setSelectedTT(null);
    setShowRejectInput(false);
    setRejectNote("");
    toast.success(`Timetable for Class ${tt.class} rejected`);
  };

  const statusBadge = (status: Timetable["approvalStatus"]) => {
    if (status === "approved")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-success">
          Approved
        </span>
      );
    if (status === "rejected")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-destructive">
          Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-warning">
        Pending
      </span>
    );
  };

  return (
    <div>
      <h2 className="section-title">Timetable Approval</h2>
      <p className="section-subtitle">
        Review and approve timetables submitted by class teachers
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all" as const, label: "All", count: timetables.length },
          { key: "pending" as const, label: "Pending", count: pendingCount },
          { key: "approved" as const, label: "Approved", count: approvedCount },
          { key: "rejected" as const, label: "Rejected", count: rejectedCount },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterTab(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterTab === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-75">({count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          No timetables submitted yet
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tt) => (
                <TableRow key={tt.id}>
                  <TableCell className="font-semibold">
                    <Badge variant="outline">Class {tt.class}</Badge>
                  </TableCell>
                  <TableCell>{getTeacherName(tt.updatedBy)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(tt.updatedAt)}
                  </TableCell>
                  <TableCell>{statusBadge(tt.approvalStatus)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[160px] truncate">
                    {tt.approvalNote || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => {
                        setSelectedTT(tt);
                        setShowRejectInput(false);
                        setRejectNote("");
                      }}
                    >
                      View &amp; Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Dialog */}
      {selectedTT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  Review Timetable — Class {selectedTT.class}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by {getTeacherName(selectedTT.updatedBy)} ·{" "}
                  {formatDate(selectedTT.updatedAt)} ·{" "}
                  {statusBadge(selectedTT.approvalStatus)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTT(null);
                  setShowRejectInput(false);
                  setRejectNote("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Schedule grid (read-only) */}
            <div className="p-5">
              <div className="overflow-x-auto bg-muted/20 border border-border rounded-lg mb-5">
                <table className="w-full text-xs min-w-[700px]">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "oklch(var(--primary))",
                        color: "oklch(var(--primary-foreground))",
                      }}
                    >
                      <th className="text-left py-2.5 px-3 font-semibold w-24">
                        Period
                      </th>
                      {DAYS_TT.map((d) => (
                        <th
                          key={d}
                          className="text-left py-2.5 px-3 font-semibold"
                        >
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS_TT.map((period, pi) => (
                      <tr
                        key={period}
                        className={pi % 2 === 0 ? "bg-card" : "bg-muted/30"}
                      >
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {period}
                        </td>
                        {DAYS_TT.map((day) => {
                          const cell = selectedTT.schedule[day]?.[period];
                          return (
                            <td
                              key={day}
                              className="py-2 px-3 border-l border-border/50"
                            >
                              {cell?.subject ? (
                                <div>
                                  <p className="font-medium text-foreground">
                                    {cell.subject}
                                  </p>
                                  {cell.teacher && (
                                    <p className="text-muted-foreground text-xs">
                                      {cell.teacher}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 items-start">
                {!showRejectInput ? (
                  <>
                    <Button
                      className="gap-1.5 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedTT)}
                    >
                      <Check className="w-4 h-4" /> Approve Timetable
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => setShowRejectInput(true)}
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Label>Rejection Note (required)</Label>
                      <textarea
                        className="w-full border border-border rounded-lg p-2.5 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Explain why the timetable is being rejected..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() => handleReject(selectedTT)}
                      >
                        <X className="w-4 h-4" /> Confirm Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRejectInput(false);
                          setRejectNote("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Send Message to Parents
// ============================================================
const MESSAGE_TEMPLATES = [
  {
    label: "Results Update",
    text: "Dear Parent, we are pleased to inform you about [Student Name]'s exam results. Please log in to the school portal for details.",
  },
  {
    label: "Fee Reminder",
    text: "Dear Parent, this is a reminder that the school fee for [Student Name] is due. Please clear the dues at the earliest.",
  },
  {
    label: "Announcement",
    text: "Dear Parent, please be informed of an important announcement from Rahmaniyya Public School. Kindly check the school portal.",
  },
  {
    label: "General Notice",
    text: "Dear Parent, this is an important notice from the school management. Please contact the school for more information.",
  },
];

function SendMessageToParents() {
  const allStudents = getStudents() ?? [];
  const [message, setMessage] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const uniqueClasses = Array.from(
    new Set(allStudents.map((s) => s.class)),
  ).sort();

  const filteredStudents =
    classFilter === "all"
      ? allStudents
      : allStudents.filter((s) => s.class === classFilter);

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selected.has(s.id));

  const toggleStudent = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const s of filteredStudents) next.delete(s.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const s of filteredStudents) next.add(s.id);
        return next;
      });
    }
  };

  const buildWhatsAppUrl = (phone: string, msg: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const withCountry = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
    return `https://wa.me/${withCountry}?text=${encodeURIComponent(msg)}`;
  };

  const handleSendOne = (student: Student) => {
    if (!message.trim()) {
      toast.warning("Please type a message first");
      return;
    }
    const personalised = message.replace(/\[Student Name\]/g, student.name);
    const url = buildWhatsAppUrl(student.parentPhone, personalised);
    window.open(url, "_blank");
  };

  const handleSendAll = async () => {
    if (!message.trim()) {
      toast.warning("Please type a message first");
      return;
    }
    const targets = allStudents.filter((s) => selected.has(s.id));
    if (targets.length === 0) {
      toast.warning("Please select at least one student");
      return;
    }
    setSending(true);
    for (let i = 0; i < targets.length; i++) {
      const s = targets[i];
      const personalised = message.replace(/\[Student Name\]/g, s.name);
      const url = buildWhatsAppUrl(s.parentPhone, personalised);
      window.open(url, "_blank");
      if (i < targets.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
    setSending(false);
    toast.success(
      `Opened WhatsApp for ${targets.length} parent${targets.length > 1 ? "s" : ""}`,
    );
  };

  const totalSelected = allStudents.filter((s) => selected.has(s.id)).length;

  return (
    <div>
      <h2 className="section-title">Send Message to Parents</h2>
      <p className="section-subtitle">
        Compose a custom message and send it to parents via WhatsApp
      </p>

      {/* Compose area */}
      <div className="bg-card border border-border rounded-lg p-5 mb-5 max-w-2xl">
        <h3 className="font-semibold text-foreground mb-3">Compose Message</h3>

        {/* Quick templates */}
        <div className="flex flex-wrap gap-2 mb-3">
          {MESSAGE_TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setMessage(t.text)}
              className="px-3 py-1 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Type your custom message here, or click a template above. Use [Student Name] as a placeholder — it will be replaced with each student's actual name."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mb-2"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Use <code className="bg-muted px-1 rounded">[Student Name]</code>{" "}
          in your message — it will be personalised for each recipient.
        </p>
      </div>

      {/* Recipient filter & table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-5">
        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Recipients</h3>
          <div className="flex items-center gap-2 ml-auto">
            <Label className="text-xs text-muted-foreground">
              Filter class:
            </Label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((c) => (
                  <SelectItem key={c} value={c}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={toggleAll}
            >
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Toggle all visible students"
                />
              </TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent Name</TableHead>
              <TableHead>Parent Phone</TableHead>
              <TableHead className="w-20 text-center">Send</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(s.id)}
                      onCheckedChange={() => toggleStudent(s.id)}
                      aria-label={`Select ${s.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.class}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.parentName || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {s.parentPhone || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => handleSendOne(s)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                      title={`Send WhatsApp to ${s.parentName || s.name}'s parent`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Send All button */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          onClick={handleSendAll}
          disabled={sending}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Send className="w-5 h-5" />
          {sending
            ? "Opening WhatsApp..."
            : "Send to All Selected via WhatsApp"}
        </Button>
        {totalSelected > 0 ? (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {totalSelected}
            </span>{" "}
            recipient{totalSelected !== 1 ? "s" : ""} selected
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            No recipients selected — check the boxes above
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Each selected parent's WhatsApp will open in a new tab. Your browser may
        ask permission to open multiple tabs — please allow it.
      </p>
    </div>
  );
}

// ============================================================
// Fee Report
// ============================================================
function FeeReport() {
  const [fees, setFees] = useState<FeeRecord[]>(() => getFees());
  // Read students once with lazy initializer
  const students = useMemo(() => getStudents(), []);

  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");

  // Add Fee Record dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    studentId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    method: "",
    description: "",
    receiptNumber: "",
  });

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Unique classes from students (memoized)
  const classes = useMemo(
    () => Array.from(new Set(students.map((s) => s.class))).sort(),
    [students],
  );

  // O(1) student lookup map
  const studentMap = useMemo(
    () =>
      Object.fromEntries(
        students.map((s) => [s.id, { name: s.name, class: s.class }]),
      ),
    [students],
  );

  // Join fees with student info (memoized - no .find() per row)
  const enriched = useMemo(
    () =>
      fees.map((f) => {
        const student = studentMap[f.studentId];
        return {
          ...f,
          studentName: student?.name ?? "Unknown",
          studentClass: student?.class ?? "—",
        };
      }),
    [fees, studentMap],
  );

  const filtered = useMemo(() => {
    return enriched.filter((f) => {
      const classMatch =
        classFilter === "all" || f.studentClass === classFilter;
      const statusMatch = statusFilter === "all" || f.status === statusFilter;
      const searchMatch =
        studentSearch === "" ||
        f.studentName.toLowerCase().includes(studentSearch.toLowerCase());
      return classMatch && statusMatch && searchMatch;
    });
  }, [enriched, classFilter, statusFilter, studentSearch]);

  // Summary totals (memoized)
  const { paged: pagedFees, pagination: feePagination } = usePagination(
    filtered,
    15,
  );

  const { totalCollected, totalPartial, totalPending } = useMemo(() => {
    let collected = 0;
    let partial = 0;
    let pending = 0;
    for (const f of filtered) {
      if (f.status === "paid") collected += f.amount;
      else if (f.status === "partial") partial += f.amount;
      else if (f.status === "pending") pending += f.amount;
    }
    return {
      totalCollected: collected,
      totalPartial: partial,
      totalPending: pending,
    };
  }, [filtered]);

  // ── Time-period fee summaries ──────────────────────────────
  const periodSummaries = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Weekly boundary: 7 days ago at start of that day
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    type EnrichedFee = (typeof enriched)[number];

    function computeSummary(records: EnrichedFee[]) {
      let paid = 0;
      let partial = 0;
      let pending = 0;
      for (const r of records) {
        if (r.status === "paid") paid += r.amount;
        else if (r.status === "partial") partial += r.amount;
        else if (r.status === "pending") pending += r.amount;
      }
      return { paid, partial, pending, count: records.length };
    }

    const daily = enriched.filter((r) => r.date === todayStr);

    const weekly = enriched.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return d >= weekAgo && d <= now;
    });

    const monthly = enriched.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const yearly = enriched.filter((r) => {
      if (!r.date) return false;
      return new Date(r.date).getFullYear() === currentYear;
    });

    return {
      daily: computeSummary(daily),
      weekly: computeSummary(weekly),
      monthly: computeSummary(monthly),
      yearly: computeSummary(yearly),
    };
  }, [enriched]);

  // ── Add Fee Record ─────────────────────────────────────────
  const handleAddFee = () => {
    if (!addForm.studentId || !addForm.amount || !addForm.date) {
      toast.error("Please fill in Student, Amount, and Date");
      return;
    }
    const newFee: FeeRecord = {
      id: generateId("fee"),
      studentId: addForm.studentId,
      amount: Number(addForm.amount),
      date: addForm.date,
      status: addForm.status as FeeRecord["status"],
      method: addForm.method,
      description: addForm.description,
      receiptNumber: addForm.receiptNumber || undefined,
    };
    const updated = [...fees, newFee];
    setFees(updated);
    saveFees(updated);
    saveFeeToBackend(newFee);
    // Auto-add to income if fee is paid
    if (newFee.status === "paid") {
      const existing = getFinancialRecords().find(
        (r) => r.sourceFeeId === newFee.id,
      );
      if (!existing) {
        const student = (getStudents() ?? []).find(
          (s) => s.id === newFee.studentId,
        );
        saveFinancialRecord({
          id: generateId("fin"),
          type: "income",
          category: "Fee Collection",
          description: `Fee from ${student ? student.name : newFee.studentId}`,
          amount: newFee.amount,
          date: newFee.date,
          createdAt: new Date().toISOString(),
          receiptNo: newFee.receiptNumber || undefined,
          sourceType: "fee",
          sourceFeeId: newFee.id,
        });
      }
    }
    toast.success("Fee record added");
    setAddOpen(false);
    setAddForm({
      studentId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      method: "",
      description: "",
      receiptNumber: "",
    });
  };

  // ── Delete Fee Record ───────────────────────────────────────
  const handleDeleteFee = (id: string) => {
    const updated = fees.filter((f) => f.id !== id);
    setFees(updated);
    saveFees(updated);
    setDeleteConfirmId(null);
    toast.success("Fee record deleted");
  };

  const handleDownloadCSV = () => {
    const headers = [
      "Student Name",
      "Class",
      "Amount (₹)",
      "Date",
      "Status",
      "Method",
      "Description",
      "Receipt No.",
    ];
    const rows = filtered.map((f) => [
      f.studentName,
      f.studentClass,
      f.amount,
      f.date || "—",
      f.status,
      f.method || "—",
      f.description,
      f.receiptNumber ?? "—",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fee-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fee data exported as CSV");
  };

  // ── PDF Download ────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const schoolName =
      getPrincipalProfile().institutionName ?? "Rahmaniyya Public School";
    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const filterInfo = [
      classFilter !== "all" ? `Class: ${classFilter}` : "All Classes",
      statusFilter !== "all"
        ? `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`
        : "All Statuses",
      studentSearch ? `Student: ${studentSearch}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const tableRows = filtered
      .map(
        (f, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
        <td>${i + 1}</td>
        <td>${f.studentName}</td>
        <td>${f.studentClass}</td>
        <td style="text-align:right">₹${f.amount.toLocaleString("en-IN")}</td>
        <td>${f.date ? new Date(f.date).toLocaleDateString("en-IN") : "—"}</td>
        <td><span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${f.status === "paid" ? "#dcfce7" : f.status === "pending" ? "#fee2e2" : "#fef9c3"};color:${f.status === "paid" ? "#166534" : f.status === "pending" ? "#991b1b" : "#854d0e"}">${f.status.toUpperCase()}</span></td>
        <td>${f.method || "—"}</td>
        <td>${f.description || "—"}</td>
        <td>${f.receiptNumber ?? "—"}</td>
      </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fee Report — ${schoolName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
    h1 { font-size: 22px; margin: 0; color: #1a3c6e; }
    h2 { font-size: 15px; margin: 4px 0 2px; color: #374151; font-weight: 500; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
    .summary { display: flex; gap: 16px; margin-bottom: 20px; }
    .summary-card { padding: 10px 16px; border-radius: 8px; min-width: 120px; }
    .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; margin-bottom: 4px; }
    .summary-card .value { font-size: 18px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1a3c6e; color: #fff; padding: 8px 10px; text-align: left; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>${schoolName}</h1>
  <h2>Fee Report</h2>
  <p class="meta">Generated on ${dateStr} &nbsp;|&nbsp; Filters: ${filterInfo} &nbsp;|&nbsp; ${filtered.length} record(s)</p>
  <div class="summary">
    <div class="summary-card" style="background:#dcfce7">
      <div class="label" style="color:#166534">Collected (Paid)</div>
      <div class="value" style="color:#166534">₹${totalCollected.toLocaleString("en-IN")}</div>
    </div>
    <div class="summary-card" style="background:#fef9c3">
      <div class="label" style="color:#854d0e">Partial</div>
      <div class="value" style="color:#854d0e">₹${totalPartial.toLocaleString("en-IN")}</div>
    </div>
    <div class="summary-card" style="background:#fee2e2">
      <div class="label" style="color:#991b1b">Pending</div>
      <div class="value" style="color:#991b1b">₹${totalPending.toLocaleString("en-IN")}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Student Name</th><th>Class</th><th>Amount (₹)</th>
        <th>Date</th><th>Status</th><th>Method</th><th>Description</th><th>Receipt No.</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 400);
    } else {
      toast.error("Pop-up blocked. Please allow pop-ups and try again.");
    }
  };

  const statusColors: Record<string, string> = {
    paid: "badge-success",
    pending: "badge-destructive",
    partial: "badge-warning",
  };

  return (
    <div>
      <h2 className="section-title">Fee Report</h2>
      <p className="section-subtitle">
        View, manage, and download all students' fee records
      </p>

      {/* ── Fee Status Summary by Time Period ── */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Fee Status Summary
        </h3>
        <Tabs defaultValue="monthly">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="daily" data-ocid="fee_summary.daily_tab">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" data-ocid="fee_summary.weekly_tab">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" data-ocid="fee_summary.monthly_tab">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" data-ocid="fee_summary.yearly_tab">
              Yearly
            </TabsTrigger>
          </TabsList>

          {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => {
            const s = periodSummaries[period];
            const labels: Record<typeof period, string> = {
              daily: "today",
              weekly: "the last 7 days",
              monthly: "this month",
              yearly: "this year",
            };
            return (
              <TabsContent key={period} value={period}>
                <p className="text-xs text-muted-foreground mb-3">
                  Fee records from {labels[period]} — {s.count} transaction
                  {s.count !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Collected */}
                  <div
                    className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4"
                    data-ocid="fee_summary.collected_card"
                  >
                    <p className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wide font-medium mb-1">
                      Collected
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      ₹{s.paid.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">
                      Paid
                    </p>
                  </div>

                  {/* Partial */}
                  <div
                    className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
                    data-ocid="fee_summary.partial_card"
                  >
                    <p className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wide font-medium mb-1">
                      Partial
                    </p>
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                      ₹{s.partial.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                      Partial Payments
                    </p>
                  </div>

                  {/* Pending */}
                  <div
                    className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    data-ocid="fee_summary.pending_card"
                  >
                    <p className="text-xs text-red-700 dark:text-red-400 uppercase tracking-wide font-medium mb-1">
                      Pending
                    </p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-400">
                      ₹{s.pending.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-red-600/70 dark:text-red-500/70 mt-0.5">
                      Outstanding
                    </p>
                  </div>

                  {/* Transactions */}
                  <div
                    className="bg-card border border-border rounded-lg p-4"
                    data-ocid="fee_summary.transactions_card"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                      Transactions
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {s.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total records
                    </p>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Summary cards — All time (filter-based) */}
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <LayoutGrid className="w-4 h-4 text-primary" />
        All-Time Overview{" "}
        <span className="text-xs font-normal text-muted-foreground">
          (based on active filters)
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Total Collected (Paid)
          </p>
          <p className="text-2xl font-bold text-green-600">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Partial Payments
          </p>
          <p className="text-2xl font-bold text-amber-600">
            ₹{totalPartial.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Total Pending
          </p>
          <p className="text-2xl font-bold text-destructive">
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filters row + Add button */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search student..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="w-44"
          data-ocid="fee_report.student_search_input"
        />

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-40" data-ocid="fee_report.class_select">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-ocid="fee_report.status_select">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleDownloadCSV}
            data-ocid="fee_report.csv_download_button"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleDownloadPDF}
            data-ocid="fee_report.pdf_download_button"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </Button>

          {/* Add Fee Record dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5"
                data-ocid="fee_report.add_open_modal_button"
              >
                <Plus className="w-4 h-4" />
                Add Fee Record
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md"
              data-ocid="fee_report.add_dialog"
            >
              <DialogHeader>
                <DialogTitle>Add Fee Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Student */}
                <div className="space-y-1">
                  <Label>Student *</Label>
                  <Select
                    value={addForm.studentId}
                    onValueChange={(v) =>
                      setAddForm((f) => ({ ...f, studentId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="fee_report.add_student_select">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — Class {s.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 5000"
                    value={addForm.amount}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    data-ocid="fee_report.add_amount_input"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={addForm.date}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, date: e.target.value }))
                    }
                    data-ocid="fee_report.add_date_input"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select
                    value={addForm.status}
                    onValueChange={(v) =>
                      setAddForm((f) => ({ ...f, status: v }))
                    }
                  >
                    <SelectTrigger data-ocid="fee_report.add_status_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <Input
                    placeholder="e.g. Cash, Online, Cheque"
                    value={addForm.method}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, method: e.target.value }))
                    }
                    data-ocid="fee_report.add_method_input"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input
                    placeholder="e.g. Term 1 Fees"
                    value={addForm.description}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    data-ocid="fee_report.add_description_input"
                  />
                </div>

                {/* Receipt Number */}
                <div className="space-y-1">
                  <Label>Receipt Number (optional)</Label>
                  <Input
                    placeholder="e.g. RPS-2026-001"
                    value={addForm.receiptNumber}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        receiptNumber: e.target.value,
                      }))
                    }
                    data-ocid="fee_report.add_receipt_input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  data-ocid="fee_report.add_cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFee}
                  data-ocid="fee_report.add_submit_button"
                >
                  Save Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table with pagination */}
      <div
        className="bg-card border border-border rounded-lg overflow-hidden"
        data-ocid="fee_report.table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedFees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-10"
                  data-ocid="fee_report.empty_state"
                >
                  No fee records found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              pagedFees.map((f, idx) => (
                <TableRow key={f.id} data-ocid={`fee_report.item.${idx + 1}`}>
                  <TableCell className="font-medium">{f.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{f.studentClass}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    ₹{f.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.date ? formatDate(f.date) : "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[f.status] ?? ""}`}
                    >
                      {f.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.method || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[180px] truncate">
                    {f.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {f.receiptNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    {deleteConfirmId === f.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs px-2"
                          onClick={() => handleDeleteFee(f.id)}
                          data-ocid={`fee_report.delete_button.${idx + 1}`}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          onClick={() => setDeleteConfirmId(null)}
                          data-ocid={`fee_report.cancel_button.${idx + 1}`}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteConfirmId(f.id)}
                        data-ocid={`fee_report.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination pagination={feePagination} />
      </div>
    </div>
  );
}

// ============================================================
// Expenses & Income
// ============================================================
function ExpensesIncome() {
  const [records, setRecords] = useState<FinancialRecord[]>(() =>
    getFinancialRecords(),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [reportYear, setReportYear] = useState<string>(() =>
    String(new Date().getFullYear()),
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    receiptNo: "",
    voucherNumber: "",
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Summary cards
  const summary = useMemo(() => {
    const thisMonthRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const thisYearRecords = records.filter(
      (r) => new Date(r.date).getFullYear() === currentYear,
    );

    const monthIncome = thisMonthRecords
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + r.amount, 0);
    const monthExpense = thisMonthRecords
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + r.amount, 0);
    const yearIncome = thisYearRecords
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + r.amount, 0);
    const yearExpense = thisYearRecords
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + r.amount, 0);

    return {
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
      yearNet: yearIncome - yearExpense,
    };
  }, [records, currentYear, currentMonth]);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const rMonth = r.date.slice(0, 7);
      if (filterMonth && rMonth !== filterMonth) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      if (
        filterCategory &&
        !r.category.toLowerCase().includes(filterCategory.toLowerCase())
      )
        return false;
      return true;
    });
  }, [records, filterMonth, filterType, filterCategory]);

  const handleAdd = () => {
    if (!form.category || !form.amount || !form.date) {
      toast.error("Please fill in Category, Amount, and Date");
      return;
    }
    const rec: FinancialRecord = {
      id: generateId("fin"),
      type: form.type,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      createdAt: new Date().toISOString(),
      receiptNo: form.receiptNo || undefined,
      voucherNumber: form.voucherNumber || undefined,
      sourceType: "manual",
    };
    saveFinancialRecord(rec);
    setRecords(getFinancialRecords());
    toast.success(
      `${form.type === "income" ? "Income" : "Expense"} record added`,
    );
    setAddOpen(false);
    setForm({
      type: "income",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      receiptNo: "",
      voucherNumber: "",
    });
  };

  const handleDelete = (id: string) => {
    deleteFinancialRecord(id);
    setRecords(getFinancialRecords());
    setDeleteConfirmId(null);
    toast.success("Record deleted");
  };

  const handleDownloadMonthly = () => {
    const [year, month] = filterMonth.split("-").map(Number);
    const monthRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    const schoolName =
      getPrincipalProfile().institutionName ?? "Rahmaniyya Public School";
    const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(
      "en-IN",
      { year: "numeric", month: "long" },
    );
    const totalIncome = monthRecords
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + r.amount, 0);
    const totalExpense = monthRecords
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + r.amount, 0);

    const rows = monthRecords
      .map(
        (r, i) => `<tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.date}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:${r.type === "income" ? "#16a34a" : "#dc2626"};font-weight:600">${r.type.charAt(0).toUpperCase() + r.type.slice(1)}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.category}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.description || "—"}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.receiptNo || "—"}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.voucherNumber || "—"}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right">₹${r.amount.toLocaleString("en-IN")}</td>
      </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Monthly Audit Report - ${monthLabel}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:22px}h2{font-size:16px;color:#555}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#1e3a5f;color:#fff;padding:10px 12px;text-align:left;border:1px solid #e5e7eb}.summary{display:flex;gap:32px;margin:16px 0;padding:16px;background:#f0f9ff;border-radius:8px}.sum-item{text-align:center}.sum-label{font-size:12px;color:#666}.sum-value{font-size:20px;font-weight:700}</style>
    </head><body>
    <h1>${schoolName}</h1>
    <h2>Monthly Audit Report — ${monthLabel}</h2>
    <div class="summary">
      <div class="sum-item"><div class="sum-label">Total Income</div><div class="sum-value" style="color:#16a34a">₹${totalIncome.toLocaleString("en-IN")}</div></div>
      <div class="sum-item"><div class="sum-label">Total Expenses</div><div class="sum-value" style="color:#dc2626">₹${totalExpense.toLocaleString("en-IN")}</div></div>
      <div class="sum-item"><div class="sum-label">Net Balance</div><div class="sum-value" style="color:${totalIncome - totalExpense >= 0 ? "#16a34a" : "#dc2626"}">₹${(totalIncome - totalExpense).toLocaleString("en-IN")}</div></div>
    </div>
    <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Receipt No</th><th>Voucher No</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:16px;color:#999">No records for this month</td></tr>'}</tbody></table>
    <p style="margin-top:24px;font-size:12px;color:#999">Generated on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
    <script>window.onload=()=>window.print()</script></body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const handleDownloadYearly = () => {
    const year = Number(reportYear);
    const yearRecords = records.filter(
      (r) => new Date(r.date).getFullYear() === year,
    );
    const schoolName =
      getPrincipalProfile().institutionName ?? "Rahmaniyya Public School";
    const totalIncome = yearRecords
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + r.amount, 0);
    const totalExpense = yearRecords
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + r.amount, 0);

    // Group by month for summary
    const monthSummary: Record<number, { income: number; expense: number }> =
      {};
    for (let m = 0; m < 12; m++) {
      monthSummary[m] = { income: 0, expense: 0 };
    }
    for (const r of yearRecords) {
      const m = new Date(r.date).getMonth();
      if (r.type === "income") monthSummary[m].income += r.amount;
      else monthSummary[m].expense += r.amount;
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthRows = monthNames
      .map(
        (
          name,
          i,
        ) => `<tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${name}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#16a34a;text-align:right">₹${monthSummary[i].income.toLocaleString("en-IN")}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#dc2626;text-align:right">₹${monthSummary[i].expense.toLocaleString("en-IN")}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:${monthSummary[i].income - monthSummary[i].expense >= 0 ? "#16a34a" : "#dc2626"};font-weight:600;text-align:right">₹${(monthSummary[i].income - monthSummary[i].expense).toLocaleString("en-IN")}</td>
      </tr>`,
      )
      .join("");

    const detailRows = yearRecords
      .map(
        (r, i) => `<tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.date}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:${r.type === "income" ? "#16a34a" : "#dc2626"};font-weight:600">${r.type.charAt(0).toUpperCase() + r.type.slice(1)}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.category}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${r.description || "—"}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right">₹${r.amount.toLocaleString("en-IN")}</td>
      </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Yearly Audit Report ${year}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:22px}h2{font-size:16px;color:#555}h3{font-size:14px;margin-top:24px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#1e3a5f;color:#fff;padding:10px 12px;text-align:left;border:1px solid #e5e7eb}.summary{display:flex;gap:32px;margin:16px 0;padding:16px;background:#f0f9ff;border-radius:8px}.sum-item{text-align:center}.sum-label{font-size:12px;color:#666}.sum-value{font-size:20px;font-weight:700}</style>
    </head><body>
    <h1>${schoolName}</h1>
    <h2>Yearly Audit Report — ${year}</h2>
    <div class="summary">
      <div class="sum-item"><div class="sum-label">Total Income</div><div class="sum-value" style="color:#16a34a">₹${totalIncome.toLocaleString("en-IN")}</div></div>
      <div class="sum-item"><div class="sum-label">Total Expenses</div><div class="sum-value" style="color:#dc2626">₹${totalExpense.toLocaleString("en-IN")}</div></div>
      <div class="sum-item"><div class="sum-label">Net Balance</div><div class="sum-value" style="color:${totalIncome - totalExpense >= 0 ? "#16a34a" : "#dc2626"}">₹${(totalIncome - totalExpense).toLocaleString("en-IN")}</div></div>
    </div>
    <h3>Monthly Summary</h3>
    <table><thead><tr><th>Month</th><th style="text-align:right">Income</th><th style="text-align:right">Expense</th><th style="text-align:right">Net</th></tr></thead>
    <tbody>${monthRows}</tbody></table>
    <h3>Detailed Records</h3>
    <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${detailRows || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#999">No records for this year</td></tr>'}</tbody></table>
    <p style="margin-top:24px;font-size:12px;color:#999">Generated on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
    <script>window.onload=()=>window.print()</script></body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Expenses &amp; Income
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track all school finances and download audit reports
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="expenses.open_modal_button">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="expenses.dialog">
            <DialogHeader>
              <DialogTitle>Add Financial Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: v as "income" | "expense",
                    }))
                  }
                >
                  <SelectTrigger data-ocid="expenses.add.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input
                  data-ocid="expenses.add.input"
                  placeholder="e.g. Salaries, Fees Collected, Utilities"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input
                  placeholder="Optional details"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Receipt No</Label>
                  <Input
                    data-ocid="expenses.add.receipt_input"
                    placeholder="e.g. RCP-001"
                    value={form.receiptNo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, receiptNo: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Voucher Number</Label>
                  <Input
                    data-ocid="expenses.add.voucher_input"
                    placeholder="e.g. VCH-001"
                    value={form.voucherNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, voucherNumber: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                data-ocid="expenses.add.cancel_button"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="expenses.add.submit_button"
                onClick={handleAdd}
              >
                Add Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">This Month Income</p>
          <p className="text-xl font-bold text-green-600">
            ₹{summary.monthIncome.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">This Month Expenses</p>
          <p className="text-xl font-bold text-red-600">
            ₹{summary.monthExpense.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">This Month Net</p>
          <p
            className={`text-xl font-bold ${summary.monthNet >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            ₹{summary.monthNet.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Year-to-Date Net</p>
          <p
            className={`text-xl font-bold ${summary.yearNet >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            ₹{summary.yearNet.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Month</Label>
          <Input
            data-ocid="expenses.filter.input"
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select
            value={filterType}
            onValueChange={(v) =>
              setFilterType(v as "all" | "income" | "expense")
            }
          >
            <SelectTrigger data-ocid="expenses.filter.select" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Input
            placeholder="Search category..."
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table data-ocid="expenses.table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Receipt No</TableHead>
              <TableHead>Voucher No</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  data-ocid="expenses.empty_state"
                  className="text-center py-10 text-muted-foreground"
                >
                  No records found. Add your first income or expense.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, idx) => (
                <TableRow key={r.id} data-ocid={`expenses.item.${idx + 1}`}>
                  <TableCell className="text-sm">{r.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={r.type === "income" ? "default" : "destructive"}
                      className={
                        r.type === "income"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }
                    >
                      {r.type === "income" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {r.description || "—"}
                      {r.sourceType === "fee" && (
                        <Badge className="text-xs px-1 py-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Fee
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.receiptNo || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.voucherNumber || "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${r.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    ₹{r.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {deleteConfirmId === r.id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          data-ocid={`expenses.delete_button.${idx + 1}`}
                          onClick={() => handleDelete(r.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`expenses.cancel_button.${idx + 1}`}
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`expenses.delete_button.${idx + 1}`}
                        onClick={() => setDeleteConfirmId(r.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Download Audit Reports */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-base">Download Audit Reports</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate printable PDF reports for any month or year
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Month (for Monthly Report)</Label>
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-44"
            />
          </div>
          <Button
            variant="outline"
            data-ocid="expenses.monthly.button"
            onClick={handleDownloadMonthly}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Monthly Report
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Year (for Yearly Report)</Label>
            <Input
              type="number"
              min="2020"
              max="2099"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="w-32"
            />
          </div>
          <Button
            variant="outline"
            data-ocid="expenses.yearly.button"
            onClick={handleDownloadYearly}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Yearly Report
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Principal Dashboard
// ============================================================
export default function PrincipalDashboard({ user, onLogout }: Props) {
  const [section, setSection] = useState("overview");
  const [currentUser, setCurrentUserState] = useState(user);

  // Memoize badge counts so localStorage is only read once per mount
  const pendingResults = useMemo(
    () => getResults().filter((r) => r.status === "pending").length,
    [],
  );
  const pendingLeaves = useMemo(
    () =>
      getLeaves().filter(
        (l) => l.status === "pending" && l.applicantRole === "teacher",
      ).length,
    [],
  );
  const pendingTeacherAttendance = useMemo(
    () =>
      getTeacherAttendance().filter((r) => r.approvalStatus === "pending")
        .length,
    [],
  );
  const pendingSuggestions = useMemo(
    () => getSuggestions().filter((s) => !s.response).length,
    [],
  );
  const pendingTimetables = useMemo(
    () => getTimetables().filter((t) => t.approvalStatus === "pending").length,
    [],
  );

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "teachers",
      label: "Manage Teachers",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "students",
      label: "Manage Students",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "notifications",
      label: "Post Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "calendar",
      label: "Academic Calendar",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "results",
      label: "Publish Results",
      icon: <FileText className="w-4 h-4" />,
      badge: pendingResults,
    },
    {
      id: "hall-tickets",
      label: "Hall Tickets",
      icon: <Printer className="w-4 h-4" />,
    },
    {
      id: "leaves",
      label: "Leave Approvals",
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingLeaves,
    },
    {
      id: "teacher-attendance",
      label: "Teacher Attendance",
      icon: <Clock className="w-4 h-4" />,
      badge: pendingTeacherAttendance,
    },
    {
      id: "suggestions",
      label: "Student Suggestions",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: pendingSuggestions,
    },
    {
      id: "timetable-approval",
      label: "Timetable Approval",
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: pendingTimetables,
    },
    {
      id: "send-message",
      label: "Send Message to Parents",
      icon: <Send className="w-4 h-4" />,
    },
    {
      id: "fee-report",
      label: "Fee Report",
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: "expenses-income",
      label: "Expenses & Income",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <User className="w-4 h-4" />,
    },
  ];

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <Overview />;
      case "teachers":
        return <ManageTeachers />;
      case "students":
        return <ManageStudents />;
      case "notifications":
        return <PostNotifications />;
      case "calendar":
        return <AcademicCalendar />;
      case "results":
        return <PublishResults />;
      case "hall-tickets":
        return (
          <SectionErrorBoundary name="Hall Tickets">
            <PrincipalHallTickets />
          </SectionErrorBoundary>
        );
      case "leaves":
        return <LeaveApprovals />;
      case "teacher-attendance":
        return <TeacherAttendanceApprovals />;
      case "suggestions":
        return <StudentSuggestions />;
      case "timetable-approval":
        return <TimetableApproval user={currentUser} />;
      case "send-message":
        return (
          <SectionErrorBoundary name="Send Message to Parents">
            <SendMessageToParents />
          </SectionErrorBoundary>
        );
      case "fee-report":
        return (
          <SectionErrorBoundary name="Fee Report">
            <FeeReport />
          </SectionErrorBoundary>
        );
      case "expenses-income":
        return <ExpensesIncome />;
      case "profile":
        return (
          <MyProfile
            user={currentUser}
            onNameChange={(name) =>
              setCurrentUserState((u) => ({ ...u, name }))
            }
          />
        );
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout
      user={currentUser}
      navItems={navItems}
      activeSection={section}
      onSectionChange={setSection}
      onLogout={onLogout}
    >
      {renderSection()}
    </DashboardLayout>
  );
}
