import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Star } from "lucide-react";
import { useRef, useState } from "react";

// Body parts with their approximate position on the body figure (% of container)
const BODY_PARTS = [
  { id: "head", label: "Head", emoji: "🧠", x: 50, y: 8 },
  { id: "eyes", label: "Eyes", emoji: "👀", x: 50, y: 14 },
  { id: "nose", label: "Nose", emoji: "👃", x: 50, y: 18 },
  { id: "mouth", label: "Mouth", emoji: "👄", x: 50, y: 22 },
  { id: "ears", label: "Ears", emoji: "👂", x: 50, y: 17 },
  { id: "neck", label: "Neck", emoji: "🔛", x: 50, y: 27 },
  { id: "shoulders", label: "Shoulders", emoji: "💪", x: 50, y: 33 },
  { id: "chest", label: "Chest", emoji: "❤️", x: 50, y: 40 },
  { id: "tummy", label: "Tummy", emoji: "🫃", x: 50, y: 50 },
  { id: "hands", label: "Hands", emoji: "🤲", x: 50, y: 60 },
  { id: "knees", label: "Knees", emoji: "🦵", x: 50, y: 73 },
  { id: "feet", label: "Feet", emoji: "👣", x: 50, y: 90 },
];

// The game has rounds: each round shows 4 labels; the player drags one to the correct spot.
const ROUNDS = [
  {
    partId: "head",
    hint: "I sit on TOP of your body!",
    clue: "Where you think and dream 🌙",
  },
  {
    partId: "eyes",
    hint: "I help you SEE the world!",
    clue: "Two of me on your face 👁️👁️",
  },
  {
    partId: "nose",
    hint: "I help you SMELL flowers!",
    clue: "Right in the middle of your face",
  },
  {
    partId: "mouth",
    hint: "I help you EAT and TALK!",
    clue: "You smile with me 😄",
  },
  {
    partId: "ears",
    hint: "I help you HEAR music!",
    clue: "One on each side of your head",
  },
  {
    partId: "neck",
    hint: "I connect your head and body!",
    clue: "Turns left and right 🔄",
  },
  {
    partId: "shoulders",
    hint: "I help you CARRY heavy bags!",
    clue: "Arms hang from me 💪",
  },
  {
    partId: "chest",
    hint: "Your HEART beats inside me!",
    clue: "Breathe in, breathe out ❤️",
  },
  {
    partId: "tummy",
    hint: "I DIGEST the food you eat!",
    clue: "Gets hungry and full 🍱",
  },
  {
    partId: "hands",
    hint: "I help you WRITE and DRAW!",
    clue: "10 fingers total ✋",
  },
  {
    partId: "knees",
    hint: "I help you BEND your legs!",
    clue: "You have one on each leg",
  },
  {
    partId: "feet",
    hint: "I help you WALK and RUN!",
    clue: "You stand on me all day 👣",
  },
];

interface Props {
  studentName?: string;
  onBack: () => void;
  onComplete: (stars: number, score: number, total: number) => void;
}

export default function BodyLabelGame({
  studentName: _studentName,
  onBack,
  onComplete,
}: Props) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const [wrongZone, setWrongZone] = useState<string | null>(null);
  const figureRef = useRef<HTMLDivElement>(null);

  const total = ROUNDS.length;
  const round = ROUNDS[roundIdx];
  const correctPart = BODY_PARTS.find((p) => p.id === round.partId)!;

  // Generate 4 options: correct + 3 random others
  function getOptions(partId: string) {
    const others = BODY_PARTS.filter((p) => p.id !== partId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...others, correctPart].sort(() => Math.random() - 0.5);
  }
  const [options] = useState(() => ROUNDS.map((r) => getOptions(r.partId)));

  function handleDrop(zoneId: string) {
    if (!dragging || feedback) return;
    if (dragging === round.partId) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setWrongZone(null);
      setTimeout(() => {
        setFeedback(null);
        if (roundIdx + 1 >= total) setDone(true);
        else setRoundIdx((i) => i + 1);
        setDragging(null);
      }, 1300);
    } else {
      setFeedback("wrong");
      setWrongZone(zoneId);
      setTimeout(() => {
        setFeedback(null);
        setWrongZone(null);
        setDragging(null);
      }, 1000);
    }
  }

  function handleTapZone(zoneId: string) {
    if (dragging) handleDrop(zoneId);
  }

  function handleRestart() {
    setRoundIdx(0);
    setScore(0);
    setDone(false);
    setFeedback(null);
    setDragging(null);
    setWrongZone(null);
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-6 text-center">
        <div className="text-6xl">
          {stars === 3 ? "🏆" : stars === 2 ? "🥈" : "🥉"}
        </div>
        <h2 className="text-2xl font-bold">Body Label Challenge Done!</h2>
        <div className="flex gap-1 justify-center">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-10 h-10 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-xl font-semibold">
          {score} / {total} correct ({pct}%)
        </p>
        <p className="text-muted-foreground">
          {pct >= 90
            ? "Amazing! You know your body parts perfectly! 🌟"
            : pct >= 60
              ? "Great job! Keep practising! 👍"
              : "Good try! Let's learn more together! 💪"}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
          <Button onClick={() => onComplete(stars, score, total)}>Done</Button>
        </div>
      </div>
    );
  }

  const roundOptions = options[roundIdx];

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto px-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">🫀 Label My Body!</h2>
          <p className="text-xs text-muted-foreground">
            Drag or tap the correct label onto the body
          </p>
        </div>
        <div className="ml-auto text-sm font-semibold text-muted-foreground">
          {roundIdx + 1}/{total}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-400 h-2 rounded-full transition-all"
          style={{ width: `${(roundIdx / total) * 100}%` }}
        />
      </div>

      {/* Hint */}
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-center">
        <p className="text-2xl mb-1">{correctPart.emoji}</p>
        <p className="font-bold text-yellow-800 text-lg">{round.hint}</p>
        <p className="text-yellow-600 text-sm mt-1">{round.clue}</p>
      </div>

      {/* Drag options */}
      <div className="flex flex-wrap gap-2 justify-center">
        {roundOptions.map((part) => (
          <button
            key={part.id}
            type="button"
            draggable
            onDragStart={() => setDragging(part.id)}
            onDragEnd={() => setDragging(null)}
            onClick={() => setDragging(dragging === part.id ? null : part.id)}
            className={`px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all select-none cursor-grab active:cursor-grabbing ${
              dragging === part.id
                ? "bg-blue-500 text-white border-blue-600 scale-105 shadow-lg"
                : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            {part.emoji} {part.label}
          </button>
        ))}
      </div>

      {dragging && (
        <p className="text-center text-sm text-blue-600 font-medium animate-pulse">
          ✋ Now tap the correct spot on the body!
        </p>
      )}

      {/* Body figure with drop zones */}
      <div
        ref={figureRef}
        className="relative mx-auto w-56 select-none"
        style={{ height: 380 }}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Simple SVG body figure */}
        <svg
          viewBox="0 0 100 200"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Human body diagram"
        >
          <title>Human body diagram</title>
          {/* Head */}
          <ellipse
            cx="50"
            cy="18"
            rx="14"
            ry="16"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.5"
          />
          {/* Eyes */}
          <circle cx="44" cy="15" r="2" fill="#4A3728" />
          <circle cx="56" cy="15" r="2" fill="#4A3728" />
          {/* Nose */}
          <ellipse cx="50" cy="19" rx="1.5" ry="2" fill="#C8956C" />
          {/* Mouth */}
          <path
            d="M45 23 Q50 27 55 23"
            stroke="#C8956C"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Ears */}
          <ellipse
            cx="35"
            cy="18"
            rx="3"
            ry="4"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.2"
          />
          <ellipse
            cx="65"
            cy="18"
            rx="3"
            ry="4"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.2"
          />
          {/* Neck */}
          <rect
            x="45"
            y="33"
            width="10"
            height="10"
            rx="3"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1"
          />
          {/* Body / Torso */}
          <rect
            x="32"
            y="43"
            width="36"
            height="50"
            rx="6"
            fill="#93C5FD"
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
          {/* Arms */}
          <rect
            x="18"
            y="45"
            width="13"
            height="40"
            rx="6"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.2"
          />
          <rect
            x="69"
            y="45"
            width="13"
            height="40"
            rx="6"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.2"
          />
          {/* Hands */}
          <ellipse
            cx="24"
            cy="88"
            rx="6"
            ry="5"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.2"
          />
          <ellipse
            cx="76"
            cy="88"
            rx="6"
            ry="5"
            fill="#FDDBB4"
            stroke="#C8956C"
            strokeWidth="1.2"
          />
          {/* Legs */}
          <rect
            x="35"
            y="93"
            width="12"
            height="60"
            rx="6"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <rect
            x="53"
            y="93"
            width="12"
            height="60"
            rx="6"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          {/* Knees */}
          <circle
            cx="41"
            cy="135"
            r="5"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="1"
          />
          <circle
            cx="59"
            cy="135"
            r="5"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="1"
          />
          {/* Feet */}
          <ellipse
            cx="40"
            cy="158"
            rx="8"
            ry="4"
            fill="#A78BFA"
            stroke="#7C3AED"
            strokeWidth="1.2"
          />
          <ellipse
            cx="60"
            cy="158"
            rx="8"
            ry="4"
            fill="#A78BFA"
            stroke="#7C3AED"
            strokeWidth="1.2"
          />
          {/* Chest heart detail */}
          <text x="47" y="62" fontSize="8" textAnchor="middle">
            ❤️
          </text>
        </svg>

        {/* Drop zones overlaid on figure */}
        {[
          { id: "head", top: "2%", left: "25%", w: "50%", h: "16%" },
          { id: "eyes", top: "10%", left: "30%", w: "40%", h: "8%" },
          { id: "nose", top: "17%", left: "38%", w: "24%", h: "7%" },
          { id: "mouth", top: "23%", left: "35%", w: "30%", h: "7%" },
          { id: "ears", top: "10%", left: "10%", w: "80%", h: "10%" },
          { id: "neck", top: "30%", left: "38%", w: "24%", h: "8%" },
          { id: "shoulders", top: "37%", left: "15%", w: "70%", h: "8%" },
          { id: "chest", top: "44%", left: "28%", w: "44%", h: "12%" },
          { id: "tummy", top: "55%", left: "28%", w: "44%", h: "12%" },
          { id: "hands", top: "62%", left: "5%", w: "90%", h: "8%" },
          { id: "knees", top: "72%", left: "22%", w: "56%", h: "8%" },
          { id: "feet", top: "88%", left: "18%", w: "64%", h: "10%" },
        ].map((zone) => {
          const isTarget = zone.id === round.partId;
          const isWrong = wrongZone === zone.id;
          const isCorrect = feedback === "correct" && isTarget;
          return (
            <button
              type="button"
              key={zone.id}
              className={`absolute rounded-lg border-2 transition-all cursor-pointer ${
                isCorrect
                  ? "bg-green-400/50 border-green-500"
                  : isWrong
                    ? "bg-red-400/50 border-red-500 animate-bounce"
                    : dragging
                      ? "border-dashed border-blue-300 bg-blue-50/30 hover:bg-blue-100/50"
                      : "border-transparent"
              }`}
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.w,
                height: zone.h,
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              onClick={() => handleTapZone(zone.id)}
            >
              {isCorrect && (
                <span className="absolute inset-0 flex items-center justify-center text-xl">
                  ✅
                </span>
              )}
              {isWrong && (
                <span className="absolute inset-0 flex items-center justify-center text-xl">
                  ❌
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Score */}
      <div className="flex justify-center gap-1">
        {ROUNDS.map((r, i) => (
          <div
            key={r.partId}
            className={`w-2 h-2 rounded-full ${
              i < roundIdx
                ? "bg-green-400"
                : i === roundIdx
                  ? "bg-blue-400 animate-pulse"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
