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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  type CalendarEvent,
  type CurrentUser,
  type ExamResult,
  type LeaveApplication,
  type Notification,
  type Student,
  type Teacher,
  calcAttendancePercent,
  formatDate,
  generateId,
  getAttendance,
  getCalendarEvents,
  getLeaves,
  getNotifications,
  getResults,
  getStudents,
  getTeachers,
  saveCalendarEvents,
  saveLeaves,
  saveNotifications,
  saveResults,
  saveTeachers,
} from "@/store/data";
import { AlertTriangle, Check, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  user: CurrentUser;
  onLogout: () => void;
}

// ============================================================
// Overview
// ============================================================
function Overview() {
  const teachers = getTeachers();
  const students = getStudents();
  const attendance = getAttendance();
  const results = getResults();
  const leaves = getLeaves();

  // Avg attendance across all students
  const avgAtt =
    students.length === 0
      ? 0
      : Math.round(
          students.reduce((acc, s) => {
            const recs = attendance.filter((a) => a.studentId === s.id);
            return acc + calcAttendancePercent(recs);
          }, 0) / students.length,
        );

  const pendingResults = results.filter((r) => r.status === "pending").length;
  const pendingLeaves = leaves.filter(
    (l) => l.status === "pending" && l.applicantRole === "teacher",
  ).length;

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

  const notifications = getNotifications().slice(0, 3);
  const calEvents = getCalendarEvents()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Class breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Class Summary</h3>
          <div className="space-y-2">
            {teachers.map((t) => {
              const cls = students.filter((s) => s.class === t.class);
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    email: "",
    phone: "",
    class: "",
    id: "",
    password: "",
  });

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.class.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!form.name || !form.id || !form.password) {
      toast.error("Name, ID and Password are required");
      return;
    }
    if (teachers.find((t) => t.id === form.id)) {
      toast.error("Teacher ID already exists");
      return;
    }
    const newTeacher: Teacher = { ...form, role: "teacher" };
    const updated = [...teachers, newTeacher];
    saveTeachers(updated);
    setTeachers(updated);
    setForm({
      name: "",
      subject: "",
      email: "",
      phone: "",
      class: "",
      id: "",
      password: "",
    });
    setOpen(false);
    toast.success("Teacher added successfully");
  };

  const handleDelete = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    saveTeachers(updated);
    setTeachers(updated);
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
// Manage Students
// ============================================================
function ManageStudents() {
  const [students] = useState<Student[]>(getStudents());
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.includes(search),
  );

  const teachers = getTeachers();
  const getTeacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name ?? id;

  return (
    <div>
      <div className="mb-6">
        <h2 className="section-title">Manage Students</h2>
        <p className="section-subtitle">
          {students.length} students across all classes
        </p>
      </div>
      <div className="mb-4">
        <Input
          placeholder="Search by name, class or roll no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Parent Phone</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  const handlePost = () => {
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
    };
    const updated = [newN, ...notifications];
    saveNotifications(updated);
    setNotifications(updated);
    setForm({ title: "", message: "" });
    toast.success("Notification posted");
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    setNotifications(updated);
    toast.success("Notification deleted");
  };

  return (
    <div>
      <h2 className="section-title">Post Notifications</h2>
      <p className="section-subtitle">Create school-wide announcements</p>

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
          <Button onClick={handlePost} className="gap-1.5">
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

  const handleAdd = () => {
    if (!form.title || !form.date) {
      toast.error("Title and date are required");
      return;
    }
    const newE: CalendarEvent = {
      id: generateId("cal"),
      ...form,
      createdBy: "principal001",
    };
    const updated = [...events, newE].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    saveCalendarEvents(updated);
    setEvents(updated);
    setForm({ title: "", type: "event", date: "", description: "" });
    toast.success("Event added to calendar");
  };

  const handleDelete = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveCalendarEvents(updated);
    setEvents(updated);
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
  const [results, setResults] = useState<ExamResult[]>(getResults());
  const students = getStudents();

  const pending = results.filter((r) => r.status === "pending");
  const published = results.filter((r) => r.status === "approved");

  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? id;

  const handleApprove = (id: string) => {
    const updated = results.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "approved" as const,
            approvedAt: new Date().toISOString().split("T")[0],
          }
        : r,
    );
    saveResults(updated);
    setResults(updated);
    toast.success("Result approved and published");
  };

  const handleReject = (id: string) => {
    const updated = results.map((r) =>
      r.id === id ? { ...r, status: "rejected" as const } : r,
    );
    saveResults(updated);
    setResults(updated);
    toast.success("Result rejected");
  };

  const calcTotal = (r: ExamResult) =>
    r.subjects.reduce((a, s) => a + s.marks, 0);
  const calcMax = (r: ExamResult) =>
    r.subjects.reduce((a, s) => a + s.maxMarks, 0);

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
        <h3 className="font-semibold text-foreground mb-4">
          Published Results
        </h3>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {published.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-6"
                  >
                    No published results
                  </TableCell>
                </TableRow>
              ) : (
                published.map((r) => (
                  <TableRow key={r.id}>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

  const handleApprove = (id: string) => {
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
    saveLeaves(updated);
    setLeaves(updated);
    toast.success("Leave approved");
  };

  const handleReject = (id: string) => {
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
    saveLeaves(updated);
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
// Principal Dashboard
// ============================================================
export default function PrincipalDashboard({ user, onLogout }: Props) {
  const [section, setSection] = useState("overview");

  const pendingResults = getResults().filter(
    (r) => r.status === "pending",
  ).length;
  const pendingLeaves = getLeaves().filter(
    (l) => l.status === "pending" && l.applicantRole === "teacher",
  ).length;

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
      id: "leaves",
      label: "Leave Approvals",
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingLeaves,
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
      case "leaves":
        return <LeaveApprovals />;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      navItems={navItems}
      activeSection={section}
      onSectionChange={setSection}
      onLogout={onLogout}
    >
      {renderSection()}
    </DashboardLayout>
  );
}
