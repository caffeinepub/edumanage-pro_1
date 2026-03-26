import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface Props {
  studentName: string;
  studentId: string;
  photoUrl?: string | null;
  onDismiss: () => void;
}

async function playWelcomeChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }
    const notes = [523, 659, 784]; // C, E, G
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.18 + 0.35,
      );
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.4);
    });
  } catch (_) {}
}

function speakWelcome(name: string) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`Welcome to EduR, ${name}!`);
    utter.pitch = 1.2;
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  } catch (_) {}
}

const SPARKLE_POSITIONS = [
  { top: "10%", left: "12%", delay: "0s", size: 18, id: "s1" },
  { top: "8%", left: "75%", delay: "0.4s", size: 14, id: "s2" },
  { top: "20%", left: "88%", delay: "0.7s", size: 20, id: "s3" },
  { top: "70%", left: "8%", delay: "0.2s", size: 16, id: "s4" },
  { top: "75%", left: "82%", delay: "0.9s", size: 12, id: "s5" },
  { top: "45%", left: "4%", delay: "1.1s", size: 10, id: "s6" },
  { top: "40%", left: "92%", delay: "0.5s", size: 14, id: "s7" },
  { top: "85%", left: "50%", delay: "0.3s", size: 10, id: "s8" },
];

export default function StudentWelcomeScreen({
  studentName,
  studentId,
  photoUrl,
  onDismiss,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    // Mark session
    sessionStorage.setItem(`edur_welcomed_${studentId}`, "1");

    // Trigger mount animation
    requestAnimationFrame(() => setMounted(true));

    // Sound
    playWelcomeChime().catch(() => {});
    setTimeout(() => speakWelcome(studentName), 400);

    // Show button after 1s
    buttonTimerRef.current = setTimeout(() => setShowButton(true), 1000);

    // Progress bar: 3 seconds = 3000ms, update every 50ms
    const total = 3000;
    const step = 50;
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += step;
      setProgress(Math.min((elapsed / total) * 100, 100));
      if (elapsed >= total) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, step);

    // Auto-dismiss after 3s
    timerRef.current = setTimeout(() => {
      onDismissRef.current();
    }, total);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
    };
  }, [studentId, studentName]);

  const firstName = studentName.split(" ")[0];

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: welcome overlay intentionally click-to-dismiss only
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
      }}
      data-ocid="student_welcome.modal"
    >
      {/* Sparkles */}
      {SPARKLE_POSITIONS.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            fontSize: s.size,
            animationName: "sparkleFloat",
            animationDuration: "2.5s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: s.delay,
            opacity: 0.85,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✦
        </span>
      ))}

      {/* Avatar */}
      <div
        style={{
          marginBottom: 24,
          transform: mounted
            ? "translateY(0) scale(1)"
            : "translateY(30px) scale(0.8)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.85)",
            boxShadow:
              "0 0 0 8px rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.25)",
            overflow: "hidden",
            animationName: "avatarBounce",
            animationDuration: "2s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: "0.6s",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={studentName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 60, lineHeight: 1 }}>🧑‍🎓</span>
          )}
        </div>
      </div>

      {/* Welcome text */}
      <div
        style={{
          textAlign: "center",
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s, opacity 0.6s ease 0.2s",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            fontWeight: 800,
            margin: 0,
            textShadow: "0 2px 12px rgba(0,0,0,0.25)",
            letterSpacing: "-0.01em",
          }}
        >
          Welcome back, {firstName}! 🎉
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: "clamp(1rem, 3vw, 1.25rem)",
            marginTop: 10,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            opacity: mounted ? 1 : 0,
            transition: "transform 0.6s ease 0.5s, opacity 0.6s ease 0.5s",
          }}
        >
          Ready to learn today? 📚
        </p>
      </div>

      {/* Let's Go button */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation div wrapper */}
      <div
        style={{
          marginTop: 36,
          opacity: showButton ? 1 : 0,
          transform: showButton
            ? "translateY(0) scale(1)"
            : "translateY(10px) scale(0.95)",
          transition:
            "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: showButton ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onDismiss}
          style={{
            background: "white",
            color: "#6366f1",
            fontWeight: 700,
            fontSize: "1rem",
            padding: "12px 32px",
            borderRadius: 999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            border: "none",
          }}
          data-ocid="student_welcome.primary_button"
        >
          Let&apos;s Go! →
        </Button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 5,
          background: "rgba(255,255,255,0.25)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "white",
            transition: "width 0.05s linear",
            borderRadius: "0 4px 4px 0",
          }}
        />
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes avatarBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.85; }
          50% { transform: translateY(-16px) rotate(20deg); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
