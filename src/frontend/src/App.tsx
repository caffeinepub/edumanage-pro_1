import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/LoginPage";
import PrincipalDashboard from "@/pages/principal/PrincipalDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import {
  type CurrentUser,
  getCurrentUser,
  getSyncStatus,
  initializeBackend,
  subscribeSyncStatus,
} from "@/store/data";
import { Loader2, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus);

  useEffect(() => {
    const unsub = subscribeSyncStatus(setSyncStatus);
    return unsub;
  }, []);

  useEffect(() => {
    // Initialize backend (load from canister) then restore session
    initializeBackend().finally(() => {
      const stored = getCurrentUser();
      setUser(stored);
      setLoading(false);
    });
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
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Connecting to school server...
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
      {/* Global sync status indicator */}
      {syncStatus === "syncing" && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground text-xs font-medium px-3 py-2 rounded-full shadow-lg"
          data-ocid="app.loading_state"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Syncing data...
        </div>
      )}
      {syncStatus === "error" && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-destructive text-destructive-foreground text-xs font-medium px-3 py-2 rounded-full shadow-lg"
          data-ocid="app.error_state"
        >
          <WifiOff className="w-3 h-3" />
          Offline mode
        </div>
      )}
      <Toaster position="top-right" richColors />
    </>
  );
}
