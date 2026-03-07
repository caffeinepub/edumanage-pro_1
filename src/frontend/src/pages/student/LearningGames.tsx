import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────────────────────
type Level = "LKG" | "UKG" | "1" | "2" | "3" | "4";
type GameId =
  | "alphabet-match"
  | "number-counting"
  | "word-builder"
  | "spell-the-word"
  | "maths-challenge"
  | "sentence-scramble";
type Subject = "English" | "Maths";
type GameScreen = "start" | "play" | "end";

function parseLevel(cls: string): Level {
  const upper = cls.trim().toUpperCase();
  if (upper === "LKG") return "LKG";
  if (upper === "UKG") return "UKG";
  const num = Number.parseInt(cls.trim(), 10);
  if (!Number.isNaN(num) && num >= 1 && num <= 4) return String(num) as Level;
  if (
    cls.trim().length > 0 &&
    !Number.isNaN(Number.parseInt(cls.charAt(0), 10))
  ) {
    const n = Number.parseInt(cls.charAt(0), 10);
    if (n >= 1 && n <= 4) return String(n) as Level;
  }
  return "1";
}

function saveScore(gameId: GameId, studentId: string, stars: number) {
  const key = `game_score_${gameId}_${studentId}`;
  const existing = Number.parseInt(localStorage.getItem(key) ?? "0", 10);
  if (stars > existing) localStorage.setItem(key, String(stars));
}

function loadScore(gameId: GameId, studentId: string): number {
  return Number.parseInt(
    localStorage.getItem(`game_score_${gameId}_${studentId}`) ?? "0",
    10,
  );
}

function calcStars(score: number, total: number): number {
  if (total === 0) return 1;
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  return 1;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────────────────────
// Game Metadata
// ─────────────────────────────────────────────────────────────
interface GameMeta {
  id: GameId;
  name: string;
  subject: Subject;
  levels: Level[];
  emoji: string;
  description: string;
  instructions: string;
  ageRange: string;
}

const GAMES: GameMeta[] = [
  {
    id: "alphabet-match",
    name: "Alphabet Match",
    subject: "English",
    levels: ["LKG", "UKG"],
    emoji: "🔤",
    description: "Match uppercase and lowercase letters!",
    instructions:
      "Tap two cards to flip them. Match the CAPITAL letter (A) with its small letter (a). Match all pairs to win! 🎉",
    ageRange: "LKG – UKG",
  },
  {
    id: "number-counting",
    name: "Number Counting",
    subject: "Maths",
    levels: ["LKG", "UKG"],
    emoji: "🔢",
    description: "Count the objects and pick the right number!",
    instructions:
      "Look at the picture carefully and count how many objects you see. Then tap the correct number! 🍎",
    ageRange: "LKG – UKG",
  },
  {
    id: "word-builder",
    name: "Word Builder",
    subject: "English",
    levels: ["UKG", "1"],
    emoji: "🏗️",
    description: "Arrange letters to spell the word!",
    instructions:
      "Look at the picture and hint. Tap the letters in the right order to spell the word! 🐱",
    ageRange: "UKG – Class 1",
  },
  {
    id: "spell-the-word",
    name: "Spell the Word",
    subject: "English",
    levels: ["1", "2"],
    emoji: "✏️",
    description: "Pick the correct spelling from the choices!",
    instructions:
      "Read the clue carefully and choose the correct spelling of the word from the four options! 🍎",
    ageRange: "Class 1 – 2",
  },
  {
    id: "maths-challenge",
    name: "Maths Challenge",
    subject: "Maths",
    levels: ["1", "2", "3", "4"],
    emoji: "🧮",
    description: "Solve maths questions before time runs out!",
    instructions:
      "Answer as many maths questions as you can in 60 seconds! Read each sum and tap the correct answer. Fast and correct wins! ⏱️",
    ageRange: "Class 1 – 4",
  },
  {
    id: "sentence-scramble",
    name: "Sentence Scramble",
    subject: "English",
    levels: ["3", "4"],
    emoji: "📝",
    description: "Put the words in the right order to make a sentence!",
    instructions:
      "The words of a sentence are all mixed up! Tap the words in the correct order to build the proper sentence. 🧩",
    ageRange: "Class 3 – 4",
  },
];

// ─────────────────────────────────────────────────────────────
// Stars Display
// ─────────────────────────────────────────────────────────────
function Stars({
  count,
  size = "md",
}: {
  count: number;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "lg" ? "w-10 h-10" : size === "md" ? "w-7 h-7" : "w-4 h-4";
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          className={`${sz} transition-all duration-300`}
          fill={s <= count ? "#facc15" : "transparent"}
          stroke={s <= count ? "#f59e0b" : "#9ca3af"}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        dur: 1.5 + Math.random() * 1.5,
        color: [
          "#facc15",
          "#f87171",
          "#34d399",
          "#60a5fa",
          "#c084fc",
          "#fb923c",
        ][i % 6],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Game Shell
// ─────────────────────────────────────────────────────────────
interface GameShellProps {
  meta: GameMeta;
  screen: GameScreen;
  stars: number;
  score: number;
  total: number;
  extraSummary?: React.ReactNode;
  onStart: () => void;
  onPlayAgain: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

function GameShell({
  meta,
  screen,
  stars,
  score,
  total,
  extraSummary,
  onStart,
  onPlayAgain,
  onBack,
  children,
}: GameShellProps) {
  const isEnglish = meta.subject === "English";

  if (screen === "start") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl mb-4 animate-bounce">{meta.emoji}</div>
        <h2 className="text-3xl font-extrabold text-foreground mb-2">
          {meta.name}
        </h2>
        <Badge
          className="mb-5 text-sm px-3 py-1"
          style={{
            background: isEnglish
              ? "oklch(0.88 0.15 264)"
              : "oklch(0.88 0.15 150)",
            color: isEnglish ? "oklch(0.25 0.15 264)" : "oklch(0.22 0.12 150)",
          }}
        >
          {meta.subject} · {meta.ageRange}
        </Badge>
        <div className="bg-card border-2 border-border rounded-3xl p-6 mb-8 max-w-sm text-left shadow-md">
          <p className="text-2xl font-bold mb-3">📋 How to Play</p>
          <p className="text-base text-foreground leading-relaxed">
            {meta.instructions}
          </p>
        </div>
        <Button
          size="lg"
          data-ocid="games.start_button"
          className="text-xl px-10 py-6 rounded-2xl font-extrabold"
          style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}
          onClick={onStart}
        >
          🎮 Let's Play!
        </Button>
        <button
          type="button"
          onClick={onBack}
          data-ocid="games.back_button"
          className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
      </div>
    );
  }

  if (screen === "end") {
    const won = stars >= 2;
    return (
      <>
        {stars === 3 && <Confetti />}
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center relative">
          <div className="text-6xl mb-3">
            {stars === 3 ? "🏆" : stars === 2 ? "🎉" : "💪"}
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-1">
            {won ? "Great job!" : "Keep trying!"}
          </h2>
          <p className="text-muted-foreground mb-5">{meta.name}</p>

          <Stars count={stars} size="lg" />

          <div className="bg-card border-2 border-border rounded-3xl p-6 mt-5 mb-7 min-w-[240px] shadow-md">
            <p className="text-5xl font-extrabold text-foreground mb-1">
              {score}/{total}
            </p>
            <p className="text-muted-foreground">Correct answers</p>
            {extraSummary}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              size="lg"
              data-ocid="games.play_again_button"
              onClick={onPlayAgain}
              className="rounded-2xl font-bold px-7 py-5 text-base"
              style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}
            >
              🔄 Play Again
            </Button>
            <Button
              size="lg"
              variant="outline"
              data-ocid="games.back_to_hub_button"
              onClick={onBack}
              className="rounded-2xl font-bold px-7 py-5 text-base"
            >
              🏠 Back to Games
            </Button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

// ─────────────────────────────────────────────────────────────
// GAME 1: Alphabet Match
// ─────────────────────────────────────────────────────────────
const LETTER_PAIRS = "ABCDEFGH".split("");

interface AlphabetCard {
  id: string;
  letter: string;
  isUpper: boolean;
  pairKey: string;
  flipped: boolean;
  matched: boolean;
}

function buildAlphabetCards(): AlphabetCard[] {
  const cards: AlphabetCard[] = [];
  for (const l of LETTER_PAIRS) {
    cards.push({
      id: `upper-${l}`,
      letter: l,
      isUpper: true,
      pairKey: l,
      flipped: false,
      matched: false,
    });
    cards.push({
      id: `lower-${l}`,
      letter: l.toLowerCase(),
      isUpper: false,
      pairKey: l,
      flipped: false,
      matched: false,
    });
  }
  return shuffleArray(cards);
}

function AlphabetMatchGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number) => void;
}) {
  const meta = GAMES[0];
  const [screen, setScreen] = useState<GameScreen>("start");
  const [cards, setCards] = useState<AlphabetCard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);
  const lockRef = useRef(false);

  const init = useCallback(() => {
    setCards(buildAlphabetCards());
    setSelected([]);
    setMistakes(0);
    setStars(0);
    lockRef.current = false;
  }, []);

  const start = () => {
    init();
    setScreen("play");
  };
  const replay = () => {
    init();
    setScreen("play");
  };

  const flipCard = useCallback((id: string) => {
    if (lockRef.current) return;
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      return prev.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    });
    setSelected((prev) => {
      if (prev.includes(id) || prev.length >= 2) return prev;
      return [...prev, id];
    });
  }, []);

  useEffect(() => {
    if (selected.length !== 2) return;
    lockRef.current = true;
    const [a, b] = selected;
    // Read card data at time of effect
    setCards((prev) => {
      const ca = prev.find((c) => c.id === a);
      const cb = prev.find((c) => c.id === b);
      if (!ca || !cb) return prev;
      const isMatch = ca.pairKey === cb.pairKey && ca.isUpper !== cb.isUpper;
      if (isMatch) {
        setTimeout(() => {
          setCards((p) =>
            p.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c,
            ),
          );
          setSelected([]);
          lockRef.current = false;
        }, 700);
      } else {
        setTimeout(() => {
          setMistakes((m) => m + 1);
          setCards((p) =>
            p.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
          lockRef.current = false;
        }, 700);
      }
      return prev;
    });
  }, [selected]);

  // Check win
  useEffect(() => {
    if (screen !== "play") return;
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      const finalStars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
      setStars(finalStars);
      saveScore(meta.id, studentId, finalStars);
      setTimeout(() => {
        setScreen("end");
        onDone(finalStars);
      }, 400);
    }
  }, [cards, screen, mistakes, meta.id, studentId, onDone]);

  const matched = cards.filter((c) => c.matched).length / 2;

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={matched}
      total={LETTER_PAIRS.length}
      extraSummary={
        <p className="text-sm text-muted-foreground mt-1">
          Mistakes: {mistakes}
        </p>
      }
      onStart={start}
      onPlayAgain={replay}
      onBack={onBack}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="games.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <div className="flex gap-4 text-sm font-semibold">
            <span>
              ✅ {matched}/{LETTER_PAIRS.length}
            </span>
            <span className="text-destructive">❌ {mistakes}</span>
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-center mb-5">
          {meta.emoji} {meta.name}
        </h2>
        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => flipCard(card.id)}
              data-ocid={`games.alphabet.item.${idx + 1}`}
              disabled={card.flipped || card.matched}
              className="aspect-square rounded-2xl flex items-center justify-center text-2xl font-extrabold transition-all duration-300 border-2 select-none"
              style={{
                minHeight: 64,
                background: card.matched
                  ? "oklch(0.88 0.15 150)"
                  : card.flipped
                    ? "oklch(0.88 0.12 264)"
                    : "oklch(0.30 0.12 264)",
                color: card.matched
                  ? "oklch(0.25 0.12 150)"
                  : card.flipped
                    ? "oklch(0.22 0.12 264)"
                    : "#fff",
                borderColor: card.matched
                  ? "oklch(0.65 0.18 150)"
                  : card.flipped
                    ? "oklch(0.55 0.15 264)"
                    : "oklch(0.40 0.12 264)",
                boxShadow: card.matched
                  ? "0 0 12px oklch(0.65 0.18 150 / 0.4)"
                  : undefined,
                transform:
                  card.flipped || card.matched ? "scale(1.05)" : "scale(1)",
              }}
            >
              {card.flipped || card.matched ? card.letter : "?"}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Match each CAPITAL letter with its small letter 🔤
        </p>
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 2: Number Counting
// ─────────────────────────────────────────────────────────────
const COUNT_EMOJIS = [
  "🍎",
  "🌟",
  "🐶",
  "🦋",
  "🍭",
  "🐸",
  "🌈",
  "🎈",
  "🐥",
  "🍕",
];

function buildCountingQuestion(round: number) {
  const count = Math.floor(Math.random() * 10) + 1;
  const emoji = COUNT_EMOJIS[round % COUNT_EMOJIS.length];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) {
    const w = Math.max(1, count + Math.floor(Math.random() * 7) - 3);
    wrong.add(w);
  }
  const emojiKeys = Array.from(
    { length: count },
    (_, n) => `${round}-emoji-${n}`,
  );
  return { count, emoji, options: shuffleArray([...wrong]), emojiKeys };
}

function NumberCountingGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number) => void;
}) {
  const meta = GAMES[1];
  const ROUNDS = 10;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState(() => buildCountingQuestion(0));
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setQuestion(buildCountingQuestion(0));
    setChosen(null);
    setFeedback(null);
  }, []);

  const start = () => {
    init();
    setScreen("play");
  };
  const replay = () => {
    init();
    setScreen("play");
  };

  const pick = (n: number) => {
    if (chosen !== null) return;
    setChosen(n);
    const correct = n === question.count;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        const newScore = correct ? score + 1 : score;
        const s = calcStars(newScore, ROUNDS);
        setStars(s);
        saveScore(meta.id, studentId, s);
        setScreen("end");
        onDone(s);
      } else {
        setRound(nextRound);
        setQuestion(buildCountingQuestion(nextRound));
        setChosen(null);
        setFeedback(null);
      }
    }, 900);
  };

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={ROUNDS}
      onStart={start}
      onPlayAgain={replay}
      onBack={onBack}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="games.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <span className="text-sm font-semibold">
            Round {round + 1}/{ROUNDS} · ✅ {score}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-center mb-2">
          {meta.emoji} {meta.name}
        </h2>
        <p className="text-center text-muted-foreground mb-5">
          How many {question.emoji} do you see?
        </p>

        <div
          className="bg-card border-2 border-border rounded-3xl p-5 max-w-xs mx-auto mb-6 flex flex-wrap gap-2 justify-center min-h-[120px] items-center"
          style={{ fontSize: 36 }}
        >
          {question.emojiKeys.map((k) => (
            <span key={k} className="select-none">
              {question.emoji}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {question.options.map((opt, pos) => {
            let bg = "oklch(0.95 0.02 264)";
            let col = "oklch(0.18 0.04 264)";
            if (chosen !== null) {
              if (opt === question.count) {
                bg = "oklch(0.88 0.15 150)";
                col = "oklch(0.22 0.12 150)";
              } else if (opt === chosen) {
                bg = "oklch(0.93 0.12 25)";
                col = "oklch(0.45 0.2 25)";
              }
            }
            return (
              <button
                key={`opt-${opt}`}
                type="button"
                onClick={() => pick(opt)}
                disabled={chosen !== null}
                data-ocid={`games.counting.option.${pos + 1}`}
                className="py-4 text-3xl font-extrabold rounded-2xl border-2 transition-all"
                style={{
                  background: bg,
                  color: col,
                  borderColor: "transparent",
                  minHeight: 64,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <p
            className="text-center mt-4 text-2xl font-bold"
            style={{
              color:
                feedback === "correct"
                  ? "oklch(0.45 0.18 150)"
                  : "oklch(0.45 0.2 25)",
            }}
          >
            {feedback === "correct"
              ? "✅ Correct!"
              : `❌ It was ${question.count}`}
          </p>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 3: Word Builder
// ─────────────────────────────────────────────────────────────
const WORD_BUILDER_LIST = [
  { word: "CAT", hint: "🐱 A furry pet that meows" },
  { word: "DOG", hint: "🐶 A pet that barks" },
  { word: "SUN", hint: "☀️ It shines in the sky" },
  { word: "BUS", hint: "🚌 It takes many people" },
  { word: "EGG", hint: "🥚 A hen lays this" },
  { word: "ANT", hint: "🐜 A tiny insect" },
  { word: "CUP", hint: "☕ You drink from this" },
  { word: "FAN", hint: "💨 It keeps you cool" },
];

const DECOY_LETTERS = "XZQWVY".split("");

function buildWordBuilderQuestion(idx: number) {
  const { word, hint } = WORD_BUILDER_LIST[idx];
  const letters = word.split("");
  const decoys = shuffleArray(DECOY_LETTERS).slice(0, 2);
  const tiles = shuffleArray([...letters, ...decoys]);
  const slotKeys = word.split("").map((l, n) => `${word}-slot-${n}-${l}`);
  return { word, hint, tiles, slotKeys };
}

function WordBuilderGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number) => void;
}) {
  const meta = GAMES[2];
  const TOTAL = WORD_BUILDER_LIST.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState(() => buildWordBuilderQuestion(0));
  const [typed, setTyped] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setQuestion(buildWordBuilderQuestion(0));
    setTyped([]);
    setFeedback(null);
    setUsedIndices([]);
  }, []);

  const start = () => {
    init();
    setScreen("play");
  };
  const replay = () => {
    init();
    setScreen("play");
  };

  const tapLetter = (letter: string, tileIdx: number) => {
    if (usedIndices.includes(tileIdx) || feedback !== null) return;
    const newTyped = [...typed, letter];
    const newUsed = [...usedIndices, tileIdx];
    setTyped(newTyped);
    setUsedIndices(newUsed);

    if (newTyped.length === question.word.length) {
      const correct = newTyped.join("") === question.word;
      setFeedback(correct ? "correct" : "wrong");
      if (correct) setScore((s) => s + 1);
      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL) {
          const newScore = correct ? score + 1 : score;
          const s = calcStars(newScore, TOTAL);
          setStars(s);
          saveScore(meta.id, studentId, s);
          setScreen("end");
          onDone(s);
        } else {
          setRound(nextRound);
          setQuestion(buildWordBuilderQuestion(nextRound));
          setTyped([]);
          setFeedback(null);
          setUsedIndices([]);
        }
      }, 1000);
    }
  };

  const removeLast = () => {
    if (typed.length === 0 || feedback !== null) return;
    setTyped((t) => t.slice(0, -1));
    setUsedIndices((u) => u.slice(0, -1));
  };

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={start}
      onPlayAgain={replay}
      onBack={onBack}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="games.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <span className="text-sm font-semibold">
            Word {round + 1}/{TOTAL} · ✅ {score}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-center mb-2">
          {meta.emoji} {meta.name}
        </h2>

        <div className="bg-card border-2 border-border rounded-3xl p-5 max-w-xs mx-auto mb-5 text-center">
          <p className="text-3xl mb-1">{question.hint}</p>
          <p className="text-sm text-muted-foreground">Spell this word!</p>
        </div>

        <div className="flex gap-2 justify-center mb-5">
          {question.slotKeys.map((slotKey, pos) => (
            <div
              key={slotKey}
              className="w-12 h-14 rounded-xl border-b-4 flex items-center justify-center text-2xl font-extrabold transition-all"
              style={{
                borderColor:
                  feedback === "correct"
                    ? "oklch(0.55 0.18 150)"
                    : feedback === "wrong"
                      ? "oklch(0.55 0.2 25)"
                      : "oklch(0.55 0.15 264)",
                background: typed[pos]
                  ? feedback === "correct"
                    ? "oklch(0.88 0.15 150)"
                    : feedback === "wrong"
                      ? "oklch(0.93 0.1 25)"
                      : "oklch(0.88 0.12 264)"
                  : "transparent",
                color:
                  feedback === "correct"
                    ? "oklch(0.22 0.12 150)"
                    : feedback === "wrong"
                      ? "oklch(0.45 0.2 25)"
                      : "oklch(0.18 0.04 264)",
              }}
            >
              {typed[pos] ?? ""}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto mb-4">
          {question.tiles.map((letter, tilePos) => (
            <button
              key={`tile-${tilePos}-${letter}`}
              type="button"
              onClick={() => tapLetter(letter, tilePos)}
              disabled={usedIndices.includes(tilePos) || feedback !== null}
              data-ocid={`games.wordbuilder.tile.${tilePos + 1}`}
              className="w-12 h-14 rounded-xl text-xl font-extrabold transition-all border-2"
              style={{
                background: usedIndices.includes(tilePos)
                  ? "oklch(0.92 0.02 264)"
                  : "oklch(0.30 0.12 264)",
                color: usedIndices.includes(tilePos)
                  ? "oklch(0.6 0.02 264)"
                  : "#fff",
                borderColor: usedIndices.includes(tilePos)
                  ? "transparent"
                  : "oklch(0.45 0.12 264)",
                opacity: usedIndices.includes(tilePos) ? 0.4 : 1,
              }}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={removeLast}
            disabled={typed.length === 0 || feedback !== null}
            data-ocid="games.wordbuilder.clear_button"
            className="px-5 py-2 rounded-xl text-sm font-semibold border-2 border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
          >
            ← Remove Last
          </button>
        </div>

        {feedback && (
          <p
            className="text-center mt-4 text-2xl font-bold"
            style={{
              color:
                feedback === "correct"
                  ? "oklch(0.45 0.18 150)"
                  : "oklch(0.45 0.2 25)",
            }}
          >
            {feedback === "correct"
              ? "✅ Correct!"
              : `❌ It's "${question.word}"`}
          </p>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 4: Spell the Word
// ─────────────────────────────────────────────────────────────
const SPELL_QUESTIONS = [
  {
    hint: "🍎 A red fruit that grows on trees",
    correct: "Apple",
    options: ["Apple", "Aple", "Appel", "Aplle"],
  },
  {
    hint: "🐘 The largest land animal with a trunk",
    correct: "Elephant",
    options: ["Elifant", "Elephant", "Elaphant", "Elephent"],
  },
  {
    hint: "🌺 A beautiful thing that blooms in a garden",
    correct: "Flower",
    options: ["Flouwer", "Flowr", "Flower", "Flowur"],
  },
  {
    hint: "📚 You read and learn from this",
    correct: "Book",
    options: ["Bok", "Boek", "Book", "Buke"],
  },
  {
    hint: "🌧️ Water that falls from the clouds",
    correct: "Rain",
    options: ["Rane", "Rain", "Rien", "Rein"],
  },
  {
    hint: "🏫 The place where you study",
    correct: "School",
    options: ["Scool", "Schol", "Shool", "School"],
  },
  {
    hint: "🍌 A yellow fruit monkeys love",
    correct: "Banana",
    options: ["Banana", "Banena", "Bannana", "Bananna"],
  },
  {
    hint: "🐦 An animal that flies and has feathers",
    correct: "Bird",
    options: ["Berd", "Bryd", "Bird", "Brid"],
  },
  {
    hint: "🌙 It shines in the night sky",
    correct: "Moon",
    options: ["Mun", "Mon", "Moon", "Mone"],
  },
  {
    hint: "🏃 Moving very fast on your feet",
    correct: "Running",
    options: ["Runing", "Runnig", "Running", "Runig"],
  },
];

function SpellWordGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number) => void;
}) {
  const meta = GAMES[3];
  const TOTAL = SPELL_QUESTIONS.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const q = SPELL_QUESTIONS[round];

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setChosen(null);
    setFeedback(null);
  }, []);

  const start = () => {
    init();
    setScreen("play");
  };
  const replay = () => {
    init();
    setScreen("play");
  };

  const pick = (opt: string) => {
    if (chosen !== null) return;
    setChosen(opt);
    const correct = opt === q.correct;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        const newScore = correct ? score + 1 : score;
        const s = calcStars(newScore, TOTAL);
        setStars(s);
        saveScore(meta.id, studentId, s);
        setScreen("end");
        onDone(s);
      } else {
        setRound(nextRound);
        setChosen(null);
        setFeedback(null);
      }
    }, 900);
  };

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={start}
      onPlayAgain={replay}
      onBack={onBack}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="games.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <span className="text-sm font-semibold">
            Q {round + 1}/{TOTAL} · ✅ {score}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-center mb-4">
          {meta.emoji} {meta.name}
        </h2>

        <div className="bg-card border-2 border-border rounded-3xl p-6 max-w-sm mx-auto mb-6 text-center">
          <p className="text-2xl leading-relaxed">{q.hint}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
          {q.options.map((opt, idx) => {
            let bg = "oklch(0.95 0.02 264)";
            let col = "oklch(0.18 0.04 264)";
            let border = "oklch(0.88 0.02 264)";
            if (chosen !== null) {
              if (opt === q.correct) {
                bg = "oklch(0.88 0.15 150)";
                col = "oklch(0.22 0.12 150)";
                border = "oklch(0.65 0.18 150)";
              } else if (opt === chosen) {
                bg = "oklch(0.93 0.1 25)";
                col = "oklch(0.45 0.2 25)";
                border = "oklch(0.55 0.2 25)";
              }
            }
            return (
              <button
                key={opt}
                type="button"
                onClick={() => pick(opt)}
                disabled={chosen !== null}
                data-ocid={`games.spell.option.${idx + 1}`}
                className="py-4 px-6 text-xl font-bold rounded-2xl border-2 transition-all text-left"
                style={{
                  background: bg,
                  color: col,
                  borderColor: border,
                  minHeight: 56,
                }}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <p
            className="text-center mt-5 text-2xl font-bold"
            style={{
              color:
                feedback === "correct"
                  ? "oklch(0.45 0.18 150)"
                  : "oklch(0.45 0.2 25)",
            }}
          >
            {feedback === "correct" ? "✅ Correct!" : `❌ It's "${q.correct}"`}
          </p>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 5: Maths Challenge
// ─────────────────────────────────────────────────────────────
function buildMathsQuestion(level: Level): {
  q: string;
  answer: number;
  options: number[];
} {
  let a: number;
  let b: number;
  let op: string;
  let ans: number;

  if (level === "LKG" || level === "UKG" || level === "1") {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    op = "+";
    ans = a + b;
  } else if (level === "2") {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    op = Math.random() > 0.5 ? "+" : "-";
    if (op === "-") {
      if (a < b) {
        const tmp = a;
        a = b;
        b = tmp;
      }
      ans = a - b;
    } else {
      ans = a + b;
    }
  } else if (level === "3") {
    const table = Math.floor(Math.random() * 4) + 2;
    b = Math.floor(Math.random() * 10) + 1;
    a = table;
    op = "×";
    ans = a * b;
  } else {
    a = Math.floor(Math.random() * 50) + 1;
    b = Math.floor(Math.random() * 50) + 1;
    const ops = ["+", "-", "×"];
    op = ops[Math.floor(Math.random() * ops.length)];
    if (op === "+") {
      ans = a + b;
    } else if (op === "-") {
      if (a < b) {
        const tmp = a;
        a = b;
        b = tmp;
      }
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      ans = a * b;
      op = "×";
    }
  }

  const wrong = new Set<number>([ans]);
  while (wrong.size < 4) {
    const w = Math.max(0, ans + Math.floor(Math.random() * 10) - 5);
    wrong.add(w);
  }
  return {
    q: `${a} ${op} ${b} = ?`,
    answer: ans,
    options: shuffleArray([...wrong]),
  };
}

function MathsChallengeGame({
  studentId,
  level,
  onBack,
  onDone,
}: {
  studentId: string;
  level: Level;
  onBack: () => void;
  onDone: (stars: number) => void;
}) {
  const meta = GAMES[4];
  const TIME = 60;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [question, setQuestion] = useState(() => buildMathsQuestion(level));
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [total, setTotal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const totalRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const endGame = useCallback(
    (finalScore: number, finalTotal: number) => {
      stopTimer();
      const s =
        finalTotal === 0 ? 1 : calcStars(finalScore, Math.max(finalTotal, 1));
      setStars(s);
      saveScore(meta.id, studentId, s);
      setScreen("end");
      onDone(s);
    },
    [meta.id, studentId, onDone, stopTimer],
  );

  useEffect(() => {
    if (screen !== "play") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endGame(scoreRef.current, totalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [screen, endGame, stopTimer]);

  const init = useCallback(() => {
    stopTimer();
    setScore(0);
    setStars(0);
    setTotal(0);
    setTimeLeft(TIME);
    setQuestion(buildMathsQuestion(level));
    setChosen(null);
    setFeedback(null);
    scoreRef.current = 0;
    totalRef.current = 0;
  }, [level, stopTimer]);

  const start = () => {
    init();
    setScreen("play");
  };
  const replay = () => {
    init();
    setScreen("play");
  };

  const pick = (opt: number) => {
    if (chosen !== null) return;
    setChosen(opt);
    const correct = opt === question.answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setScore((s) => {
        scoreRef.current = s + 1;
        return s + 1;
      });
    }
    setTotal((t) => {
      totalRef.current = t + 1;
      return t + 1;
    });
    setTimeout(() => {
      setQuestion(buildMathsQuestion(level));
      setChosen(null);
      setFeedback(null);
    }, 500);
  };

  const timerColor =
    timeLeft <= 10
      ? "oklch(0.55 0.22 25)"
      : timeLeft <= 20
        ? "oklch(0.65 0.18 70)"
        : "oklch(0.45 0.15 150)";

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={total}
      extraSummary={
        <p className="text-sm text-muted-foreground mt-1">
          Questions attempted: {total}
        </p>
      }
      onStart={start}
      onPlayAgain={replay}
      onBack={onBack}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="games.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span>✅ {score}</span>
            <span
              className="font-mono text-lg font-extrabold px-3 py-1 rounded-xl"
              style={{
                background: `${timerColor}20`,
                color: timerColor,
              }}
            >
              ⏱ {timeLeft}s
            </span>
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-center mb-6">
          {meta.emoji} {meta.name}
        </h2>

        <div className="bg-card border-2 border-border rounded-3xl p-8 max-w-sm mx-auto mb-6 text-center">
          <p className="text-5xl font-extrabold text-foreground">
            {question.q}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {question.options.map((opt, optPos) => {
            let bg = "oklch(0.95 0.02 264)";
            let col = "oklch(0.18 0.04 264)";
            if (chosen !== null) {
              if (opt === question.answer) {
                bg = "oklch(0.88 0.15 150)";
                col = "oklch(0.22 0.12 150)";
              } else if (opt === chosen) {
                bg = "oklch(0.93 0.1 25)";
                col = "oklch(0.45 0.2 25)";
              }
            }
            return (
              <button
                key={`mopt-${opt}`}
                type="button"
                onClick={() => pick(opt)}
                disabled={chosen !== null}
                data-ocid={`games.maths.option.${optPos + 1}`}
                className="py-5 text-3xl font-extrabold rounded-2xl border-2 transition-all"
                style={{
                  background: bg,
                  color: col,
                  borderColor: "transparent",
                  minHeight: 72,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <p
            className="text-center mt-4 text-xl font-bold"
            style={{
              color:
                feedback === "correct"
                  ? "oklch(0.45 0.18 150)"
                  : "oklch(0.45 0.2 25)",
            }}
          >
            {feedback === "correct"
              ? "✅ Correct!"
              : `❌ Answer: ${question.answer}`}
          </p>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 6: Sentence Scramble
// ─────────────────────────────────────────────────────────────
const SENTENCES = [
  "The sun shines bright in the sky",
  "I love to read books every day",
  "Birds can fly very high up",
  "She walks to school every morning",
  "The dog runs fast in the park",
  "We drink water to stay healthy",
  "Rain falls from the dark clouds",
  "He plays football with his friends",
];

function buildScrambleQuestion(idx: number) {
  const sentence = SENTENCES[idx];
  const words = sentence.split(" ");
  return { sentence, words, tiles: shuffleArray([...words]) };
}

function SentenceScrambleGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number) => void;
}) {
  const meta = GAMES[5];
  const TOTAL = SENTENCES.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState(() => buildScrambleQuestion(0));
  const [selected, setSelected] = useState<{ word: string; tileIdx: number }[]>(
    [],
  );
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setQuestion(buildScrambleQuestion(0));
    setSelected([]);
    setFeedback(null);
  }, []);

  const start = () => {
    init();
    setScreen("play");
  };
  const replay = () => {
    init();
    setScreen("play");
  };

  const tapWord = (word: string, tileIdx: number) => {
    if (feedback !== null) return;
    const already = selected.findIndex((s) => s.tileIdx === tileIdx);
    if (already >= 0) {
      setSelected((s) => s.filter((_, i) => i !== already));
      return;
    }
    const newSelected = [...selected, { word, tileIdx }];
    setSelected(newSelected);

    if (newSelected.length === question.words.length) {
      const formed = newSelected.map((s) => s.word).join(" ");
      const correct = formed === question.sentence;
      setFeedback(correct ? "correct" : "wrong");
      if (correct) setScore((s) => s + 1);
      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL) {
          const newScore = correct ? score + 1 : score;
          const s = calcStars(newScore, TOTAL);
          setStars(s);
          saveScore(meta.id, studentId, s);
          setScreen("end");
          onDone(s);
        } else {
          setRound(nextRound);
          setQuestion(buildScrambleQuestion(nextRound));
          setSelected([]);
          setFeedback(null);
        }
      }, 1200);
    }
  };

  const removeWord = (idx: number) => {
    if (feedback !== null) return;
    setSelected((s) => s.filter((_, i) => i !== idx));
  };

  const usedIndices = selected.map((s) => s.tileIdx);

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={start}
      onPlayAgain={replay}
      onBack={onBack}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            data-ocid="games.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <span className="text-sm font-semibold">
            Sentence {round + 1}/{TOTAL} · ✅ {score}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-center mb-2">
          {meta.emoji} {meta.name}
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Tap the words in the right order!
        </p>

        <div
          className="min-h-[56px] bg-card border-2 rounded-2xl p-3 flex flex-wrap gap-2 items-center mb-5 max-w-lg mx-auto"
          style={{
            borderColor:
              feedback === "correct"
                ? "oklch(0.65 0.18 150)"
                : feedback === "wrong"
                  ? "oklch(0.55 0.2 25)"
                  : "oklch(0.55 0.15 264)",
          }}
        >
          {selected.length === 0 && (
            <span className="text-sm text-muted-foreground italic">
              Tap words below to build your sentence...
            </span>
          )}
          {selected.map((s, idx) => (
            <button
              key={`sel-${s.tileIdx}-${idx}`}
              type="button"
              onClick={() => removeWord(idx)}
              disabled={feedback !== null}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all"
              style={{
                background: "oklch(0.88 0.12 264)",
                color: "oklch(0.22 0.12 264)",
                borderColor: "oklch(0.65 0.15 264)",
              }}
            >
              {s.word} ×
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
          {question.tiles.map((word, wordPos) => (
            <button
              key={`stile-${wordPos}-${word}`}
              type="button"
              onClick={() => tapWord(word, wordPos)}
              disabled={usedIndices.includes(wordPos) || feedback !== null}
              data-ocid={`games.scramble.tile.${wordPos + 1}`}
              className="px-4 py-3 rounded-xl text-base font-bold border-2 transition-all"
              style={{
                background: usedIndices.includes(wordPos)
                  ? "oklch(0.92 0.02 264)"
                  : "oklch(0.30 0.12 264)",
                color: usedIndices.includes(wordPos)
                  ? "oklch(0.6 0.02 264)"
                  : "#fff",
                borderColor: usedIndices.includes(wordPos)
                  ? "transparent"
                  : "oklch(0.45 0.12 264)",
                opacity: usedIndices.includes(wordPos) ? 0.4 : 1,
                minHeight: 48,
              }}
            >
              {word}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="text-center mt-5">
            <p
              className="text-2xl font-bold"
              style={{
                color:
                  feedback === "correct"
                    ? "oklch(0.45 0.18 150)"
                    : "oklch(0.45 0.2 25)",
              }}
            >
              {feedback === "correct" ? "✅ Correct!" : "❌ Not quite!"}
            </p>
            {feedback === "wrong" && (
              <p className="text-sm text-muted-foreground mt-1">
                Correct: &quot;{question.sentence}&quot;
              </p>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Games Hub
// ─────────────────────────────────────────────────────────────
function GamesHub({
  level,
  scores,
  onPlay,
}: {
  level: Level;
  scores: Record<GameId, number>;
  onPlay: (gameId: GameId) => void;
}) {
  const available = GAMES.filter((g) => g.levels.includes(level));
  const locked = GAMES.filter((g) => !g.levels.includes(level));

  return (
    <div>
      <h2 className="section-title">🎮 Learning Games</h2>
      <p className="section-subtitle">
        Fun games for Class {level} students — learn English &amp; Maths while
        playing!
      </p>

      {available.length === 0 && (
        <div
          className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground"
          data-ocid="games.empty_state"
        >
          <p className="text-4xl mb-3">🎮</p>
          <p className="font-semibold text-lg">
            No games available for your class level yet.
          </p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      )}

      {available.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {available.map((game, idx) => {
            const bestStars = scores[game.id];
            const isEnglish = game.subject === "English";
            return (
              <div
                key={game.id}
                data-ocid={`games.item.${idx + 1}`}
                className="bg-card border-2 rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                style={{
                  borderColor: isEnglish
                    ? "oklch(0.80 0.12 264)"
                    : "oklch(0.78 0.12 150)",
                }}
              >
                <div className="text-5xl text-center">{game.emoji}</div>
                <div className="text-center">
                  <h3 className="text-lg font-extrabold text-foreground mb-1">
                    {game.name}
                  </h3>
                  <span
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-1"
                    style={{
                      background: isEnglish
                        ? "oklch(0.88 0.12 264)"
                        : "oklch(0.88 0.15 150)",
                      color: isEnglish
                        ? "oklch(0.25 0.15 264)"
                        : "oklch(0.22 0.12 150)",
                    }}
                  >
                    {game.subject}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {game.ageRange}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  {game.description}
                </p>

                {bestStars > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Best Score
                    </p>
                    <Stars count={bestStars} size="sm" />
                  </div>
                )}

                <Button
                  data-ocid={`games.play_button.${idx + 1}`}
                  className="w-full rounded-2xl font-extrabold text-base py-5"
                  style={{
                    background: isEnglish
                      ? "oklch(0.48 0.15 264)"
                      : "oklch(0.45 0.18 150)",
                    color: "#fff",
                  }}
                  onClick={() => onPlay(game.id)}
                >
                  {bestStars > 0 ? "▶ Play Again" : "🎮 Play"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-muted-foreground mb-3">
            🔒 More games unlock as you advance
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((game) => (
              <div
                key={game.id}
                className="bg-muted/40 border border-dashed border-border rounded-3xl p-5 text-center opacity-60"
              >
                <div className="text-4xl mb-2">🔒</div>
                <p className="font-bold text-muted-foreground">{game.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {game.ageRange}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────
export default function LearningGames({
  studentId,
  studentClass,
}: {
  studentId: string;
  studentClass: string;
}) {
  const level = parseLevel(studentClass);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [scores, setScores] = useState<Record<GameId, number>>(() => {
    const s: Partial<Record<GameId, number>> = {};
    for (const g of GAMES) s[g.id] = loadScore(g.id, studentId);
    return s as Record<GameId, number>;
  });

  const handleDone = useCallback((gameId: GameId, stars: number) => {
    setScores((prev) => ({
      ...prev,
      [gameId]: Math.max(prev[gameId] ?? 0, stars),
    }));
  }, []);

  const handleBack = useCallback(() => setActiveGame(null), []);

  // Inject confetti keyframe once
  useEffect(() => {
    const id = "confetti-keyframe";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  if (activeGame === "alphabet-match") {
    return (
      <AlphabetMatchGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s) => handleDone("alphabet-match", s)}
      />
    );
  }
  if (activeGame === "number-counting") {
    return (
      <NumberCountingGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s) => handleDone("number-counting", s)}
      />
    );
  }
  if (activeGame === "word-builder") {
    return (
      <WordBuilderGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s) => handleDone("word-builder", s)}
      />
    );
  }
  if (activeGame === "spell-the-word") {
    return (
      <SpellWordGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s) => handleDone("spell-the-word", s)}
      />
    );
  }
  if (activeGame === "maths-challenge") {
    return (
      <MathsChallengeGame
        studentId={studentId}
        level={level}
        onBack={handleBack}
        onDone={(s) => handleDone("maths-challenge", s)}
      />
    );
  }
  if (activeGame === "sentence-scramble") {
    return (
      <SentenceScrambleGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s) => handleDone("sentence-scramble", s)}
      />
    );
  }

  return (
    <div data-ocid="games.section">
      <GamesHub
        level={level}
        scores={scores}
        onPlay={(gameId) => setActiveGame(gameId)}
      />
    </div>
  );
}
