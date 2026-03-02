import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Role, authenticate, setCurrentUser } from "@/store/data";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = authenticate(userRole, id.trim(), password.trim());
      if (user) {
        setCurrentUser(user);
        toast.success(`Welcome, ${user.name}!`);
        onLogin();
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 400);
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

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "oklch(var(--sidebar))" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/rahmaniyya-logo-transparent.dim_300x300.png"
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
            A comprehensive school management platform for principals, teachers,
            and students — all in one place.
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
          {/* School logo + name — always visible on mobile, visible on desktop too */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src="/assets/generated/rahmaniyya-logo-transparent.dim_300x300.png"
              alt="Rahmaniyya Public School logo"
              className="w-28 h-28 object-contain mb-3"
            />
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Rahmaniyya Public School
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 tracking-wide uppercase">
              Akampadam
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Sign in to your account to continue
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-xs p-6">
            <Tabs defaultValue="principal">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="principal">Principal</TabsTrigger>
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
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
                <div className="mb-3 p-2 bg-accent rounded-md">
                  <p className="text-xs text-muted-foreground">
                    Also try: <strong>student002</strong>–
                    <strong>student005</strong>
                  </p>
                </div>
                <LoginForm
                  userRole="student"
                  label="Student"
                  demoId="student001"
                  demoPassword="student123"
                  onLogin={onLogin}
                />
              </TabsContent>
            </Tabs>
          </div>

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
  );
}
