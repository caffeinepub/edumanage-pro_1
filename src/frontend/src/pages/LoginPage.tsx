import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type Role,
  authenticateAsync,
  getPrincipalProfile,
  setCurrentUser,
} from "@/store/data";
import { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: () => void;
}

function LoginForm({
  userRole,
  label,
  demoId,
  demoPassword,
  onLogin,
}: {
  userRole: Role;
  label: string;
  demoId: string;
  demoPassword: string;
  onLogin: () => void;
}) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authenticateAsync(
        userRole,
        id.trim(),
        password.trim(),
      );
      if (user) {
        setCurrentUser(user);
        toast.success(`Welcome, ${user.name}!`);
        onLogin();
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setId(demoId);
    setPassword(demoPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${userRole}-id`}>{label} ID</Label>
        <Input
          id={`${userRole}-id`}
          placeholder={`Enter your ${label.toLowerCase()} ID`}
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          autoComplete="username"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${userRole}-password`}>Password</Label>
        <Input
          id={`${userRole}-password`}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : `Sign in as ${label}`}
      </Button>
      <div className="rounded-md bg-accent border border-border p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">Demo Credentials</p>
        <p className="text-muted-foreground">
          ID:{" "}
          <code className="bg-background px-1 rounded text-foreground font-mono text-xs">
            {demoId}
          </code>
        </p>
        <p className="text-muted-foreground">
          Password:{" "}
          <code className="bg-background px-1 rounded text-foreground font-mono text-xs">
            {demoPassword}
          </code>
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-2 text-xs text-primary font-medium hover:underline"
        >
          Click to auto-fill →
        </button>
      </div>
    </form>
  );
}

// Student-specific login form with animated submit button
function StudentLoginForm({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authenticateAsync(
        "student",
        id.trim(),
        password.trim(),
      );
      if (user) {
        setCurrentUser(user);
        toast.success(`Welcome, ${user.name}!`);
        onLogin();
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setId("student001");
    setPassword("student123");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="student-id">Student ID</Label>
        <Input
          id="student-id"
          placeholder="Enter your student ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          autoComplete="username"
          data-ocid="student.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="student-password">Password</Label>
        <Input
          id="student-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <Button
        type="submit"
        className="w-full font-bold text-base"
        disabled={loading}
        style={{
          animation: loading ? "none" : "buttonPulse 2s ease-in-out infinite",
          background: loading
            ? undefined
            : "linear-gradient(135deg, oklch(0.55 0.22 290), oklch(0.65 0.18 200))",
          border: "none",
        }}
        data-ocid="student.submit_button"
      >
        {loading ? "Signing in... 🚀" : "🎒 Sign in as Student"}
      </Button>
      <div className="rounded-md bg-accent border border-border p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">Demo Credentials</p>
        <p className="text-muted-foreground">
          ID:{" "}
          <code className="bg-background px-1 rounded text-foreground font-mono text-xs">
            student001
          </code>
        </p>
        <p className="text-muted-foreground">
          Password:{" "}
          <code className="bg-background px-1 rounded text-foreground font-mono text-xs">
            student123
          </code>
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-2 text-xs text-primary font-medium hover:underline"
        >
          Click to auto-fill →
        </button>
      </div>
    </form>
  );
}

// Floating emoji particles for student tab — stable ids for React keys
const FLOATING_EMOJIS = [
  {
    id: "star",
    emoji: "🌟",
    left: "8%",
    duration: "4s",
    delay: "0s",
    size: 20,
  },
  {
    id: "books",
    emoji: "📚",
    left: "22%",
    duration: "5s",
    delay: "0.8s",
    size: 18,
  },
  {
    id: "pencil",
    emoji: "✏️",
    left: "38%",
    duration: "3.5s",
    delay: "0.3s",
    size: 20,
  },
  {
    id: "backpack",
    emoji: "🎒",
    left: "55%",
    duration: "6s",
    delay: "1.2s",
    size: 22,
  },
  {
    id: "school",
    emoji: "🏫",
    left: "70%",
    duration: "4.5s",
    delay: "0.5s",
    size: 18,
  },
  {
    id: "crayon",
    emoji: "🖍️",
    left: "82%",
    duration: "5.5s",
    delay: "1.8s",
    size: 20,
  },
  {
    id: "glowstar",
    emoji: "⭐",
    left: "15%",
    duration: "3.8s",
    delay: "2.2s",
    size: 24,
  },
  {
    id: "palette",
    emoji: "🎨",
    left: "48%",
    duration: "4.2s",
    delay: "0.1s",
    size: 18,
  },
  {
    id: "numbers",
    emoji: "🔢",
    left: "90%",
    duration: "5.2s",
    delay: "1.5s",
    size: 20,
  },
  {
    id: "grad",
    emoji: "🎓",
    left: "32%",
    duration: "3.2s",
    delay: "2.8s",
    size: 22,
  },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const principalProfile = getPrincipalProfile();
  const logoSrc =
    principalProfile.institutionLogo || "/assets/uploads/logo-rah-2-1.png";

  const [activeTab, setActiveTab] = useState("principal");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "student") {
      try {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            "Hi there! Ready to learn today?",
          );
          utterance.pitch = 1.3;
          utterance.rate = 0.85;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        }
      } catch {
        // Speech synthesis not supported — silently skip
      }
    }
  };

  const isStudentTab = activeTab === "student";

  const cardContent = (
    <div className="bg-card border border-border rounded-xl shadow-xs p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="principal" data-ocid="login.principal.tab">
            Principal
          </TabsTrigger>
          <TabsTrigger value="teacher" data-ocid="login.teacher.tab">
            Teacher
          </TabsTrigger>
          <TabsTrigger value="student" data-ocid="login.student.tab">
            Student
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal">
          <LoginForm
            userRole="principal"
            label="Principal"
            demoId="principal001"
            demoPassword="admin123"
            onLogin={onLogin}
          />
        </TabsContent>

        <TabsContent value="teacher">
          <div className="mb-3 p-2 bg-accent rounded-md">
            <p className="text-xs text-muted-foreground">
              Also try: <strong>teacher002</strong> or{" "}
              <strong>teacher003</strong>
            </p>
          </div>
          <LoginForm
            userRole="teacher"
            label="Teacher"
            demoId="teacher001"
            demoPassword="teacher123"
            onLogin={onLogin}
          />
        </TabsContent>

        <TabsContent value="student">
          {/* Animated greeting header */}
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                style={{
                  display: "inline-block",
                  fontSize: "1.8rem",
                  animation: "waveHand 1s ease-in-out infinite",
                  transformOrigin: "70% 70%",
                }}
              >
                👋
              </span>
              <span
                className="text-xl font-bold"
                style={{
                  background: "linear-gradient(90deg, #a855f7, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Hello, Student!
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Let&apos;s learn something amazing today! ✨
            </p>
          </div>

          {/* Floating emoji particles — pointer-events:none so they never block the form */}
          <div
            className="relative overflow-hidden"
            style={{ minHeight: 0 }}
            aria-hidden="true"
          >
            {FLOATING_EMOJIS.map((item) => (
              <span
                key={item.id}
                style={{
                  position: "absolute",
                  left: item.left,
                  bottom: "0",
                  fontSize: `${item.size}px`,
                  animation: `floatUp ${item.duration} ease-in ${item.delay} infinite`,
                  pointerEvents: "none",
                  zIndex: 0,
                  userSelect: "none",
                }}
              >
                {item.emoji}
              </span>
            ))}
          </div>

          <div className="relative z-10">
            <div className="mb-3 p-2 bg-accent rounded-md">
              <p className="text-xs text-muted-foreground">
                Also try: <strong>student002</strong>–
                <strong>student005</strong>
              </p>
            </div>
            <StudentLoginForm onLogin={onLogin} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes waveHand {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes rainbowBorder {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      <div className="min-h-screen bg-background flex">
        {/* Left panel */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
          style={{ backgroundColor: "oklch(var(--sidebar))" }}
        >
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Rahmaniyya Public School logo"
              className="w-11 h-11 object-contain shrink-0"
            />
            <div>
              <p className="text-base font-bold text-white leading-tight">
                Rahmaniyya Public School
              </p>
              <p className="text-xs" style={{ color: "oklch(0.75 0.06 264)" }}>
                Akampadam
              </p>
              <span
                className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "oklch(0.55 0.18 145)",
                  color: "white",
                }}
              >
                EduR
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Empowering Education,
              <br />
              One Dashboard at a Time
            </h1>
            <p
              style={{ color: "oklch(0.75 0.06 264)" }}
              className="text-lg leading-relaxed"
            >
              A comprehensive school management platform for principals,
              teachers, and students — all in one place.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: "Teachers", value: "3+" },
                { label: "Students", value: "5+" },
                { label: "Features", value: "30+" },
                { label: "Dashboards", value: "3" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "oklch(var(--sidebar-accent))" }}
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p
                    style={{ color: "oklch(0.75 0.06 264)" }}
                    className="text-sm"
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: "oklch(0.6 0.04 264)" }} className="text-sm">
            © {new Date().getFullYear()} Rahmaniyya Public School, Akampadam.
          </p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* School logo + name */}
            <div className="flex flex-col items-center text-center mb-8">
              <img
                src={logoSrc}
                alt="Rahmaniyya Public School logo"
                className="w-28 h-28 object-contain mb-3"
              />
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                Rahmaniyya Public School
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 tracking-wide uppercase">
                Akampadam
              </p>
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground tracking-widest uppercase">
                EduR
              </span>
              <p className="text-sm text-muted-foreground mt-3">
                Sign in to your account to continue
              </p>
            </div>

            {/* Animated rainbow border wrapper when student tab is active */}
            {isStudentTab ? (
              <div
                style={{
                  padding: "3px",
                  borderRadius: "calc(0.75rem + 3px)",
                  background:
                    "linear-gradient(90deg, #f472b6, #818cf8, #34d399, #fbbf24, #f472b6)",
                  backgroundSize: "200%",
                  animation: "rainbowBorder 3s linear infinite",
                }}
              >
                {cardContent}
              </div>
            ) : (
              cardContent
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
