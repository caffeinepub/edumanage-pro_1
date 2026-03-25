import {
  SimpleBarChart,
  SimpleLineChart,
  SimpleRadarChart,
} from "@/components/Charts";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Clock,
  DashboardLayout,
  DollarSign,
  LayoutDashboard,
  Mail,
  MessageSquare,
  TrendingUp,
} from "@/components/DashboardLayout";
import StudentWelcomeScreen from "@/components/StudentWelcomeScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import LearningGames from "@/pages/student/LearningGames";
import {
  type CurrentUser,
  type ExamAttempt,
  type LeaveApplication,
  type SuggestionQuery,
  calcAttendancePercent,
  formatDate,
  generateId,
  getExamAttempts,
  getExams,
  getGrade,
  getHomework,
  getLeaves,
  getNotifications,
  getResults,
  getStudentAttendance,
  getStudentById,
  getStudentFees,
  getStudentPortfolio,
  getStudentResults,
  getSuggestions,
  getTeacherById,
  getTimetableByClass,
  saveExamAttemptToBackend,
  saveExamAttempts,
  saveLeaveToBackend,
  saveLeaves,
  saveSuggestionToBackend,
  saveSuggestions,
} from "@/store/data";

// ============================================================
// Rank Helper
// ============================================================
function getStudentClassRank(
  studentId: string,
  examName: string,
  studentClass: string,
): number {
  const allResults = getResults();
  const classResults = allResults.filter(
    (r) =>
      r.examName === examName &&
      r.class === studentClass &&
      r.status === "approved",
  );

  // Compute percentage for each student
  const studentPercentages: { studentId: string; pct: number }[] =
    classResults.map((r) => {
      const totalAwarded = r.subjects.reduce((a, s) => a + s.marks, 0);
      const totalMax = r.subjects.reduce((a, s) => a + s.maxMarks, 0);
      const pct = totalMax > 0 ? (totalAwarded / totalMax) * 100 : 0;
      return { studentId: r.studentId, pct };
    });

  // Sort descending by percentage
  studentPercentages.sort((a, b) => b.pct - a.pct);

  // Find the percentage of the target student
  const targetEntry = studentPercentages.find((x) => x.studentId === studentId);
  if (!targetEntry) return 0;

  // Rank = position of first student with same or better percentage (1-based, ties share same rank)
  let rank = 1;
  for (const entry of studentPercentages) {
    if (entry.pct > targetEntry.pct) {
      rank++;
    } else {
      break;
    }
  }

  return rank;
}
import {
  Bot,
  Calendar,
  FileText,
  Gamepad2,
  Printer,
  Send,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  user: CurrentUser;
  onLogout: () => void;
}

// ============================================================
// Student Overview
// ============================================================
function Overview({ user }: { user: CurrentUser }) {
  const student = getStudentById(user.id);
  const attendance = getStudentAttendance(user.id);
  const fees = getStudentFees(user.id);
  const results = getStudentResults(user.id);
  const notifications = getNotifications().slice(0, 3);
  const homework = getHomework()
    .filter((h) => h.class === student?.class)
    .slice(0, 3);

  const attPct = calcAttendancePercent(attendance);
  const pendingFees = fees.filter(
    (f) => f.status === "pending" || f.status === "partial",
  ).length;
  const exams = getExams().filter(
    (e) => e.class === student?.class && e.status === "active",
  );

  const latestResult = results[results.length - 1];
  const avgMarks = latestResult
    ? Math.round(
        latestResult.subjects.reduce((a, s) => a + s.marks, 0) /
          latestResult.subjects.length,
      )
    : 0;

  return (
    <div>
      <h2 className="section-title">My Dashboard</h2>
      <p className="section-subtitle">
        Class {student?.class} · Roll No {student?.rollNo}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Attendance",
            value: `${attPct}%`,
            icon: attPct >= 75 ? "✅" : "⚠️",
            color: attPct >= 75 ? "oklch(0.92 0.1 150)" : "oklch(0.95 0.1 25)",
          },
          {
            label: "Pending Fees",
            value: pendingFees,
            icon: "💰",
            color: "oklch(0.95 0.1 70)",
          },
          {
            label: "Active Exams",
            value: exams.length,
            icon: "📝",
            color: "oklch(0.92 0.08 264)",
          },
          {
            label: "Latest Avg Marks",
            value: avgMarks > 0 ? `${avgMarks}/100` : "N/A",
            icon: "🎓",
            color: "oklch(0.95 0.06 210)",
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
          <h3 className="font-semibold text-foreground mb-4">
            School Notifications
          </h3>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="border-l-4 pl-3 py-1.5 mb-3"
              style={{ borderColor: "oklch(0.48 0.15 264)" }}
            >
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(n.date)}
              </p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground">No announcements</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Homework Due</h3>
          {homework.map((h) => (
            <div
              key={h.id}
              className="flex items-start justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <p className="text-xs text-muted-foreground">{h.subject}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                Due: {formatDate(h.dueDate)}
              </span>
            </div>
          ))}
          {homework.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending homework</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// My Results
// ============================================================
function MyResults({ studentId }: { studentId: string }) {
  const results = getStudentResults(studentId);

  return (
    <div>
      <h2 className="section-title">My Results</h2>
      <p className="section-subtitle">Published exam results</p>

      {results.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          No results published yet
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => {
            const total = r.subjects.reduce((a, s) => a + s.marks, 0);
            const max = r.subjects.reduce((a, s) => a + s.maxMarks, 0);
            const pct = Math.round((total / max) * 100);
            const rank = getStudentClassRank(studentId, r.examName, r.class);
            return (
              <div
                key={r.id}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground">{r.examName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(r.approvedAt ?? r.submittedAt)}
                    </p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Rank
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        #{rank}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Marks
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {total}/{max}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Percentage
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {pct}%
                      </p>
                    </div>
                    <div className="text-center">
                      <Badge className="badge-success text-sm px-3 py-1">
                        {getGrade(pct)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Marks</TableHead>
                        <TableHead className="text-right">Max</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead className="text-right">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.subjects.map((s) => {
                        const sp = Math.round((s.marks / s.maxMarks) * 100);
                        return (
                          <TableRow key={s.subject}>
                            <TableCell className="font-medium">
                              {s.subject}
                            </TableCell>
                            <TableCell className="text-right">
                              {s.marks}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {s.maxMarks}
                            </TableCell>
                            <TableCell className="text-right">{sp}%</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{getGrade(sp)}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// My Progress
// ============================================================
function MyProgress({ studentId }: { studentId: string }) {
  const results = getStudentResults(studentId);
  const portfolio = getStudentPortfolio(studentId);

  const latestResult = results[results.length - 1];
  const barData = latestResult
    ? latestResult.subjects.map((s) => ({ label: s.subject, value: s.marks }))
    : [];

  const lineData = results.map((r) => ({
    label: r.examName.substring(0, 8),
    value: Math.round(
      r.subjects.reduce((a, s) => a + s.marks, 0) / r.subjects.length,
    ),
  }));

  // Skills radar from portfolio
  const skillMap: Record<string, number> = {};
  for (const p of portfolio) {
    const skillName = p.type === "skill" ? p.title.substring(0, 12) : p.type;
    skillMap[skillName] = Math.min(100, (skillMap[skillName] ?? 0) + 25);
  }
  // Ensure some base skills from exam performance
  if (latestResult) {
    for (const s of latestResult.subjects) {
      skillMap[s.subject.substring(0, 8)] = s.marks;
    }
  }
  const radarData = Object.entries(skillMap)
    .slice(0, 6)
    .map(([skill, value]) => ({ skill, value }));

  return (
    <div>
      <h2 className="section-title">My Progress</h2>
      <p className="section-subtitle">
        Academic performance and skill development
      </p>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <SimpleBarChart
            data={barData}
            height={200}
            title="Marks by Subject (Latest Exam)"
          />
          {barData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No exam results yet
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <SimpleLineChart
            data={lineData}
            height={200}
            title="Average Score per Exam"
          />
          {lineData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No exam history
            </p>
          )}
        </div>

        {radarData.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-5">
            <SimpleRadarChart
              data={radarData}
              size={240}
              title="Skills & Performance Radar"
            />
          </div>
        )}

        {/* All exam results summary */}
        {results.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-4">Exam History</h3>
            <div className="space-y-3">
              {results.map((r) => {
                const total = r.subjects.reduce((a, s) => a + s.marks, 0);
                const max = r.subjects.reduce((a, s) => a + s.maxMarks, 0);
                const pct = Math.round((total / max) * 100);
                const rank = getStudentClassRank(
                  studentId,
                  r.examName,
                  r.class,
                );
                return (
                  <div key={r.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {r.examName}
                      </span>
                      <span className="text-muted-foreground">
                        #{rank} · {pct}% · {getGrade(pct)}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4">
          Achievements & Portfolio
        </h3>
        {portfolio.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No portfolio entries yet
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {portfolio.map((p) => (
              <div key={p.id} className="border border-border rounded-lg p-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-2 ${p.type === "academic" ? "badge-info" : p.type === "sports" ? "badge-success" : p.type === "cultural" ? "badge-warning" : "bg-muted"}`}
                >
                  {p.type}
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {p.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(p.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Timetable (Student view)
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

function MyTimetable({ studentClass }: { studentClass: string }) {
  const timetable = getTimetableByClass(studentClass);

  if (!timetable) {
    return (
      <div>
        <h2 className="section-title">My Timetable</h2>
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          Timetable not uploaded yet by your class teacher
        </div>
      </div>
    );
  }

  if (timetable.approvalStatus !== "approved") {
    return (
      <div>
        <h2 className="section-title">My Timetable</h2>
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-base font-medium">Timetable not yet approved</p>
          <p className="text-sm mt-1">
            The timetable has been submitted but is awaiting final approval from
            the principal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">My Timetable</h2>
      <p className="section-subtitle">
        Class {studentClass} · Updated {formatDate(timetable.updatedAt)}
      </p>

      <div className="overflow-x-auto bg-card border border-border rounded-lg">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr
              style={{
                backgroundColor: "oklch(var(--primary))",
                color: "oklch(var(--primary-foreground))",
              }}
            >
              <th className="text-left py-3 px-4 font-semibold">Period</th>
              {DAYS.map((d) => (
                <th key={d} className="text-left py-3 px-3 font-semibold">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pi) => (
              <tr
                key={period}
                className={pi % 2 === 0 ? "bg-card" : "bg-muted/30"}
              >
                <td className="py-3 px-4 font-semibold text-foreground">
                  {period}
                </td>
                {DAYS.map((day) => {
                  const cell = timetable.schedule[day]?.[period];
                  return (
                    <td key={day} className="py-2 px-3">
                      {cell?.subject ? (
                        <div>
                          <p className="font-medium text-foreground">
                            {cell.subject}
                          </p>
                          {cell.teacher && (
                            <p className="text-muted-foreground">
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
    </div>
  );
}

// ============================================================
// Online Exams (Student Attempt)
// ============================================================
function OnlineExamsStudent({ user }: { user: CurrentUser }) {
  const student = getStudentById(user.id);
  const exams = getExams().filter(
    (e) => e.class === student?.class && e.status === "active",
  );
  const attempts = getExamAttempts().filter((a) => a.studentId === user.id);
  const [attempting, setAttempting] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = (exam: (typeof exams)[0]) => {
    setAttempting(exam.id);
    setAnswers({});
    setSubmitted(false);
    setLastScore(null);
    setTimeLeft(exam.duration * 60);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleSubmit is stable within render
  useEffect(() => {
    if (attempting && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleSubmit(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempting, submitted]);

  const handleSubmit = async (auto = false) => {
    if (!attempting) return;
    const exam = exams.find((e) => e.id === attempting);
    if (!exam) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Score MCQ questions
    let score = 0;
    for (const q of exam.questions) {
      if (q.type === "mcq" && answers[q.id] === q.correctAnswer) {
        score++;
      }
    }

    const attempt: ExamAttempt = {
      id: generateId("attempt"),
      examId: attempting,
      studentId: user.id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      score,
      submittedAt: new Date().toISOString(),
    };

    try {
      await saveExamAttemptToBackend(attempt);
    } catch (err) {
      console.error("saveExamAttemptToBackend failed:", err);
      const allAttempts = getExamAttempts();
      saveExamAttempts([...allAttempts, attempt]);
    }
    setSubmitted(true);
    setLastScore(score);
    if (auto) toast.info("Time up! Exam auto-submitted.");
    else
      toast.success(
        `Exam submitted! Score: ${score}/${exam.questions.filter((q) => q.type === "mcq").length}`,
      );
  };

  const currentExam = exams.find((e) => e.id === attempting);
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (attempting && currentExam) {
    if (submitted) {
      const mcqTotal = currentExam.questions.filter(
        (q) => q.type === "mcq",
      ).length;
      return (
        <div>
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Exam Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">{currentExam.title}</p>
            {mcqTotal > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <p className="text-4xl font-bold text-foreground mb-1">
                  {lastScore}/{mcqTotal}
                </p>
                <p className="text-muted-foreground">MCQ Score</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Descriptive answers will be reviewed manually
                </p>
              </div>
            )}
            <Button onClick={() => setAttempting(null)}>Back to Exams</Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">{currentExam.title}</h2>
            <p className="section-subtitle">
              {currentExam.subject} · {currentExam.questions.length} questions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${timeLeft < 120 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
            >
              ⏱ {formatTime(timeLeft)}
            </div>
            <Button onClick={() => handleSubmit(false)} variant="outline">
              Submit Exam
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {currentExam.questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-3">
                    {q.question}
                  </p>
                  {q.type === "mcq" && q.options ? (
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === opt ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [q.id]: opt }))
                            }
                            className="accent-primary"
                          />
                          <span className="text-sm text-foreground">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      rows={3}
                      placeholder="Write your answer here..."
                      value={answers[q.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={() => handleSubmit(false)} className="gap-1.5">
            Submit Exam
          </Button>
          <Button variant="outline" onClick={() => setAttempting(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">Online Exams</h2>
      <p className="section-subtitle">Assigned exams for your class</p>

      {exams.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          No exams assigned yet
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((e) => {
            const attempted = attempts.find((a) => a.examId === e.id);
            return (
              <div
                key={e.id}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{e.subject}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {e.duration} min
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {e.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {e.questions.length} questions · Class {e.class}
                </p>
                {attempted ? (
                  <div className="text-center">
                    <Badge className="badge-success">
                      Attempted · Score: {attempted.score}/
                      {e.questions.filter((q) => q.type === "mcq").length}
                    </Badge>
                  </div>
                ) : (
                  <Button
                    className="w-full gap-1.5"
                    onClick={() => startExam(e)}
                  >
                    <BookOpenCheck className="w-4 h-4" /> Start Exam
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Fee Status (Student)
// ============================================================
function FeeStatus({ studentId }: { studentId: string }) {
  const fees = getStudentFees(studentId);

  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((a, f) => a + f.amount, 0);
  const totalDue = fees
    .filter((f) => f.status === "pending")
    .reduce((a, f) => a + f.amount, 0);

  const statusBadge = (status: string) => {
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
      <h2 className="section-title">Fee Status</h2>
      <p className="section-subtitle">Payment history and pending dues</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.55 0.15 150)" }}
          >
            ₹{totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-1">Total Due</p>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.577 0.245 27)" }}
          >
            ₹{totalDue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-6"
                >
                  No fee records
                </TableCell>
              </TableRow>
            ) : (
              fees.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-xs">
                    {f.receiptNumber || "—"}
                  </TableCell>
                  <TableCell className="font-medium">{f.description}</TableCell>
                  <TableCell>₹{f.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.date ? formatDate(f.date) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.method || "—"}
                  </TableCell>
                  <TableCell>{statusBadge(f.status)}</TableCell>
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
// Notifications (Student)
// ============================================================
function StudentNotifications({ studentClass }: { studentClass: string }) {
  const notifications = getNotifications().sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const homework = getHomework().filter((h) => h.class === studentClass);

  return (
    <div>
      <h2 className="section-title">Notifications</h2>
      <p className="section-subtitle">School announcements and homework</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            School Announcements
          </h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-foreground">{n.title}</h4>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
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
            Homework Assignments
          </h3>
          <div className="space-y-3">
            {homework.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                No homework
              </div>
            ) : (
              homework.map((h) => (
                <div
                  key={h.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{h.subject}</Badge>
                    <span className="text-xs text-destructive font-medium">
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
// Attendance (Student)
// ============================================================
function MyAttendance({ studentId }: { studentId: string }) {
  const records = getStudentAttendance(studentId);
  const pct = calcAttendancePercent(records);
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;

  return (
    <div>
      <h2 className="section-title">My Attendance</h2>
      <p className="section-subtitle">Attendance records and percentage</p>

      <div className="bg-card border border-border rounded-xl p-6 mb-6 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Overall Attendance</h3>
          <span
            className={`text-3xl font-bold ${pct >= 75 ? "text-green-600" : "text-destructive"}`}
          >
            {pct}%
          </span>
        </div>
        <Progress value={pct} className="h-3 mb-3" />
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-bold text-foreground">{present}</p>
            <p className="text-muted-foreground text-xs">Present</p>
          </div>
          <div>
            <p className="font-bold text-foreground">{late}</p>
            <p className="text-muted-foreground text-xs">Late</p>
          </div>
          <div>
            <p className="font-bold text-foreground">{absent}</p>
            <p className="text-muted-foreground text-xs">Absent</p>
          </div>
        </div>
        {pct < 75 && (
          <div className="mt-3 p-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
            ⚠️ Attendance below 75% requirement
          </div>
        )}
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
// Leave Application (Student)
// ============================================================
function StudentLeave({ user }: { user: CurrentUser }) {
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
      applicantRole: "student",
      ...form,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    try {
      await saveLeaveToBackend(leave);
    } catch (err) {
      console.error("saveLeaveToBackend (student) failed:", err);
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
      <p className="section-subtitle">Apply for leave</p>

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
// Suggestions & Queries
// ============================================================
function SuggestionsAndQueries({ user }: { user: CurrentUser }) {
  const [suggestions, setSuggestions] = useState<SuggestionQuery[]>(
    getSuggestions().filter((s) => s.studentId === user.id),
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please write your query/suggestion");
      return;
    }
    const newS: SuggestionQuery = {
      id: generateId("sug"),
      studentId: user.id,
      studentName: user.name,
      message: message.trim(),
      submittedAt: new Date().toISOString().split("T")[0],
    };
    try {
      await saveSuggestionToBackend(newS);
    } catch (err) {
      console.error("saveSuggestionToBackend failed:", err);
      saveSuggestions([...getSuggestions(), newS]);
    }
    setSuggestions((prev) => [...prev, newS]);
    setMessage("");
    toast.success("Suggestion submitted to principal");
  };

  return (
    <div>
      <h2 className="section-title">Suggestions & Queries</h2>
      <p className="section-subtitle">
        Submit queries or suggestions to the principal
      </p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6 max-w-xl">
        <h3 className="font-semibold text-foreground mb-3">
          New Suggestion / Query
        </h3>
        <Textarea
          rows={4}
          placeholder="Write your suggestion, query, or feedback here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mb-3"
        />
        <Button className="gap-1.5" onClick={handleSubmit}>
          <MessageSquare className="w-4 h-4" /> Submit
        </Button>
      </div>

      <h3 className="font-semibold text-foreground mb-3">My Submissions</h3>
      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
            No submissions yet
          </div>
        ) : (
          suggestions
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
            .map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <p className="text-sm text-foreground mb-2">{s.message}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {formatDate(s.submittedAt)}
                </p>
                {s.response && (
                  <div className="mt-3 p-3 bg-accent rounded-lg">
                    <p className="text-xs font-semibold text-foreground mb-1">
                      Principal&apos;s Response:
                    </p>
                    <p className="text-sm text-foreground">{s.response}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(s.respondedAt ?? "")}
                    </p>
                  </div>
                )}
                {!s.response && (
                  <span className="badge-warning inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2">
                    Awaiting Response
                  </span>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// Student Profile
// ============================================================
function StudentProfile({ studentId }: { studentId: string }) {
  const student = getStudentById(studentId);
  const teacher = student ? getTeacherById(student.teacherId) : undefined;

  if (!student) {
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
      <p className="section-subtitle">Your student profile information</p>

      <div className="max-w-lg">
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Photo + name header */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {student.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {student.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Roll No. {student.rollNo}
              </p>
              <div
                className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "oklch(0.92 0.1 150)",
                  color: "oklch(0.3 0.12 150)",
                }}
              >
                Class {student.class}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {[
              { label: "Student ID", value: student.id },
              { label: "Class", value: student.class },
              { label: "Roll Number", value: student.rollNo },
              {
                label: "Parent / Guardian",
                value: student.parentName || "Not provided",
              },
              {
                label: "Parent Phone",
                value: student.parentPhone || "Not provided",
              },
              {
                label: "Class Teacher",
                value: teacher?.name || "Not assigned",
              },
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
// AI Assistant
// ============================================================
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AIAssistantProps {
  user: CurrentUser;
  studentClass: string;
}

const QUICK_QUESTIONS = [
  "What is my attendance?",
  "Show my latest results",
  "When is my next exam?",
  "What homework is due?",
  "Check my fees",
  "Show my timetable",
] as const;

function generateAIResponse(
  question: string,
  userId: string,
  studentClass: string,
): string {
  const q = question.toLowerCase();

  // Attendance
  if (q.includes("attendance")) {
    const records = getStudentAttendance(userId);
    const pct = calcAttendancePercent(records);
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const total = records.length;
    if (total === 0)
      return "📋 No attendance records found for you yet. Please check back once your teacher starts marking attendance.";
    const status = pct >= 75 ? "✅ Good standing" : "⚠️ Below 75% requirement";
    return `📊 Your attendance summary:\n\n• Overall: **${pct}%** (${status})\n• Present: ${present} day${present !== 1 ? "s" : ""}\n• Absent: ${absent} day${absent !== 1 ? "s" : ""}\n• Late: ${late} day${late !== 1 ? "s" : ""}\n• Total recorded: ${total} day${total !== 1 ? "s" : ""}${pct < 75 ? "\n\n⚠️ Your attendance is below the minimum 75% requirement. Please speak with your class teacher." : "\n\nKeep up the great attendance!"}`;
  }

  // Results / marks / scores
  if (
    q.includes("result") ||
    q.includes("mark") ||
    q.includes("score") ||
    q.includes("grade")
  ) {
    const results = getStudentResults(userId);
    if (results.length === 0)
      return "📝 No exam results have been published for you yet. Results will appear here once your teacher approves them.";
    const latest = results[results.length - 1];
    const total = latest.subjects.reduce((a, s) => a + s.marks, 0);
    const max = latest.subjects.reduce((a, s) => a + s.maxMarks, 0);
    const pct = Math.round((total / max) * 100);
    const grade = getGrade(pct);
    const subjectList = latest.subjects
      .map((s) => `  • ${s.subject}: ${s.marks}/${s.maxMarks}`)
      .join("\n");
    return `🎓 Latest exam: **${latest.examName}**\n\n• Total Marks: ${total}/${max}\n• Percentage: ${pct}%\n• Overall Grade: ${grade}\n\nSubject breakdown:\n${subjectList}\n\nYou have ${results.length} published result${results.length !== 1 ? "s" : ""} in total.`;
  }

  // Fees / payment
  if (q.includes("fee") || q.includes("payment") || q.includes("due")) {
    const fees = getStudentFees(userId);
    if (fees.length === 0) return "💰 No fee records found for you yet.";
    const paid = fees.filter((f) => f.status === "paid");
    const pending = fees.filter((f) => f.status === "pending");
    const partial = fees.filter((f) => f.status === "partial");
    const totalPaid = paid.reduce((a, f) => a + f.amount, 0);
    const totalDue = pending.reduce((a, f) => a + f.amount, 0);
    return `💳 Fee summary:\n\n• Total Paid: ₹${totalPaid.toLocaleString()} (${paid.length} record${paid.length !== 1 ? "s" : ""})\n• Pending: ₹${totalDue.toLocaleString()} (${pending.length} record${pending.length !== 1 ? "s" : ""})\n• Partial: ${partial.length} record${partial.length !== 1 ? "s" : ""}${totalDue > 0 ? "\n\n⚠️ Please clear your pending dues at the earliest." : "\n\n✅ All fees are paid — great job!"}`;
  }

  // Homework / assignment
  if (q.includes("homework") || q.includes("assignment")) {
    const hw = getHomework().filter((h) => h.class === studentClass);
    if (hw.length === 0)
      return "📚 No homework assignments are pending for your class right now. Check back later!";
    const list = hw
      .slice(0, 5)
      .map(
        (h) =>
          `  • **${h.subject}**: ${h.title} — due ${formatDate(h.dueDate)}`,
      )
      .join("\n");
    return `📚 Pending homework for Class ${studentClass}:\n\n${list}${hw.length > 5 ? `\n\n...and ${hw.length - 5} more assignment${hw.length - 5 !== 1 ? "s" : ""}.` : "\n\nComplete your assignments on time!"}`;
  }

  // Timetable / schedule
  if (
    q.includes("timetable") ||
    q.includes("schedule") ||
    q.includes("class schedule")
  ) {
    const tt = getTimetableByClass(studentClass);
    if (!tt)
      return `🗓️ No timetable has been uploaded for Class ${studentClass} yet. Please ask your class teacher.`;
    if (tt.approvalStatus !== "approved")
      return `🗓️ A timetable has been submitted for Class ${studentClass}, but it is awaiting final approval from the principal. It will be visible once approved.`;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todaySchedule = tt.schedule[today];
    if (todaySchedule) {
      const periods = Object.entries(todaySchedule)
        .filter(([, cell]) => cell?.subject)
        .map(([period, cell]) => `  • ${period}: ${cell.subject}`)
        .join("\n");
      return `🗓️ Your timetable for Class ${studentClass} is approved!\n\nToday (${today}):\n${periods || "  No classes scheduled"}`;
    }
    return `🗓️ Your timetable for Class ${studentClass} is approved! Navigate to "My Timetable" to see the full weekly schedule.`;
  }

  // Exams / online tests
  if (q.includes("exam") || q.includes("test") || q.includes("online exam")) {
    const exams = getExams().filter(
      (e) => e.class === studentClass && e.status === "active",
    );
    if (exams.length === 0)
      return "📝 No active exams are assigned to your class right now. Check back later!";
    const list = exams
      .slice(0, 5)
      .map(
        (e) =>
          `  • **${e.title}** (${e.subject}) — ${e.duration} min, ${e.questions.length} questions`,
      )
      .join("\n");
    return `📝 Active exams for Class ${studentClass}:\n\n${list}\n\nGo to "Online Exams" to attempt them.`;
  }

  // Notifications / announcements
  if (q.includes("notification") || q.includes("announcement")) {
    const notifs = getNotifications().slice(0, 3);
    if (notifs.length === 0)
      return "🔔 No announcements from school right now.";
    const list = notifs
      .map((n) => `  • **${n.title}** — ${formatDate(n.date)}`)
      .join("\n");
    return `🔔 Latest school announcements:\n\n${list}\n\nVisit "Notifications" for the full list and homework details.`;
  }

  // Leave applications
  if (q.includes("leave") || q.includes("application")) {
    const leaves = getLeaves().filter((l) => l.applicantId === userId);
    if (leaves.length === 0)
      return '📋 You haven\'t submitted any leave applications yet. Go to "Leave Application" to apply.';
    const pending = leaves.filter((l) => l.status === "pending").length;
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
    return `📋 Your leave applications:\n\n• Pending: ${pending}\n• Approved: ${approved}\n• Rejected: ${rejected}\n• Total: ${leaves.length}\n\nGo to "Leave Application" to submit a new one.`;
  }

  // Greetings
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `👋 Hello! Great to see you! I'm your school AI assistant.\n\nI can help you check:\n• 📊 Attendance percentage\n• 🎓 Exam results & grades\n• 💳 Fee status\n• 📚 Homework due\n• 📝 Active exams\n• 🗓️ Timetable\n• 🔔 Announcements\n\nWhat would you like to know today?`;
  }

  // Fallback
  return '🤖 I can help you with attendance, results, fees, homework, exams, timetable, notifications, and leave applications.\n\nTry asking something like:\n• "What is my attendance?"\n• "Show my latest results"\n• "When is my next exam?"\n• "What homework is due?"\n• "Check my fees"';
}

function AIAssistant({ user, studentClass }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I'm your school AI assistant. Ask me anything about your attendance, results, fees, homework, or exams.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const responseText = generateAIResponse(trimmed, user.id, studentClass);
    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: responseText,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        text: "Hello! I'm your school AI assistant. Ask me anything about your attendance, results, fees, homework, or exams.",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
    inputRef.current?.focus();
  };

  // Render text with basic markdown bold (**text**)
  const renderText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, li) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: static line split
        <span key={li}>
          {parts.map((part, pi) =>
            pi % 2 === 1 ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: static part split
              <strong key={pi} className="font-semibold">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
          {li < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="section-title">AI Assistant</h2>
          <p className="section-subtitle">
            Your personal school assistant — ask anything
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          className="gap-1.5 text-muted-foreground"
          data-ocid="ai_assistant.clear_button"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Chat
        </Button>
      </div>

      {/* Quick question chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={q}
            type="button"
            onClick={() => sendMessage(q)}
            disabled={isTyping}
            data-ocid={`ai_assistant.quick_question.${idx + 1}` as string}
            className="shrink-0 px-3 py-1.5 rounded-full border border-border bg-background text-sm text-foreground hover:bg-accent hover:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {renderText(msg.text)}
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === "user"
                      ? "text-primary-foreground/60 text-right"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-3 bg-background flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your attendance, results, fees..."
            disabled={isTyping}
            data-ocid="ai_assistant.chat_input"
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary/30 focus:outline-none disabled:opacity-50 transition-colors"
          />
          <Button
            size="sm"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            data-ocid="ai_assistant.send_button"
            className="rounded-xl h-10 w-10 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Student Dashboard Root
// ============================================================
export default function StudentDashboard({ user, onLogout }: Props) {
  const [section, setSection] = useState("overview");
  const [hasVisitedAssistant, setHasVisitedAssistant] = useState(false);
  const welcomeKey = `edur_welcomed_${user.id}`;
  const [showWelcome, setShowWelcome] = useState(
    () => !sessionStorage.getItem(welcomeKey),
  );
  const student = getStudentById(user.id);
  const studentClass = student?.class ?? user.class ?? "10A";

  const openAssistant = () => {
    setSection("assistant");
    setHasVisitedAssistant(true);
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "results",
      label: "My Results",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "progress",
      label: "My Progress",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "timetable",
      label: "Timetable",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "exams",
      label: "Online Exams",
      icon: <BookOpenCheck className="w-4 h-4" />,
    },
    {
      id: "fees",
      label: "Fee Status",
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: "leave",
      label: "Leave Application",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: "suggestions",
      label: "Suggestions & Queries",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "assistant",
      label: "AI Assistant",
      icon: <Bot className="w-4 h-4" />,
    },
    {
      id: "games",
      label: "Learning Games",
      icon: <Gamepad2 className="w-4 h-4" />,
    },
  ];

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <Overview user={user} />;
      case "results":
        return <MyResults studentId={user.id} />;
      case "progress":
        return <MyProgress studentId={user.id} />;
      case "timetable":
        return <MyTimetable studentClass={studentClass} />;
      case "exams":
        return <OnlineExamsStudent user={user} />;
      case "fees":
        return <FeeStatus studentId={user.id} />;
      case "notifications":
        return <StudentNotifications studentClass={studentClass} />;
      case "attendance":
        return <MyAttendance studentId={user.id} />;
      case "leave":
        return <StudentLeave user={user} />;
      case "suggestions":
        return <SuggestionsAndQueries user={user} />;
      case "profile":
        return <StudentProfile studentId={user.id} />;
      case "assistant":
        return <AIAssistant user={user} studentClass={studentClass} />;
      case "games":
        return (
          <LearningGames
            studentId={user.id}
            studentName={user.name}
            studentClass={studentClass}
          />
        );
      default:
        return <Overview user={user} />;
    }
  };

  return (
    <>
      {showWelcome && (
        <StudentWelcomeScreen
          studentName={user.name}
          studentId={user.id}
          photoUrl={student?.photo}
          onDismiss={() => setShowWelcome(false)}
        />
      )}
      <DashboardLayout
        user={user}
        navItems={navItems}
        activeSection={section}
        onSectionChange={(s) => {
          if (s === "assistant") setHasVisitedAssistant(true);
          setSection(s);
        }}
        onLogout={onLogout}
      >
        {renderSection()}

        {/* Floating AI Assistant button */}
        {section !== "assistant" && (
          <button
            type="button"
            onClick={openAssistant}
            data-ocid="ai_assistant.floating_button"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
            title="Open AI Assistant"
          >
            <Bot className="w-6 h-6" />
            {!hasVisitedAssistant && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
            )}
          </button>
        )}
      </DashboardLayout>
    </>
  );
}
