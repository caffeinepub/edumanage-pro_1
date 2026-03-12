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
import { TablePagination } from "@/components/TablePagination";
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
import { usePagination } from "@/hooks/usePagination";
import {
  type AttendanceRecord,
  type CurrentUser,
  type ExamQuestion,
  type ExamResult,
  type FeeRecord,
  type FinancialRecord,
  type HomeworkPost,
  type LeaveApplication,
  type OnlineExam,
  type PortfolioEntry,
  type Student,
  type TeacherAttendance,
  type Timetable,
  addTeacherAttendanceToBackend,
  calcAttendancePercent,
  deleteHomeworkFromBackend,
  deletePortfolioEntryFromBackend,
  deleteStudentFromBackend,
  formatDate,
  generateId,
  getAttendance,
  getExams,
  getFees,
  getFinancialRecords,
  getGrade,
  getHomework,
  getLeaves,
  getNotifications,
  getPortfolio,
  getPrincipalProfile,
  getResults,
  getStudents,
  getStudentsByTeacher,
  getTeacherAttendance,
  getTeacherById,
  getTimetables,
  saveAttendance,
  saveAttendanceBatchToBackend,
  saveExamToBackend,
  saveExams,
  saveFeeToBackend,
  saveFees,
  saveFinancialRecord,
  saveHomework,
  saveHomeworkToBackend,
  saveLeaveToBackend,
  saveLeaves,
  savePortfolio,
  savePortfolioEntryToBackend,
  saveResults,
  saveResultsBatchToBackend,
  saveStudentToBackend,
  saveStudents,
  saveTeacherAttendance,
  saveTimetableToBackend,
  saveTimetables,
  syncStudentsFromBackend,
  updateTeacherAttendanceInBackend,
} from "@/store/data";
import {
  BookOpen,
  Calendar,
  Eye,
  FileText,
  Plus,
  Printer,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const students = useMemo(() => getStudentsByTeacher(teacherId), [teacherId]);
  const attendance = useMemo(() => getAttendance(), []);
  const today = new Date().toISOString().split("T")[0];

  // Build attendance index by studentId + date for O(1) lookups
  const attendanceIndex = useMemo(() => {
    const index: Record<
      string,
      Record<string, (typeof attendance)[number]>
    > = {};
    for (const a of attendance) {
      if (!index[a.studentId]) index[a.studentId] = {};
      index[a.studentId][a.date] = a;
    }
    return index;
  }, [attendance]);

  const todayAtt = useMemo(
    () => students.map((s) => attendanceIndex[s.id]?.[today]),
    [students, attendanceIndex, today],
  );
  const presentToday = useMemo(
    () =>
      todayAtt.filter((a) => a?.status === "present" || a?.status === "late")
        .length,
    [todayAtt],
  );
  const markedToday = useMemo(
    () => todayAtt.filter(Boolean).length,
    [todayAtt],
  );

  const homework = useMemo(
    () => getHomework().filter((h) => h.teacherId === teacherId).length,
    [teacherId],
  );
  const pendingResults = useMemo(
    () =>
      getResults().filter(
        (r) => r.teacherId === teacherId && r.status === "pending",
      ).length,
    [teacherId],
  );

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
              const recs = Object.values(attendanceIndex[s.id] ?? {});
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
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");

  const handleAdd = async () => {
    if (!form.name || !form.id || !form.password) {
      toast.error("Name, ID and Password are required");
      return;
    }
    if (getStudents().find((s) => s.id === form.id)) {
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
      role: "student",
      teacherId,
      photo: form.photo || undefined,
    };
    try {
      await saveStudentToBackend(newStudent);
      const all = await syncStudentsFromBackend();
      setStudents(all.filter((s) => s.teacherId === teacherId));
    } catch {
      const allStudents = [...getStudents(), newStudent];
      saveStudents(allStudents);
      setStudents(allStudents.filter((s) => s.teacherId === teacherId));
    }
    setForm({
      name: "",
      class: teacherClass,
      rollNo: "",
      parentName: "",
      parentPhone: "",
      id: "",
      password: "",
      photo: "",
    });
    setPhotoPreview("");
    setOpen(false);
    toast.success("Student added");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudentFromBackend(id);
      const all = await syncStudentsFromBackend();
      setStudents(all.filter((s) => s.teacherId === teacherId));
    } catch {
      const allStudents = getStudents().filter((s) => s.id !== id);
      saveStudents(allStudents);
      setStudents(allStudents.filter((s) => s.teacherId === teacherId));
    }
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
              {/* Photo upload */}
              <div className="space-y-1">
                <Label>Student Photo (optional)</Label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Student preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer w-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          setPhotoPreview(dataUrl);
                          setForm((f) => ({ ...f, photo: dataUrl }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF (max 2MB)
                    </p>
                  </div>
                </div>
              </div>
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
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {s.photo ? (
                        <img
                          src={s.photo}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-primary">
                          {s.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {s.name}
                  </div>
                </TableCell>
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
  const students = useMemo(() => getStudentsByTeacher(teacherId), [teacherId]);
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

  const handleSave = async () => {
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
    try {
      await saveAttendanceBatchToBackend(newRecs);
    } catch (err) {
      console.error("saveAttendanceBatchToBackend failed:", err);
      saveAttendance([...att, ...newRecs]);
    }
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
  const students = useMemo(() => getStudentsByTeacher(teacherId), [teacherId]);
  const [fees, setFees] = useState<FeeRecord[]>(() => getFees());
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [feeForm, setFeeForm] = useState({
    amount: "",
    date: "",
    method: "",
    status: "paid" as FeeRecord["status"],
    description: "",
    receiptNumber: "",
  });

  // Memoize latest fee per student to avoid O(n) scan per row on every render
  const latestFeeMap = useMemo(() => {
    const map: Record<string, FeeRecord | undefined> = {};
    for (const f of fees) {
      const existing = map[f.studentId];
      if (!existing || f.date > existing.date) {
        map[f.studentId] = f;
      }
    }
    return map;
  }, [fees]);

  const getLatestFee = (studentId: string) => latestFeeMap[studentId];

  const handleSaveFee = async () => {
    if (!editStudent || !feeForm.amount) return;
    const newFee: FeeRecord = {
      id: generateId("fee"),
      studentId: editStudent.id,
      amount: Number(feeForm.amount),
      date: feeForm.date || new Date().toISOString().split("T")[0],
      status: feeForm.status,
      method: feeForm.method,
      description: feeForm.description,
      receiptNumber: feeForm.receiptNumber || undefined,
    };
    try {
      await saveFeeToBackend(newFee);
    } catch (err) {
      console.error("saveFeeToBackend failed:", err);
      saveFees([...fees, newFee]);
    }
    setFees((prev) => [...prev, newFee]);
    // Auto-add to income if fee is paid
    if (newFee.status === "paid") {
      const existingIncome = getFinancialRecords().find(
        (r) => r.sourceFeeId === newFee.id,
      );
      if (!existingIncome) {
        const student = editStudent;
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
        } as FinancialRecord);
      }
    }
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
              <TableHead>Receipt No.</TableHead>
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
                    {latest?.receiptNumber || "—"}
                  </TableCell>
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
            <div className="space-y-1">
              <Label>Receipt Number</Label>
              <Input
                value={feeForm.receiptNumber}
                onChange={(e) =>
                  setFeeForm((f) => ({ ...f, receiptNumber: e.target.value }))
                }
                placeholder="e.g. RPS-2026-005"
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
  const students = useMemo(() => getStudentsByTeacher(teacherId), [teacherId]);
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
  const [subjectMaxMarks, setSubjectMaxMarks] = useState<
    Record<string, number>
  >({});
  const [results] = useState<ExamResult[]>(() =>
    getResults().filter((r) => r.teacherId === teacherId),
  );

  // O(1) student name lookup
  const studentNameMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s.name])),
    [students],
  );

  const getSubjectMax = (sub: string) => subjectMaxMarks[sub] ?? 100;

  const handleMark = (studentId: string, subject: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [subject]: value },
    }));
  };

  const handleSubmit = async () => {
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
        maxMarks: getSubjectMax(sub),
      })),
      submittedAt: now,
      status: "pending" as const,
    }));
    try {
      await saveResultsBatchToBackend(newResults);
    } catch (err) {
      console.error("saveResultsBatchToBackend failed:", err);
      saveResults([...allResults, ...newResults]);
    }
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
              <tr className="border-t border-border bg-muted/30">
                <td className="py-2 px-3 font-semibold text-foreground text-sm">
                  Total Marks
                </td>
                {subjects.map((sub) => (
                  <td key={sub} className="py-2 px-3">
                    <Input
                      type="number"
                      min="1"
                      value={subjectMaxMarks[sub] ?? 100}
                      onChange={(e) =>
                        setSubjectMaxMarks((prev) => ({
                          ...prev,
                          [sub]: Number(e.target.value) || 100,
                        }))
                      }
                      className="w-20 h-8 text-center font-semibold"
                    />
                  </td>
                ))}
              </tr>
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
                        max={String(getSubjectMax(sub))}
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

      {/* Previously submitted — paginated */}
      {(() => {
        // We can't call hooks here; use inline render component
        return (
          <SubmittedResultsTable
            results={results}
            studentNameMap={studentNameMap}
          />
        );
      })()}
    </div>
  );
}

function SubmittedResultsTable({
  results,
  studentNameMap,
}: {
  results: ExamResult[];
  studentNameMap: Record<string, string>;
}) {
  const { paged, pagination } = usePagination(results, 15);
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">Submitted Results</h3>
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
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-6"
                  data-ocid="marks.results.empty_state"
                >
                  No results submitted
                </TableCell>
              </TableRow>
            ) : (
              paged.map((r, idx) => (
                <TableRow
                  key={r.id}
                  data-ocid={`marks.results.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    {studentNameMap[r.studentId] ?? r.studentId}
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
// Student Progress
// ============================================================
function StudentProgress({ teacherId }: { teacherId: string }) {
  const students = useMemo(() => getStudentsByTeacher(teacherId), [teacherId]);
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");

  const results = useMemo(
    () =>
      getResults().filter(
        (r) => r.studentId === selectedId && r.status === "approved",
      ),
    [selectedId],
  );
  const portfolio = useMemo(
    () => getPortfolio().filter((p) => p.studentId === selectedId),
    [selectedId],
  );

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

  const handleAdd = async () => {
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
    try {
      await savePortfolioEntryToBackend(entry);
    } catch (err) {
      console.error("savePortfolioEntryToBackend failed:", err);
      savePortfolio([...portfolio, entry]);
    }
    setPortfolio((prev) => [...prev, entry]);
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "academic",
    });
    toast.success("Portfolio entry added");
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePortfolioEntryFromBackend(id);
    } catch (err) {
      console.error("deletePortfolioEntryFromBackend failed:", err);
      savePortfolio(portfolio.filter((p) => p.id !== id));
    }
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
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
  const [existing, setExisting] = useState<Timetable | undefined>(() =>
    getTimetables().find((t) => t.class === teacherClass),
  );
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

  const handleSave = async () => {
    const tt = getTimetables();
    const idx = tt.findIndex((t) => t.class === teacherClass);
    const newTT: Timetable = {
      id: existing?.id ?? generateId("tt"),
      class: teacherClass,
      schedule,
      updatedAt: new Date().toISOString().split("T")[0],
      updatedBy: teacherId,
      approvalStatus: "pending",
      approvalNote: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
    };
    const updated =
      idx >= 0 ? tt.map((t, i) => (i === idx ? newTT : t)) : [...tt, newTT];
    try {
      await saveTimetableToBackend(newTT);
    } catch (err) {
      console.error("saveTimetableToBackend failed:", err);
      saveTimetables(updated);
    }
    setExisting(newTT);
    toast.success("Timetable submitted for principal approval");
  };

  const approvalStatus = existing?.approvalStatus;
  const isRejected = approvalStatus === "rejected";
  const buttonLabel = isRejected
    ? "Re-submit for Approval"
    : "Submit for Approval";

  return (
    <div>
      <h2 className="section-title">Upload Timetable</h2>
      <p className="section-subtitle">
        Class {teacherClass} · Period-wise schedule
      </p>

      {/* Approval status banner */}
      {approvalStatus === "pending" && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-4">
          <span className="text-lg shrink-0">⏳</span>
          <div>
            <p className="font-semibold text-sm">Awaiting Principal Approval</p>
            <p className="text-sm mt-0.5">
              Timetable submitted — awaiting principal approval. You can edit
              and re-submit below.
            </p>
          </div>
        </div>
      )}
      {approvalStatus === "approved" && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-4">
          <span className="text-lg shrink-0">✅</span>
          <div>
            <p className="font-semibold text-sm">Timetable Approved</p>
            <p className="text-sm mt-0.5">
              Timetable approved by the principal. Students can now view it.
              Submit again to request a new review.
            </p>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <span className="text-lg shrink-0">❌</span>
          <div>
            <p className="font-semibold text-sm">Timetable Rejected</p>
            {existing?.approvalNote && (
              <p className="text-sm mt-0.5">Note: {existing.approvalNote}</p>
            )}
            <p className="text-sm mt-0.5">
              Please revise the timetable and re-submit for approval.
            </p>
          </div>
        </div>
      )}

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
        <Upload className="w-4 h-4" /> {buttonLabel}
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

  const handlePost = async () => {
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
    try {
      await saveHomeworkToBackend(hw);
    } catch (err) {
      console.error("saveHomeworkToBackend failed:", err);
      saveHomework([hw, ...homework]);
    }
    setHomework((prev) => [hw, ...prev]);
    setForm({
      subject: "",
      title: "",
      description: "",
      dueDate: "",
      class: teacherClass,
    });
    toast.success("Homework posted");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHomeworkFromBackend(id);
    } catch (err) {
      console.error("deleteHomeworkFromBackend failed:", err);
      saveHomework(homework.filter((h) => h.id !== id));
    }
    setHomework((prev) => prev.filter((h) => h.id !== id));
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

  const handleCreate = async () => {
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
    try {
      await saveExamToBackend(exam);
    } catch (err) {
      console.error("saveExamToBackend failed:", err);
      saveExams([...allExams, exam]);
    }
    setExams((prev) => [...prev, exam]);
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
  const today = new Date().toISOString().split("T")[0];
  const [records, setRecords] = useState<TeacherAttendance[]>(
    getTeacherAttendance().filter((r) => r.teacherId === teacherId),
  );
  const [form, setForm] = useState({
    date: today,
    status: "present" as TeacherAttendance["status"],
    checkInTime: "",
    checkOutTime: "",
  });

  const todayRecord = records.find((r) => r.date === form.date);

  const handleMark = async () => {
    if (!form.checkInTime) {
      toast.error("Please enter check-in time");
      return;
    }
    if (todayRecord) {
      toast.error("Attendance already marked for this date");
      return;
    }
    const newRecord: TeacherAttendance = {
      id: generateId("tatt"),
      teacherId,
      date: form.date,
      status: form.status,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime || undefined,
      approvalStatus: "pending",
    };
    try {
      await addTeacherAttendanceToBackend(newRecord);
    } catch (err) {
      console.error("addTeacherAttendanceToBackend failed:", err);
      saveTeacherAttendance([...getTeacherAttendance(), newRecord]);
    }
    setRecords((prev) => [...prev, newRecord]);
    setForm({
      date: today,
      status: "present",
      checkInTime: "",
      checkOutTime: "",
    });
    toast.success("Attendance submitted — awaiting principal approval");
  };

  const handleCheckOut = async () => {
    if (!todayRecord) {
      toast.error("Mark check-in first");
      return;
    }
    if (!form.checkOutTime) {
      toast.error("Please enter check-out time");
      return;
    }
    const updatedRecord = { ...todayRecord, checkOutTime: form.checkOutTime };
    try {
      await updateTeacherAttendanceInBackend(updatedRecord);
    } catch (err) {
      console.error("updateTeacherAttendanceInBackend (checkout) failed:", err);
      const all = getTeacherAttendance().map((r) =>
        r.id === todayRecord.id ? updatedRecord : r,
      );
      saveTeacherAttendance(all);
    }
    setRecords((prev) =>
      prev.map((r) => (r.id === todayRecord.id ? updatedRecord : r)),
    );
    toast.success("Check-out time saved");
  };

  const present = records.filter((r) => r.status === "present").length;
  const pct =
    records.length > 0 ? Math.round((present / records.length) * 100) : 0;

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
      <h2 className="section-title">My Attendance</h2>
      <p className="section-subtitle">Mark your attendance and view records</p>

      {/* Self-mark form */}
      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Mark Attendance</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              min={today}
              max={today}
              readOnly
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as TeacherAttendance["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Check-In Time</Label>
            <Input
              type="time"
              value={form.checkInTime}
              onChange={(e) =>
                setForm({ ...form, checkInTime: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Check-Out Time</Label>
            <Input
              type="time"
              value={form.checkOutTime}
              onChange={(e) =>
                setForm({ ...form, checkOutTime: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={handleMark} disabled={!!todayRecord}>
            {todayRecord ? "Already Marked" : "Submit Attendance"}
          </Button>
          {todayRecord && !todayRecord.checkOutTime && (
            <Button variant="outline" onClick={handleCheckOut}>
              Save Check-Out Time
            </Button>
          )}
        </div>
        {todayRecord && (
          <p className="text-xs text-muted-foreground mt-2">
            Today already marked — you can only update check-out time if not yet
            saved.
          </p>
        )}
      </div>

      {/* Stats */}
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

      {/* Records table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Approval</TableHead>
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
                  <TableCell>{r.checkInTime || "—"}</TableCell>
                  <TableCell>{r.checkOutTime || "—"}</TableCell>
                  <TableCell>{approvalBadge(r.approvalStatus)}</TableCell>
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

  const handleSubmit = async () => {
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
    try {
      await saveLeaveToBackend(leave);
    } catch (err) {
      console.error("saveLeaveToBackend (teacher) failed:", err);
      saveLeaves([...getLeaves(), leave]);
    }
    setLeaves((prev) => [...prev, leave]);
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
// Teacher Profile
// ============================================================
function TeacherProfile({ teacherId }: { teacherId: string }) {
  const teacher = getTeacherById(teacherId);

  if (!teacher) {
    return (
      <div>
        <h2 className="section-title">My Profile</h2>
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          Profile not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">My Profile</h2>
      <p className="section-subtitle">Your teacher profile information</p>

      <div className="max-w-lg">
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Photo + name header */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {teacher.photo ? (
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {teacher.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {teacher.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {teacher.subject} Teacher
              </p>
              <div
                className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "oklch(0.92 0.08 264)",
                  color: "oklch(0.3 0.1 264)",
                }}
              >
                Class {teacher.class}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {[
              { label: "Teacher ID", value: teacher.id },
              { label: "Subject", value: teacher.subject },
              { label: "Assigned Class", value: teacher.class },
              { label: "Email", value: teacher.email || "Not provided" },
              { label: "Phone", value: teacher.phone || "Not provided" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-sm text-muted-foreground w-36 shrink-0">
                  {label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Progress Cards
// ============================================================

interface RankedStudent {
  student: Student;
  result: ExamResult;
  totalAwarded: number;
  totalMax: number;
  percentage: number;
  grade: string;
  rank: number;
}

function computeRankedStudents(
  teacherId: string,
  examName: string,
): RankedStudent[] {
  const students = getStudentsByTeacher(teacherId);
  const studentIds = new Set(students.map((s) => s.id));
  const results = getResults().filter(
    (r) =>
      r.examName === examName &&
      r.status === "approved" &&
      studentIds.has(r.studentId),
  );

  const enriched = results
    .map((r) => {
      const student = students.find((s) => s.id === r.studentId);
      if (!student) return null;
      const totalAwarded = r.subjects.reduce((a, s) => a + s.marks, 0);
      const totalMax = r.subjects.reduce((a, s) => a + s.maxMarks, 0);
      const percentage =
        totalMax > 0 ? Math.round((totalAwarded / totalMax) * 100) : 0;
      const grade = getGrade(percentage);
      return { student, result: r, totalAwarded, totalMax, percentage, grade };
    })
    .filter(Boolean) as Omit<RankedStudent, "rank">[];

  enriched.sort((a, b) => b.percentage - a.percentage);

  let rank = 1;
  return enriched.map((item, idx, arr) => {
    if (idx > 0 && item.percentage < arr[idx - 1].percentage) {
      rank = idx + 1;
    }
    return { ...item, rank };
  });
}

function ProgressCardPrint({
  rankedStudent,
  examName,
  schoolName,
  teacherName,
  schoolLogo,
}: {
  rankedStudent: RankedStudent;
  examName: string;
  schoolName: string;
  teacherName: string;
  schoolLogo?: string;
}) {
  const { student, result, totalAwarded, totalMax, percentage, grade, rank } =
    rankedStudent;

  const gradeColor = (g: string) => {
    if (g === "A+" || g === "A") return "#16a34a";
    if (g === "B+" || g === "B") return "#2563eb";
    if (g === "C") return "#d97706";
    if (g === "D") return "#ea580c";
    return "#dc2626";
  };

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "148mm",
        background: "#ffffff",
        border: "2px solid #1e3a5f",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "Georgia, serif",
        marginBottom: "12px",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      {/* Header band */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {schoolLogo && (
          <img
            src={schoolLogo}
            alt="School Logo"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              objectFit: "contain",
              background: "#fff",
              padding: "3px",
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            {schoolName}
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>
            Akampadam · Excellence in Education
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#fbbf24",
              fontSize: "13px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Progress Report Card
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>
            {examName}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 24px" }}>
        {/* Student info row */}
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {/* Photo */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #1e3a5f",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e8f0fe",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e3a5f",
            }}
          >
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              student.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Student details */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1e3a5f",
                marginBottom: "4px",
              }}
            >
              {student.name}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px 16px",
                fontSize: "11px",
                color: "#555",
              }}
            >
              <span>
                <strong>Class:</strong> {student.class}
              </span>
              <span>
                <strong>Roll No:</strong> {student.rollNo || "—"}
              </span>
              <span>
                <strong>Student ID:</strong> {student.id}
              </span>
              <span>
                <strong>Academic Year:</strong> 2025–2026
              </span>
            </div>
          </div>

          {/* Rank badge */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              borderRadius: "10px",
              padding: "10px 14px",
              minWidth: "70px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{ fontSize: "10px", color: "#92400e", fontWeight: "bold" }}
            >
              CLASS RANK
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#78350f",
                lineHeight: 1,
              }}
            >
              #{rank}
            </div>
          </div>
        </div>

        {/* Key stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            margin: "14px 0",
          }}
        >
          {[
            {
              label: "Total Marks",
              value: `${totalAwarded}/${totalMax}`,
              bg: "#eff6ff",
              border: "#bfdbfe",
              text: "#1d4ed8",
            },
            {
              label: "Percentage",
              value: `${percentage}%`,
              bg: "#f0fdf4",
              border: "#bbf7d0",
              text: "#15803d",
            },
            {
              label: "Overall Grade",
              value: grade,
              bg: "#fffbeb",
              border: "#fde68a",
              text: gradeColor(grade),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: stat.bg,
                border: `1.5px solid ${stat.border}`,
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: stat.text,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Subject marks table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px",
            marginBottom: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#1e3a5f", color: "#fff" }}>
              {[
                "Subject",
                "Marks Awarded",
                "Total Marks",
                "Percentage",
                "Grade",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 10px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.subjects.map((sub, idx) => {
              const subPct =
                sub.maxMarks > 0
                  ? Math.round((sub.marks / sub.maxMarks) * 100)
                  : 0;
              const subGrade = getGrade(subPct);
              return (
                <tr
                  key={sub.subject}
                  style={{
                    background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <td style={{ padding: "5px 10px", fontWeight: "600" }}>
                    {sub.subject}
                  </td>
                  <td style={{ padding: "5px 10px", textAlign: "center" }}>
                    {sub.marks}
                  </td>
                  <td style={{ padding: "5px 10px", textAlign: "center" }}>
                    {sub.maxMarks}
                  </td>
                  <td style={{ padding: "5px 10px", textAlign: "center" }}>
                    {subPct}%
                  </td>
                  <td
                    style={{
                      padding: "5px 10px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: gradeColor(subGrade),
                    }}
                  >
                    {subGrade}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "10px",
            marginTop: "4px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "120px",
                borderBottom: "1.5px solid #1e3a5f",
                marginBottom: "4px",
              }}
            />
            <div style={{ fontSize: "10px", color: "#555" }}>Class Teacher</div>
            <div style={{ fontSize: "10px", color: "#888" }}>{teacherName}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "120px",
                borderBottom: "1.5px solid #1e3a5f",
                marginBottom: "4px",
              }}
            />
            <div style={{ fontSize: "10px", color: "#555" }}>Principal</div>
            <div style={{ fontSize: "10px", color: "#888" }}>
              {getPrincipalProfile().name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCards({
  teacherId,
}: {
  teacherId: string;
  teacherClass: string;
}) {
  const teacher = getTeacherById(teacherId);
  const profile = getPrincipalProfile();
  const schoolName =
    (profile as { schoolName?: string }).schoolName ||
    "Rahmaniyya Public School";

  // Get all approved exam names for this teacher's students
  const students = getStudentsByTeacher(teacherId);
  const studentIds = new Set(students.map((s) => s.id));
  const approvedResults = getResults().filter(
    (r) => r.status === "approved" && studentIds.has(r.studentId),
  );
  const examNames = [...new Set(approvedResults.map((r) => r.examName))];

  const [selectedExam, setSelectedExam] = useState(examNames[0] ?? "");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  const rankedStudents = selectedExam
    ? computeRankedStudents(teacherId, selectedExam)
    : [];

  const displayCards =
    selectedStudentId === "all"
      ? rankedStudents
      : rankedStudents.filter((r) => r.student.id === selectedStudentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Progress Cards</h2>
          <p className="section-subtitle">
            Preview and print student progress report cards
          </p>
        </div>
        <Button
          onClick={handlePrint}
          className="gap-2 no-print"
          disabled={displayCards.length === 0}
        >
          <Printer className="w-4 h-4" /> Print / Download
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 no-print">
        <div className="space-y-1">
          <Label>Select Exam</Label>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {examNames.length === 0 ? (
                <SelectItem value="none" disabled>
                  No approved results
                </SelectItem>
              ) : (
                examNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Select Student</Label>
          <Select
            value={selectedStudentId}
            onValueChange={setSelectedStudentId}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {rankedStudents.map((r) => (
                <SelectItem key={r.student.id} value={r.student.id}>
                  {r.student.name} (Rank #{r.rank})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary info bar */}
      {selectedExam && rankedStudents.length > 0 && (
        <div className="no-print flex gap-3 flex-wrap mb-5">
          {[
            {
              label: "Students",
              value: rankedStudents.length,
              color: "bg-blue-50 border-blue-200 text-blue-700",
            },
            {
              label: "Showing",
              value: displayCards.length,
              color: "bg-green-50 border-green-200 text-green-700",
            },
            {
              label: "Top Score",
              value: `${rankedStudents[0]?.percentage ?? 0}%`,
              color: "bg-amber-50 border-amber-200 text-amber-700",
            },
            {
              label: "Class Avg",
              value: `${Math.round(rankedStudents.reduce((a, r) => a + r.percentage, 0) / rankedStudents.length)}%`,
              color: "bg-purple-50 border-purple-200 text-purple-700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`border rounded-lg px-4 py-2 text-sm font-medium ${s.color}`}
            >
              <span className="font-bold">{s.value}</span>{" "}
              <span className="opacity-70">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {examNames.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground font-medium">
            No approved results available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Results need to be submitted and approved by the principal first.
          </p>
        </div>
      )}

      {selectedExam && rankedStudents.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <p className="text-muted-foreground">
            No approved results found for &quot;{selectedExam}&quot;
          </p>
        </div>
      )}

      {/* Progress cards — same markup used for screen preview and printing */}
      {displayCards.length > 0 && (
        <div id="progress-cards-print" className="print-target space-y-4">
          {displayCards.map((rs) => (
            <div
              key={rs.student.id}
              className="border-2 border-border rounded-lg overflow-hidden shadow-sm"
            >
              <ProgressCardPrint
                rankedStudent={rs}
                examName={selectedExam}
                schoolName={schoolName}
                teacherName={teacher?.name ?? "Class Teacher"}
                schoolLogo={profile.institutionLogo || undefined}
              />
            </div>
          ))}
        </div>
      )}
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
    {
      id: "progresscards",
      label: "Progress Cards",
      icon: <FileText className="w-4 h-4" />,
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
      case "progresscards":
        return (
          <ProgressCards teacherId={user.id} teacherClass={teacherClass} />
        );
      case "profile":
        return <TeacherProfile teacherId={user.id} />;
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
