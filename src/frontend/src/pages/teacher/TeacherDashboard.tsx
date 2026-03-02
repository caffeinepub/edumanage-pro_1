import { SimpleBarChart, SimpleLineChart } from "@/components/Charts";
import {
  Award,
  BarChart3,
  Bell,
  BookOpenCheck,
  ClipboardList,
  Clock,
  DashboardLayout,
  DollarSign,
  LayoutDashboard,
  Mail,
  Ticket,
  TrendingUp,
  Upload,
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
  type AttendanceRecord,
  type CurrentUser,
  type ExamQuestion,
  type ExamResult,
  type FeeRecord,
  type HomeworkPost,
  type LeaveApplication,
  type OnlineExam,
  type PortfolioEntry,
  type Student,
  type Timetable,
  calcAttendancePercent,
  formatDate,
  generateId,
  getAttendance,
  getExams,
  getFees,
  getGrade,
  getHomework,
  getLeaves,
  getNotifications,
  getPortfolio,
  getResults,
  getStudents,
  getStudentsByTeacher,
  getTeacherAttendance,
  getTeacherById,
  getTimetables,
  saveAttendance,
  saveExams,
  saveFees,
  saveHomework,
  saveLeaves,
  savePortfolio,
  saveResults,
  saveStudents,
  saveTimetables,
} from "@/store/data";
import {
  BookOpen,
  Calendar,
  Eye,
  FileText,
  Plus,
  Printer,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: CurrentUser;
  onLogout: () => void;
}

// ============================================================
// Teacher Overview
// ============================================================
function Overview({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const students = getStudentsByTeacher(teacherId);
  const attendance = getAttendance();
  const today = new Date().toISOString().split("T")[0];

  const todayAtt = students.map((s) =>
    attendance.find((a) => a.studentId === s.id && a.date === today),
  );
  const presentToday = todayAtt.filter(
    (a) => a?.status === "present" || a?.status === "late",
  ).length;
  const markedToday = todayAtt.filter(Boolean).length;

  const homework = getHomework().filter(
    (h) => h.teacherId === teacherId,
  ).length;
  const pendingResults = getResults().filter(
    (r) => r.teacherId === teacherId && r.status === "pending",
  ).length;

  const notifs = getNotifications().slice(0, 3);

  return (
    <div>
      <h2 className="section-title">Teacher Overview</h2>
      <p className="section-subtitle">Class {teacherClass} · Welcome back</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Students in Class",
            value: students.length,
            icon: "👥",
            color: "oklch(0.92 0.08 264)",
          },
          {
            label: "Today's Attendance",
            value:
              markedToday > 0 ? `${presentToday}/${markedToday}` : "Not Marked",
            icon: "✅",
            color: "oklch(0.92 0.1 150)",
          },
          {
            label: "Homework Posted",
            value: homework,
            icon: "📚",
            color: "oklch(0.95 0.1 70)",
          },
          {
            label: "Pending Results",
            value: pendingResults,
            icon: "📋",
            color: "oklch(0.95 0.1 25)",
          },
        ].map((c) => (
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
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">My Students</h3>
          <div className="space-y-2">
            {students.map((s) => {
              const recs = attendance.filter((a) => a.studentId === s.id);
              const pct = calcAttendancePercent(recs);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {s.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            pct >= 75
                              ? "oklch(0.55 0.15 150)"
                              : "oklch(0.577 0.245 27)",
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">
            School Notifications
          </h3>
          {notifs.map((n) => (
            <div
              key={n.id}
              className="border-l-4 pl-3 py-1 mb-3"
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
    </div>
  );
}

// ============================================================
// Manage Students (Teacher)
// ============================================================
function ManageStudents({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const [students, setStudents] = useState<Student[]>(
    getStudentsByTeacher(teacherId),
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    class: teacherClass,
    rollNo: "",
    parentName: "",
    parentPhone: "",
    id: "",
    password: "",
  });

  const handleAdd = () => {
    if (!form.name || !form.id || !form.password) {
      toast.error("Name, ID and Password are required");
      return;
    }
    if (getStudents().find((s) => s.id === form.id)) {
      toast.error("Student ID already exists");
      return;
    }
    const newStudent: Student = { ...form, role: "student", teacherId };
    const allStudents = [...getStudents(), newStudent];
    saveStudents(allStudents);
    setStudents(allStudents.filter((s) => s.teacherId === teacherId));
    setForm({
      name: "",
      class: teacherClass,
      rollNo: "",
      parentName: "",
      parentPhone: "",
      id: "",
      password: "",
    });
    setOpen(false);
    toast.success("Student added");
  };

  const handleDelete = (id: string) => {
    const allStudents = getStudents().filter((s) => s.id !== id);
    saveStudents(allStudents);
    setStudents(allStudents.filter((s) => s.teacherId === teacherId));
    toast.success("Student removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Manage Students</h2>
          <p className="section-subtitle">
            Class {teacherClass} · {students.length} students
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {(
                [
                  ["name", "Full Name"],
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
              <Button onClick={handleAdd} className="w-full">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Parent Phone</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.rollNo}</TableCell>
                <TableCell>
                  <Badge variant="outline">{s.class}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.parentName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.parentPhone}
                </TableCell>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
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
// Mark Attendance
// ============================================================
function MarkAttendance({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const students = getStudentsByTeacher(teacherId);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [statuses, setStatuses] = useState<
    Record<string, "present" | "absent" | "late">
  >({});
  const [viewDate, setViewDate] = useState("");

  const initStatuses = useCallback(() => {
    const att = getAttendance();
    const dayRecs = att.filter(
      (a) => a.date === date && students.some((s) => s.id === a.studentId),
    );
    const map: Record<string, "present" | "absent" | "late"> = {};
    for (const s of students) {
      const rec = dayRecs.find((a) => a.studentId === s.id);
      map[s.id] = rec?.status ?? "present";
    }
    setStatuses(map);
  }, [date, students]);

  // Initialize on date change
  useState(() => {
    initStatuses();
  });

  const handleSave = () => {
    const att = getAttendance().filter(
      (a) => !(a.date === date && students.some((s) => s.id === a.studentId)),
    );
    const newRecs: AttendanceRecord[] = students.map((s) => ({
      id: generateId("att"),
      studentId: s.id,
      date,
      status: statuses[s.id] ?? "present",
      markedBy: teacherId,
    }));
    saveAttendance([...att, ...newRecs]);
    toast.success(`Attendance saved for ${formatDate(date)}`);
  };

  const viewRecords = viewDate
    ? getAttendance().filter(
        (a) =>
          a.date === viewDate && students.some((s) => s.id === a.studentId),
      )
    : [];

  return (
    <div>
      <h2 className="section-title">Mark Attendance</h2>
      <p className="section-subtitle">Class {teacherClass}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mark attendance */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Mark Attendance</h3>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
              className="w-auto"
            />
          </div>

          <div className="space-y-2 mb-4">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm font-medium text-foreground">
                  {s.name}
                </span>
                <div className="flex gap-1">
                  {(["present", "absent", "late"] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() =>
                        setStatuses((prev) => ({ ...prev, [s.id]: st }))
                      }
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        statuses[s.id] === st
                          ? st === "present"
                            ? "bg-success text-white"
                            : st === "absent"
                              ? "bg-destructive text-white"
                              : "bg-warning text-white"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} className="gap-1.5">
            <UserCheck className="w-4 h-4" /> Save Attendance
          </Button>
        </div>

        {/* View past attendance */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              View Past Attendance
            </h3>
            <Input
              type="date"
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
              className="w-auto"
            />
          </div>
          {viewDate ? (
            viewRecords.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No records for this date
              </p>
            ) : (
              <div className="space-y-2">
                {students.map((s) => {
                  const rec = viewRecords.find((a) => a.studentId === s.id);
                  const status = rec?.status ?? "—";
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {s.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          status === "present"
                            ? "badge-success"
                            : status === "absent"
                              ? "badge-destructive"
                              : status === "late"
                                ? "badge-warning"
                                : "bg-muted"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <p className="text-muted-foreground text-sm">
              Select a date to view records
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Fee Updates
// ============================================================
function FeeUpdates({ teacherId }: { teacherId: string }) {
  const students = getStudentsByTeacher(teacherId);
  const [fees, setFees] = useState<FeeRecord[]>(getFees());
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [feeForm, setFeeForm] = useState({
    amount: "",
    date: "",
    method: "",
    status: "paid" as FeeRecord["status"],
    description: "",
  });

  const getLatestFee = (studentId: string) =>
    fees
      .filter((f) => f.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

  const handleSaveFee = () => {
    if (!editStudent || !feeForm.amount) return;
    const newFee: FeeRecord = {
      id: generateId("fee"),
      studentId: editStudent.id,
      amount: Number(feeForm.amount),
      date: feeForm.date || new Date().toISOString().split("T")[0],
      status: feeForm.status,
      method: feeForm.method,
      description: feeForm.description,
    };
    const updated = [...fees, newFee];
    saveFees(updated);
    setFees(updated);
    setEditStudent(null);
    toast.success("Fee record updated");
  };

  const statusBadge = (status?: string) => {
    if (status === "paid")
      return (
        <span className="badge-success inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
          Paid
        </span>
      );
    if (status === "partial")
      return (
        <span className="badge-warning inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
          Partial
        </span>
      );
    return (
      <span className="badge-destructive inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
        Pending
      </span>
    );
  };

  return (
    <div>
      <h2 className="section-title">Fee Updates</h2>
      <p className="section-subtitle">Update student fee payment status</p>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Latest Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => {
              const latest = getLatestFee(s.id);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.rollNo}</TableCell>
                  <TableCell>{statusBadge(latest?.status)}</TableCell>
                  <TableCell>{latest ? `₹${latest.amount}` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {latest ? formatDate(latest.date) : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditStudent(s)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editStudent}
        onOpenChange={(o) => !o && setEditStudent(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Fee – {editStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={feeForm.status}
                onValueChange={(v) =>
                  setFeeForm((f) => ({
                    ...f,
                    status: v as FeeRecord["status"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={feeForm.amount}
                onChange={(e) =>
                  setFeeForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="15000"
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={feeForm.date}
                onChange={(e) =>
                  setFeeForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Input
                value={feeForm.method}
                onChange={(e) =>
                  setFeeForm((f) => ({ ...f, method: e.target.value }))
                }
                placeholder="Cash / Online / Cheque"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={feeForm.description}
                onChange={(e) =>
                  setFeeForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Term fee, lab fee..."
              />
            </div>
            <Button className="w-full" onClick={handleSaveFee}>
              Save Fee Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Upload Marks
// ============================================================
function UploadMarks({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const students = getStudentsByTeacher(teacherId);
  const [examName, setExamName] = useState("");
  const [subjects, setSubjects] = useState([
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
    "Hindi",
  ]);
  const [newSubject, setNewSubject] = useState("");
  const [marks, setMarks] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [results] = useState<ExamResult[]>(
    getResults().filter((r) => r.teacherId === teacherId),
  );

  const handleMark = (studentId: string, subject: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [subject]: value },
    }));
  };

  const handleSubmit = () => {
    if (!examName) {
      toast.error("Enter exam name");
      return;
    }
    const now = new Date().toISOString().split("T")[0];
    const allResults = getResults();
    const newResults: ExamResult[] = students.map((s) => ({
      id: generateId("res"),
      examName,
      studentId: s.id,
      teacherId,
      class: teacherClass,
      subjects: subjects.map((sub) => ({
        subject: sub,
        marks: Number(marks[s.id]?.[sub] ?? 0),
        maxMarks: 100,
      })),
      submittedAt: now,
      status: "pending" as const,
    }));
    saveResults([...allResults, ...newResults]);
    toast.success("Marks submitted for principal approval");
    setMarks({});
    setExamName("");
  };

  return (
    <div>
      <h2 className="section-title">Upload Marks</h2>
      <p className="section-subtitle">
        Enter exam marks and submit for approval
      </p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="space-y-1">
            <Label>Exam Name</Label>
            <Input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g., Mid Term 2026"
              className="w-48"
            />
          </div>
          <div className="space-y-1">
            <Label>Add Subject</Label>
            <div className="flex gap-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject name"
                className="w-40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newSubject && !subjects.includes(newSubject)) {
                    setSubjects((s) => [...s, newSubject]);
                    setNewSubject("");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  Student
                </th>
                {subjects.map((s) => (
                  <th
                    key={s}
                    className="text-left py-2 px-3 text-muted-foreground font-medium"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2 px-3 font-medium text-foreground">
                    {s.name}
                  </td>
                  {subjects.map((sub) => (
                    <td key={sub} className="py-2 px-3">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={marks[s.id]?.[sub] ?? ""}
                        onChange={(e) => handleMark(s.id, sub, e.target.value)}
                        className="w-20 h-8 text-center"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button className="mt-4 gap-1.5" onClick={handleSubmit}>
          <FileText className="w-4 h-4" /> Submit for Approval
        </Button>
      </div>

      {/* Previously submitted */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">
          Submitted Results
        </h3>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    No results submitted
                  </TableCell>
                </TableRow>
              ) : (
                results.map((r) => {
                  const student = getStudentsByTeacher(teacherId).find(
                    (s) => s.id === r.studentId,
                  );
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {student?.name ?? r.studentId}
                      </TableCell>
                      <TableCell>{r.examName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(r.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.status === "approved" ? "badge-success" : r.status === "rejected" ? "badge-destructive" : "badge-warning"}`}
                        >
                          {r.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Student Progress
// ============================================================
function StudentProgress({ teacherId }: { teacherId: string }) {
  const students = getStudentsByTeacher(teacherId);
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");

  const results = getResults().filter(
    (r) => r.studentId === selectedId && r.status === "approved",
  );
  const portfolio = getPortfolio().filter((p) => p.studentId === selectedId);

  const latestResult = results[results.length - 1];
  const barData = latestResult
    ? latestResult.subjects.map((s) => ({
        label: s.subject,
        value: s.marks,
        max: s.maxMarks,
      }))
    : [];

  const lineData = results.map((r) => ({
    label: r.examName.substring(0, 8),
    value: Math.round(
      r.subjects.reduce((a, s) => a + s.marks, 0) / r.subjects.length,
    ),
  }));

  return (
    <div>
      <h2 className="section-title">Student Progress</h2>
      <p className="section-subtitle">
        View academic performance and achievements
      </p>

      <div className="mb-4">
        <Label>Select Student</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-56 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <SimpleBarChart
            data={barData}
            height={180}
            title="Latest Marks by Subject"
          />
          {barData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No published results yet
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <SimpleLineChart
            data={lineData}
            height={180}
            title="Exam Scores Over Time"
          />
          {lineData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No exam history
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-3">
            Portfolio & Achievements
          </h3>
          {portfolio.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No portfolio entries yet
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {portfolio.map((p) => (
                <div key={p.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.type === "academic" ? "badge-info" : p.type === "sports" ? "badge-success" : p.type === "cultural" ? "badge-warning" : "bg-muted"}`}
                    >
                      {p.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(p.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Update Portfolio
// ============================================================
function UpdatePortfolio({ teacherId }: { teacherId: string }) {
  const students = getStudentsByTeacher(teacherId);
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>(getPortfolio());
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "academic" as PortfolioEntry["type"],
  });

  const studentPortfolio = portfolio.filter((p) => p.studentId === selectedId);

  const handleAdd = () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    const entry: PortfolioEntry = {
      id: generateId("port"),
      studentId: selectedId,
      ...form,
      addedBy: teacherId,
    };
    const updated = [...portfolio, entry];
    savePortfolio(updated);
    setPortfolio(updated);
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "academic",
    });
    toast.success("Portfolio entry added");
  };

  const handleDelete = (id: string) => {
    const updated = portfolio.filter((p) => p.id !== id);
    savePortfolio(updated);
    setPortfolio(updated);
    toast.success("Entry removed");
  };

  return (
    <div>
      <h2 className="section-title">Update Portfolio</h2>
      <p className="section-subtitle">
        Add achievements and skills for students
      </p>

      <div className="mb-4">
        <Label>Select Student</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-56 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Add Entry</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Achievement title"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as PortfolioEntry["type"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe the achievement..."
              />
            </div>
            <Button className="w-full gap-1.5" onClick={handleAdd}>
              <Award className="w-4 h-4" /> Add to Portfolio
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Existing Entries ({studentPortfolio.length})
          </h3>
          <div className="space-y-3">
            {studentPortfolio.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                No entries yet
              </div>
            ) : (
              studentPortfolio.map((p) => (
                <div
                  key={p.id}
                  className="bg-card border border-border rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1 ${p.type === "academic" ? "badge-info" : p.type === "sports" ? "badge-success" : p.type === "cultural" ? "badge-warning" : "bg-muted"}`}
                      >
                        {p.type}
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(p.date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Upload Timetable
// ============================================================
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const PERIODS = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
  "Period 7",
  "Period 8",
];

function UploadTimetable({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const existing = getTimetables().find((t) => t.class === teacherClass);
  const [schedule, setSchedule] = useState<Timetable["schedule"]>(
    existing?.schedule ?? {},
  );

  const handleChange = (
    day: string,
    period: string,
    field: "subject" | "teacher",
    value: string,
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] ?? {}),
        [period]: {
          ...(prev[day]?.[period] ?? { subject: "", teacher: "" }),
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    const tt = getTimetables();
    const idx = tt.findIndex((t) => t.class === teacherClass);
    const newTT: Timetable = {
      id: existing?.id ?? generateId("tt"),
      class: teacherClass,
      schedule,
      updatedAt: new Date().toISOString().split("T")[0],
      updatedBy: teacherId,
    };
    const updated =
      idx >= 0 ? tt.map((t, i) => (i === idx ? newTT : t)) : [...tt, newTT];
    saveTimetables(updated);
    toast.success("Timetable saved");
  };

  return (
    <div>
      <h2 className="section-title">Upload Timetable</h2>
      <p className="section-subtitle">
        Class {teacherClass} · Period-wise schedule
      </p>

      <div className="overflow-x-auto bg-card border border-border rounded-lg p-4 mb-4">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-muted-foreground font-semibold w-24">
                Period
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className="text-left py-2 px-2 text-muted-foreground font-semibold"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period} className="border-t border-border">
                <td className="py-2 px-2 font-medium text-foreground text-xs">
                  {period}
                </td>
                {DAYS.map((day) => (
                  <td key={day} className="py-1.5 px-1">
                    <Input
                      placeholder="Subject"
                      value={schedule[day]?.[period]?.subject ?? ""}
                      onChange={(e) =>
                        handleChange(day, period, "subject", e.target.value)
                      }
                      className="h-7 text-xs mb-1"
                    />
                    <Input
                      placeholder="Teacher"
                      value={schedule[day]?.[period]?.teacher ?? ""}
                      onChange={(e) =>
                        handleChange(day, period, "teacher", e.target.value)
                      }
                      className="h-7 text-xs"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button className="gap-1.5" onClick={handleSave}>
        <Upload className="w-4 h-4" /> Save Timetable
      </Button>
    </div>
  );
}

// ============================================================
// Homework
// ============================================================
function Homework({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const [homework, setHomework] = useState<HomeworkPost[]>(getHomework());
  const [form, setForm] = useState({
    subject: "",
    title: "",
    description: "",
    dueDate: "",
    class: teacherClass,
  });

  const myHW = homework.filter((h) => h.teacherId === teacherId);

  const handlePost = () => {
    if (!form.subject || !form.title || !form.dueDate) {
      toast.error("Subject, title and due date required");
      return;
    }
    const hw: HomeworkPost = {
      id: generateId("hw"),
      ...form,
      teacherId,
      postedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [hw, ...homework];
    saveHomework(updated);
    setHomework(updated);
    setForm({
      subject: "",
      title: "",
      description: "",
      dueDate: "",
      class: teacherClass,
    });
    toast.success("Homework posted");
  };

  const handleDelete = (id: string) => {
    const updated = homework.filter((h) => h.id !== id);
    saveHomework(updated);
    setHomework(updated);
    toast.success("Homework removed");
  };

  return (
    <div>
      <h2 className="section-title">Homework Notifications</h2>
      <p className="section-subtitle">Post assignments for your class</p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-2xl">
        <h3 className="font-semibold text-foreground mb-4">New Assignment</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              placeholder="e.g., Mathematics"
            />
          </div>
          <div className="space-y-1">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Assignment title"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Detailed instructions..."
            />
          </div>
        </div>
        <Button className="mt-3 gap-1.5" onClick={handlePost}>
          <BookOpen className="w-4 h-4" /> Post Homework
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {myHW.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-6"
                >
                  No homework posted
                </TableCell>
              </TableRow>
            ) : (
              myHW.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <Badge variant="outline">{h.subject}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{h.title}</TableCell>
                  <TableCell>{h.class}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(h.dueDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(h.postedAt)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(h.id)}
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
// Online Exams (Teacher Create)
// ============================================================
function OnlineExamsTeacher({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const [exams, setExams] = useState<OnlineExam[]>(
    getExams().filter((e) => e.teacherId === teacherId),
  );
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    duration: "30",
    class: teacherClass,
  });
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [newQ, setNewQ] = useState({
    type: "mcq" as "mcq" | "short",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const handleAddQ = () => {
    if (!newQ.question) {
      toast.error("Question text required");
      return;
    }
    const q: ExamQuestion = {
      id: generateId("q"),
      type: newQ.type,
      question: newQ.question,
      ...(newQ.type === "mcq"
        ? {
            options: newQ.options.filter(Boolean),
            correctAnswer: newQ.correctAnswer,
          }
        : {}),
    };
    setQuestions((prev) => [...prev, q]);
    setNewQ({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const handleCreate = () => {
    if (!form.title || questions.length === 0) {
      toast.error("Title and at least one question required");
      return;
    }
    const exam: OnlineExam = {
      id: generateId("exam"),
      title: form.title,
      subject: form.subject,
      duration: Number(form.duration),
      class: form.class,
      teacherId,
      createdAt: new Date().toISOString().split("T")[0],
      questions,
      status: "active",
    };
    const allExams = getExams();
    saveExams([...allExams, exam]);
    setExams([...exams, exam]);
    setCreating(false);
    setForm({ title: "", subject: "", duration: "30", class: teacherClass });
    setQuestions([]);
    toast.success("Exam created successfully");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Online Exams</h2>
          <p className="section-subtitle">
            Create and manage exams for your class
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setCreating(!creating)}
        >
          <Plus className="w-4 h-4" /> {creating ? "Cancel" : "Create Exam"}
        </Button>
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-4">New Exam</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Exam title"
              />
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="Subject"
              />
            </div>
            <div className="space-y-1">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Class</Label>
              <Input
                value={form.class}
                onChange={(e) =>
                  setForm((f) => ({ ...f, class: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Questions */}
          <div className="mb-4">
            <h4 className="font-medium text-foreground mb-3">
              Questions ({questions.length})
            </h4>
            <div className="space-y-2 mb-4">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                >
                  <span className="text-xs font-bold text-muted-foreground mt-0.5">
                    Q{i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {q.question}
                    </p>
                    {q.type === "mcq" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        MCQ · Correct: {q.correctAnswer}
                      </p>
                    )}
                    {q.type === "short" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Short Answer
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((qs) => qs.filter((_, j) => j !== i))
                    }
                    className="text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border border-dashed border-border rounded-lg p-4">
              <h5 className="text-sm font-medium text-foreground mb-3">
                Add Question
              </h5>
              <div className="space-y-2">
                <Select
                  value={newQ.type}
                  onValueChange={(v) =>
                    setNewQ((q) => ({ ...q, type: v as "mcq" | "short" }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="short">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  rows={2}
                  placeholder="Question text"
                  value={newQ.question}
                  onChange={(e) =>
                    setNewQ((q) => ({ ...q, question: e.target.value }))
                  }
                />
                {newQ.type === "mcq" && (
                  <div className="grid grid-cols-2 gap-2">
                    {["A", "B", "C", "D"].map((letter, i) => (
                      <Input
                        key={`option-${letter}`}
                        placeholder={`Option ${letter}`}
                        value={newQ.options[i] ?? ""}
                        onChange={(e) => {
                          const options = [...newQ.options];
                          options[i] = e.target.value;
                          setNewQ((q) => ({ ...q, options }));
                        }}
                      />
                    ))}
                    <Input
                      placeholder="Correct answer"
                      value={newQ.correctAnswer}
                      onChange={(e) =>
                        setNewQ((q) => ({
                          ...q,
                          correctAnswer: e.target.value,
                        }))
                      }
                      className="col-span-2"
                    />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddQ}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleCreate} className="gap-1.5">
            <BookOpenCheck className="w-4 h-4" /> Create Exam
          </Button>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  No exams created
                </TableCell>
              </TableRow>
            ) : (
              exams.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell>{e.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.class}</Badge>
                  </TableCell>
                  <TableCell>{e.duration} min</TableCell>
                  <TableCell>{e.questions.length}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${e.status === "active" ? "badge-success" : "bg-muted"}`}
                    >
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(e.createdAt)}
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
// Hall Tickets
// ============================================================
function HallTickets({
  teacherId,
  teacherClass,
}: { teacherId: string; teacherClass: string }) {
  const students = getStudentsByTeacher(teacherId);
  const teacher = getTeacherById(teacherId);
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");
  const student = students.find((s) => s.id === selectedId);

  const exams = getExams().filter(
    (e) => e.class === teacherClass && e.status === "active",
  );
  const [selectedExam, setSelectedExam] = useState(exams[0]?.id ?? "");
  const exam = exams.find((e) => e.id === selectedExam);

  return (
    <div>
      <h2 className="section-title">Hall Tickets</h2>
      <p className="section-subtitle">
        Generate and print hall tickets for students
      </p>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="space-y-1">
          <Label>Select Student</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Select Exam</Label>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.title}
                </SelectItem>
              ))}
              {exams.length === 0 && (
                <SelectItem value="none" disabled>
                  No active exams
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {student && (
        <>
          {/* Hall ticket card */}
          <div
            id="hall-ticket"
            className="max-w-lg mx-auto border-2 border-foreground rounded-lg overflow-hidden print-target"
          >
            <div
              className="p-4 text-center"
              style={{
                backgroundColor: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              <h2 className="text-xl font-bold">Delhi Public School</h2>
              <p className="text-sm opacity-80">
                Established 2001 · Excellence in Education
              </p>
            </div>
            <div
              className="p-4"
              style={{
                backgroundColor: "oklch(0.94 0.04 264)",
                textAlign: "center",
              }}
            >
              <h3 className="text-lg font-bold text-foreground">HALL TICKET</h3>
              <p className="text-sm text-muted-foreground">
                {exam?.title ?? "Annual Examination 2026"}
              </p>
            </div>
            <div className="p-6">
              <div className="flex gap-6">
                <div className="w-24 h-28 bg-muted border-2 border-border rounded flex items-center justify-center text-3xl font-bold text-muted-foreground shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  {[
                    ["Student Name", student.name],
                    ["Roll Number", student.rollNo],
                    ["Class / Section", student.class],
                    ["Student ID", student.id],
                    ["Exam", exam?.title ?? "Annual Examination 2026"],
                    [
                      "Date",
                      exam ? formatDate(exam.createdAt) : "March 20, 2026",
                    ],
                    ["Duration", exam ? `${exam.duration} minutes` : "3 hours"],
                    ["Exam Center", "School Main Hall"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="font-semibold text-foreground w-32 shrink-0">
                        {k}:
                      </span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-end text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Invigilator&apos;s Signature
                  </p>
                  <div className="w-32 border-b border-foreground mt-4" />
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground mb-1">
                    Class Teacher
                  </p>
                  <p>{teacher?.name ?? "Teacher"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 no-print">
            <Button className="gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Hall Ticket
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// My Attendance (Teacher)
// ============================================================
function MyAttendance({ teacherId }: { teacherId: string }) {
  const records = getTeacherAttendance().filter(
    (r) => r.teacherId === teacherId,
  );
  const present = records.filter((r) => r.status === "present").length;
  const pct =
    records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  return (
    <div>
      <h2 className="section-title">My Attendance</h2>
      <p className="section-subtitle">Your attendance records</p>

      <div className="flex gap-4 mb-6">
        {[
          { label: "Total Days", value: records.length },
          { label: "Present", value: present },
          {
            label: "Absent",
            value: records.filter((r) => r.status === "absent").length,
          },
          { label: "Attendance %", value: `${pct}%` },
        ].map((c) => (
          <div key={c.label} className="stat-card flex-1 text-center">
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {formatDate(r.date)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.status === "present" ? "badge-success" : r.status === "absent" ? "badge-destructive" : "badge-warning"}`}
                    >
                      {r.status}
                    </span>
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
// Leave Application (Teacher)
// ============================================================
function TeacherLeaveApplication({ user }: { user: CurrentUser }) {
  const [leaves, setLeaves] = useState<LeaveApplication[]>(
    getLeaves().filter((l) => l.applicantId === user.id),
  );
  const [form, setForm] = useState({
    type: "sick" as LeaveApplication["type"],
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleSubmit = () => {
    if (!form.fromDate || !form.toDate || !form.reason) {
      toast.error("All fields are required");
      return;
    }
    const leave: LeaveApplication = {
      id: generateId("leave"),
      applicantId: user.id,
      applicantName: user.name,
      applicantRole: "teacher",
      ...form,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    const allLeaves = [...getLeaves(), leave];
    saveLeaves(allLeaves);
    setLeaves(allLeaves.filter((l) => l.applicantId === user.id));
    setForm({ type: "sick", fromDate: "", toDate: "", reason: "" });
    toast.success("Leave application submitted");
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
      <h2 className="section-title">Leave Application</h2>
      <p className="section-subtitle">
        Apply for leave — submitted to principal
      </p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-md">
        <h3 className="font-semibold text-foreground mb-4">New Application</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Leave Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, type: v as LeaveApplication["type"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>From Date</Label>
              <Input
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fromDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>To Date</Label>
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, toDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Reason</Label>
            <Textarea
              rows={3}
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              placeholder="Reason for leave..."
            />
          </div>
          <Button className="w-full gap-1.5" onClick={handleSubmit}>
            <Mail className="w-4 h-4" /> Submit Application
          </Button>
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-3">My Applications</h3>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-6"
                >
                  No applications
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((l) => (
                <TableRow key={l.id}>
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
// Notifications (Teacher view)
// ============================================================
function TeacherNotifications({ teacherClass }: { teacherClass: string }) {
  const notifications = getNotifications().sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const homework = getHomework().filter((h) => h.class === teacherClass);

  return (
    <div>
      <h2 className="section-title">Notifications</h2>
      <p className="section-subtitle">
        School announcements and homework alerts
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            School Announcements ({notifications.length})
          </h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{n.title}</h4>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {formatDate(n.date)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Homework – Class {teacherClass}
          </h3>
          <div className="space-y-3">
            {homework.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                No homework posted
              </div>
            ) : (
              homework.map((h) => (
                <div
                  key={h.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{h.subject}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Due: {formatDate(h.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {h.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {h.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Teacher Dashboard Root
// ============================================================
export default function TeacherDashboard({ user, onLogout }: Props) {
  const [section, setSection] = useState("overview");
  const teacher = getTeacherById(user.id);
  const teacherClass = teacher?.class ?? user.class ?? "10A";

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "students",
      label: "Manage Students",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "attendance",
      label: "Mark Attendance",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: "fees",
      label: "Fee Updates",
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: "marks",
      label: "Upload Marks",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "progress",
      label: "Student Progress",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "portfolio",
      label: "Update Portfolio",
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: "timetable",
      label: "Upload Timetable",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "homework",
      label: "Homework",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "exams",
      label: "Online Exams",
      icon: <BookOpenCheck className="w-4 h-4" />,
    },
    {
      id: "halltickets",
      label: "Hall Tickets",
      icon: <Ticket className="w-4 h-4" />,
    },
    {
      id: "myattendance",
      label: "My Attendance",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "leave",
      label: "Leave Application",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <Overview teacherId={user.id} teacherClass={teacherClass} />;
      case "students":
        return (
          <ManageStudents teacherId={user.id} teacherClass={teacherClass} />
        );
      case "attendance":
        return (
          <MarkAttendance teacherId={user.id} teacherClass={teacherClass} />
        );
      case "fees":
        return <FeeUpdates teacherId={user.id} />;
      case "marks":
        return <UploadMarks teacherId={user.id} teacherClass={teacherClass} />;
      case "progress":
        return <StudentProgress teacherId={user.id} />;
      case "portfolio":
        return <UpdatePortfolio teacherId={user.id} />;
      case "timetable":
        return (
          <UploadTimetable teacherId={user.id} teacherClass={teacherClass} />
        );
      case "homework":
        return <Homework teacherId={user.id} teacherClass={teacherClass} />;
      case "exams":
        return (
          <OnlineExamsTeacher teacherId={user.id} teacherClass={teacherClass} />
        );
      case "halltickets":
        return <HallTickets teacherId={user.id} teacherClass={teacherClass} />;
      case "myattendance":
        return <MyAttendance teacherId={user.id} />;
      case "leave":
        return <TeacherLeaveApplication user={user} />;
      case "notifications":
        return <TeacherNotifications teacherClass={teacherClass} />;
      default:
        return <Overview teacherId={user.id} teacherClass={teacherClass} />;
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
