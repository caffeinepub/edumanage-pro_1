import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/LoginPage";
import PrincipalDashboard from "@/pages/principal/PrincipalDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import {
  type CurrentUser,
  getCurrentUser,
  getRetryMessage,
  getSyncStatus,
  initializeBackend,
  retryBackendConnection,
  subscribeRetryMessage,
  subscribeSyncStatus,
} from "@/store/data";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus);
  const [retryMessage, setRetryMessage] = useState(getRetryMessage);
  const [isRetrying, setIsRetrying] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub1 = subscribeSyncStatus(setSyncStatus);
    const unsub2 = subscribeRetryMessage(setRetryMessage);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  useEffect(() => {
    // Initialize backend (load from canister) then restore session
    initializeBackend().finally(() => {
      const stored = getCurrentUser();
      setUser(stored);
      setLoading(false);
    });
  }, []);

  // Background heartbeat: auto-retry every 30s when in error state
  useEffect(() => {
    if (syncStatus === "error") {
      heartbeatRef.current = setInterval(async () => {
        try {
          await retryBackendConnection();
        } catch {
          // silent — status listener will update
        }
      }, 15000);
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [syncStatus]);

  // Reconnect instantly when tab becomes visible again or network comes back
  useEffect(() => {
    const handleReconnect = async () => {
      if (syncStatus === "error") {
        try {
          await retryBackendConnection();
        } catch {
          // silent
        }
      }
    };
    window.addEventListener("online", handleReconnect);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleReconnect();
    });
    return () => {
      window.removeEventListener("online", handleReconnect);
    };
  }, [syncStatus]);

  const handleManualRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await retryBackendConnection();
    } finally {
      setIsRetrying(false);
    }
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
        <div className="text-center max-w-xs px-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <img
              src="/assets/uploads/logo-rah-2-1.png"
              alt="EduR"
              className="w-6 h-6 object-contain"
            />
          </div>
          <p className="text-base font-bold text-foreground mb-2">EduR</p>
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {retryMessage || "Loading EduR..."}
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
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-destructive text-destructive-foreground text-xs font-medium px-4 py-2.5 shadow-lg"
          data-ocid="app.error_state"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>
              Reconnecting to server... Your data is safe. Auto-retrying every
              15s.
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-xs shrink-0"
            onClick={handleManualRetry}
            disabled={isRetrying}
            data-ocid="app.retry_button"
          >
            {isRetrying ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span className="ml-1">
              {isRetrying ? "Retrying..." : "Retry Now"}
            </span>
          </Button>
        </div>
      )}
      <Toaster position="top-right" richColors />
    </>
  );
}
