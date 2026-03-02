import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/LoginPage";
import PrincipalDashboard from "@/pages/principal/PrincipalDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import { type CurrentUser, getCurrentUser, initializeData } from "@/store/data";
import { useEffect, useState } from "react";

// Initialize seed data on first load
initializeData();

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const stored = getCurrentUser();
    setUser(stored);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-white"
              aria-hidden="true"
            >
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Loading EduManage Pro...
          </p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) return <LoginPage onLogin={handleLogin} />;

    switch (user.role) {
      case "principal":
        return <PrincipalDashboard user={user} onLogout={handleLogout} />;
      case "teacher":
        return <TeacherDashboard user={user} onLogout={handleLogout} />;
      case "student":
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <Toaster position="top-right" richColors />
    </>
  );
}
