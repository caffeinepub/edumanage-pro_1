import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type GameScoreRecord,
  getGameLeaderboardFromBackend,
  getMyGameScoresFromBackend,
  saveGameScoreToBackend,
} from "@/store/data";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Game Audio (Web Audio API)
// ─────────────────────────────────────────────────────────────
interface GameAudioFunctions {
  playCorrect: () => void;
  playWrong: () => void;
  playWin: () => void;
  playGameOver: () => void;
  musicOn: boolean;
  toggleMusic: () => void;
}

// Module-level ref so all game sub-components can call audio without prop drilling
const gameAudioRef: { current: GameAudioFunctions | null } = { current: null };

function useGameAudio(): GameAudioFunctions {
  const [musicOn, setMusicOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("edur_games_music") !== "false";
    } catch {
      return true;
    }
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const musicOnRef = useRef(musicOn);
  useEffect(() => {
    musicOnRef.current = musicOn;
  }, [musicOn]);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  // Pentatonic melody: C5, E5, G5, A5, G5, E5, C5, rest
  const MELODY_NOTES = [
    523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25, 0,
  ];
  const NOTE_DURATION = 0.5; // seconds (120 BPM ≈ 0.5s per beat)

  const playMelodyLoop = useCallback(() => {
    if (!musicOnRef.current) return;
    const ctx = getCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    let t = ctx.currentTime;
    for (const freq of MELODY_NOTES) {
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(1, t + 0.05);
        g.gain.linearRampToValueAtTime(0, t + NOTE_DURATION - 0.05);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + NOTE_DURATION);
      }
      t += NOTE_DURATION;
    }

    const totalDuration = MELODY_NOTES.length * NOTE_DURATION * 1000;
    loopTimeoutRef.current = setTimeout(() => {
      if (musicOnRef.current) playMelodyLoop();
    }, totalDuration - 50);
  }, [getCtx]);

  const stopMelody = useCallback(() => {
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    if (gainRef.current) {
      try {
        gainRef.current.gain.setValueAtTime(
          0,
          gainRef.current.context.currentTime,
        );
      } catch {
        /* ignore */
      }
      gainRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (musicOn) {
      playMelodyLoop();
    } else {
      stopMelody();
    }
    return stopMelody;
  }, [musicOn, playMelodyLoop, stopMelody]);

  const playCorrect = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [523.25, 659.25];
      let t = ctx.currentTime;
      for (const freq of notes) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.3, t);
        g.gain.linearRampToValueAtTime(0, t + 0.08);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
        t += 0.08;
      }
    } catch {
      /* ignore */
    }
  }, [getCtx]);

  const playWrong = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [220.0, 196.0];
      let t = ctx.currentTime;
      for (const freq of notes) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.2, t);
        g.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        t += 0.1;
      }
    } catch {
      /* ignore */
    }
  }, [getCtx]);

  const playWin = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      let t = ctx.currentTime;
      for (const freq of notes) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.4, t);
        g.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        t += 0.1;
      }
    } catch {
      /* ignore */
    }
  }, [getCtx]);

  const playGameOver = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [392.0, 329.63, 261.63];
      let t = ctx.currentTime;
      for (const freq of notes) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.3, t);
        g.gain.linearRampToValueAtTime(0, t + 0.15);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
        t += 0.15;
      }
    } catch {
      /* ignore */
    }
  }, [getCtx]);

  const toggleMusic = useCallback(() => {
    setMusicOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("edur_games_music", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const audio: GameAudioFunctions = {
    playCorrect,
    playWrong,
    playWin,
    playGameOver,
    musicOn,
    toggleMusic,
  };

  // Update module-level ref so sub-components can access without prop drilling
  gameAudioRef.current = audio;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMelody();
      gameAudioRef.current = null;
      try {
        ctxRef.current?.close();
      } catch {
        /* ignore */
      }
    };
  }, [stopMelody]);

  return audio;
}

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
  | "sentence-scramble"
  | "color-match"
  | "rhyming-words"
  | "times-table"
  | "speak-the-word"
  | "listen-and-spell"
  | "picture-pronounce"
  | "story-arrange";
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
  {
    id: "color-match",
    name: "Color Match",
    subject: "English",
    levels: ["LKG", "UKG"],
    emoji: "🎨",
    description: "Tap the box that matches the color name!",
    instructions:
      "A color name is shown. Tap the colored box that matches it! Learn your colors! 🌈",
    ageRange: "LKG – UKG",
  },
  {
    id: "rhyming-words",
    name: "Rhyming Words",
    subject: "English",
    levels: ["1", "2", "3"],
    emoji: "🎵",
    description: "Pick the word that rhymes!",
    instructions:
      "Look at the word shown and find the word that rhymes with it! Words that sound alike rhyme! 🎶",
    ageRange: "Class 1 – 3",
  },
  {
    id: "times-table",
    name: "Times Table Quiz",
    subject: "Maths",
    levels: ["2", "3", "4"],
    emoji: "✖️",
    description: "Answer the times tables as fast as you can!",
    instructions:
      "Solve the multiplication questions before time runs out! Pick the right answer. ⏱️",
    ageRange: "Class 2 – 4",
  },
  {
    id: "speak-the-word",
    name: "Speak the Word",
    subject: "English",
    levels: ["UKG", "1", "2"],
    emoji: "🎤",
    description: "Listen to the word and say it out loud!",
    instructions:
      "A word will be shown and spoken. Press the microphone button and say the word clearly. Try to match the pronunciation! 🎤",
    ageRange: "UKG – Class 2",
  },
  {
    id: "listen-and-spell",
    name: "Listen & Spell",
    subject: "English",
    levels: ["1", "2", "3"],
    emoji: "👂",
    description: "Listen carefully and type the spelling!",
    instructions:
      "You will hear a word spoken out loud. Type the correct spelling of the word in the box. Listen carefully! 👂",
    ageRange: "Class 1 – 3",
  },
  {
    id: "picture-pronounce",
    name: "Picture Pronunciation",
    subject: "English",
    levels: ["LKG", "UKG", "1"],
    emoji: "🖼️",
    description: "See the picture and say the word!",
    instructions:
      "Look at the emoji picture. Press the microphone and say the name of what you see. Speak clearly! 🖼️",
    ageRange: "LKG – Class 1",
  },
  {
    id: "story-arrange",
    name: "Story Builder",
    subject: "English",
    levels: ["2", "3", "4"],
    emoji: "📖",
    description: "Put the story sentences in the right order!",
    instructions:
      "The sentences of a short story are mixed up! Tap them in the correct order to build the story from start to finish. 📖",
    ageRange: "Class 2 – 4",
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
  onDone: (stars: number, score: number, total: number) => void;
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
    setCards((prev) => {
      const ca = prev.find((c) => c.id === a);
      const cb = prev.find((c) => c.id === b);
      if (!ca || !cb) return prev;
      const isMatch = ca.pairKey === cb.pairKey && ca.isUpper !== cb.isUpper;
      if (isMatch) {
        gameAudioRef.current?.playCorrect();
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
        gameAudioRef.current?.playWrong();
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

  useEffect(() => {
    if (screen !== "play") return;
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      const finalStars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
      const matched = cards.filter((c) => c.matched).length / 2;
      setStars(finalStars);
      saveScore(meta.id, studentId, finalStars);
      setTimeout(() => {
        if (finalStars >= 2) gameAudioRef.current?.playWin();
        else gameAudioRef.current?.playGameOver();
        setScreen("end");
        onDone(finalStars, matched, LETTER_PAIRS.length);
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
  onDone: (stars: number, score: number, total: number) => void;
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
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        const newScore = correct ? score + 1 : score;
        const s = calcStars(newScore, ROUNDS);
        setStars(s);
        saveScore(meta.id, studentId, s);
        if (s >= 2) gameAudioRef.current?.playWin();
        else gameAudioRef.current?.playGameOver();
        setScreen("end");
        onDone(s, newScore, ROUNDS);
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
  onDone: (stars: number, score: number, total: number) => void;
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
      if (correct) gameAudioRef.current?.playCorrect();
      else gameAudioRef.current?.playWrong();
      if (correct) setScore((s) => s + 1);
      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL) {
          const newScore = correct ? score + 1 : score;
          const s = calcStars(newScore, TOTAL);
          setStars(s);
          saveScore(meta.id, studentId, s);
          if (s >= 2) gameAudioRef.current?.playWin();
          else gameAudioRef.current?.playGameOver();
          setScreen("end");
          onDone(s, newScore, TOTAL);
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
  onDone: (stars: number, score: number, total: number) => void;
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
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        const newScore = correct ? score + 1 : score;
        const s = calcStars(newScore, TOTAL);
        setStars(s);
        saveScore(meta.id, studentId, s);
        if (s >= 2) gameAudioRef.current?.playWin();
        else gameAudioRef.current?.playGameOver();
        setScreen("end");
        onDone(s, newScore, TOTAL);
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
  onDone: (stars: number, score: number, total: number) => void;
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
      if (s >= 2) gameAudioRef.current?.playWin();
      else gameAudioRef.current?.playGameOver();
      setScreen("end");
      onDone(s, finalScore, finalTotal);
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
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
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
  onDone: (stars: number, score: number, total: number) => void;
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
      if (correct) gameAudioRef.current?.playCorrect();
      else gameAudioRef.current?.playWrong();
      if (correct) setScore((s) => s + 1);
      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL) {
          const newScore = correct ? score + 1 : score;
          const s = calcStars(newScore, TOTAL);
          setStars(s);
          saveScore(meta.id, studentId, s);
          if (s >= 2) gameAudioRef.current?.playWin();
          else gameAudioRef.current?.playGameOver();
          setScreen("end");
          onDone(s, newScore, TOTAL);
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
// GAME 7: Color Match
// ─────────────────────────────────────────────────────────────
interface ColorEntry {
  name: string;
  bg: string;
  text: string;
}

const COLORS: ColorEntry[] = [
  { name: "Red", bg: "#ef4444", text: "#fff" },
  { name: "Blue", bg: "#3b82f6", text: "#fff" },
  { name: "Green", bg: "#22c55e", text: "#fff" },
  { name: "Yellow", bg: "#eab308", text: "#000" },
  { name: "Orange", bg: "#f97316", text: "#fff" },
  { name: "Purple", bg: "#a855f7", text: "#fff" },
];

function buildColorQuestion(round: number) {
  const correct = COLORS[round % COLORS.length];
  const others = shuffleArray(
    COLORS.filter((c) => c.name !== correct.name),
  ).slice(0, 3);
  const options = shuffleArray([correct, ...others]);
  return { colorName: correct.name, correctBg: correct.bg, options };
}

function ColorMatchGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[6];
  const ROUNDS = 10;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState(() => buildColorQuestion(0));
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setQuestion(buildColorQuestion(0));
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

  const pick = (colorName: string) => {
    if (chosen !== null) return;
    setChosen(colorName);
    const correct = colorName === question.colorName;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        const newScore = correct ? score + 1 : score;
        const s = calcStars(newScore, ROUNDS);
        setStars(s);
        saveScore(meta.id, studentId, s);
        if (s >= 2) gameAudioRef.current?.playWin();
        else gameAudioRef.current?.playGameOver();
        setScreen("end");
        onDone(s, newScore, ROUNDS);
      } else {
        setRound(nextRound);
        setQuestion(buildColorQuestion(nextRound));
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

        <div className="bg-card border-2 border-border rounded-3xl p-8 max-w-sm mx-auto mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Find the color:</p>
          <p className="text-5xl font-extrabold text-foreground">
            {question.colorName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          {question.options.map((opt, idx) => {
            let outline = "transparent";
            if (chosen !== null) {
              if (opt.name === question.colorName) outline = "#22c55e";
              else if (opt.name === chosen) outline = "#ef4444";
            }
            return (
              <button
                key={opt.name}
                type="button"
                onClick={() => pick(opt.name)}
                disabled={chosen !== null}
                data-ocid={`games.color.option.${idx + 1}`}
                className="h-24 rounded-3xl font-extrabold text-lg transition-all border-4"
                style={{
                  background: opt.bg,
                  color: opt.text,
                  borderColor: outline,
                  boxShadow:
                    chosen !== null && opt.name === question.colorName
                      ? "0 0 16px #22c55e88"
                      : undefined,
                  transform:
                    chosen !== null &&
                    opt.name === chosen &&
                    opt.name !== question.colorName
                      ? "scale(0.95)"
                      : "scale(1)",
                }}
              >
                {opt.name}
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
            {feedback === "correct"
              ? "✅ Correct!"
              : `❌ It was ${question.colorName}`}
          </p>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 8: Rhyming Words
// ─────────────────────────────────────────────────────────────
const RHYME_PAIRS = [
  { word: "CAT", rhyme: "BAT", others: ["SUN", "DOG"] },
  { word: "BALL", rhyme: "TALL", others: ["FISH", "BIRD"] },
  { word: "CAKE", rhyme: "LAKE", others: ["TREE", "MOON"] },
  { word: "RUN", rhyme: "SUN", others: ["CAR", "HAT"] },
  { word: "BOOK", rhyme: "COOK", others: ["BIRD", "BLUE"] },
  { word: "RING", rhyme: "SING", others: ["JUMP", "RAIN"] },
  { word: "TREE", rhyme: "BEE", others: ["DUCK", "ROSE"] },
  { word: "FROG", rhyme: "LOG", others: ["KITE", "BELL"] },
  { word: "STAR", rhyme: "CAR", others: ["FISH", "LEAF"] },
  { word: "WING", rhyme: "KING", others: ["BOAT", "SAND"] },
];

function buildRhymeQuestion(round: number) {
  const pair = RHYME_PAIRS[round % RHYME_PAIRS.length];
  const options = shuffleArray([pair.rhyme, ...pair.others]);
  return { word: pair.word, correctRhyme: pair.rhyme, options };
}

function RhymingWordsGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[7];
  const TOTAL = RHYME_PAIRS.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState(() => buildRhymeQuestion(0));
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setQuestion(buildRhymeQuestion(0));
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
    const correct = opt === question.correctRhyme;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        const newScore = correct ? score + 1 : score;
        const s = calcStars(newScore, TOTAL);
        setStars(s);
        saveScore(meta.id, studentId, s);
        if (s >= 2) gameAudioRef.current?.playWin();
        else gameAudioRef.current?.playGameOver();
        setScreen("end");
        onDone(s, newScore, TOTAL);
      } else {
        setRound(nextRound);
        setQuestion(buildRhymeQuestion(nextRound));
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
        <h2 className="text-xl font-extrabold text-center mb-2">
          {meta.emoji} {meta.name}
        </h2>

        <div className="bg-card border-2 border-border rounded-3xl p-8 max-w-sm mx-auto mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Find a word that rhymes with:
          </p>
          <p className="text-5xl font-extrabold text-foreground tracking-widest">
            {question.word}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            🎵 Words that sound alike!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
          {question.options.map((opt, idx) => {
            let bg = "oklch(0.95 0.02 264)";
            let col = "oklch(0.18 0.04 264)";
            let border = "oklch(0.88 0.02 264)";
            if (chosen !== null) {
              if (opt === question.correctRhyme) {
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
                data-ocid={`games.rhyme.option.${idx + 1}`}
                className="py-4 px-6 text-xl font-bold rounded-2xl border-2 transition-all text-center tracking-widest"
                style={{
                  background: bg,
                  color: col,
                  borderColor: border,
                  minHeight: 56,
                }}
              >
                {opt}
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
            {feedback === "correct"
              ? "✅ Correct!"
              : `❌ It's "${question.correctRhyme}"`}
          </p>
        )}
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAME 9: Times Table Quiz
// ─────────────────────────────────────────────────────────────
function buildTimesTableQuestion(level: Level): {
  q: string;
  answer: number;
  options: number[];
} {
  let maxTable: number;
  if (level === "2") maxTable = 5;
  else if (level === "3") maxTable = 10;
  else maxTable = 12;

  const table = Math.floor(Math.random() * (maxTable - 1)) + 2;
  const multiplier = Math.floor(Math.random() * 10) + 1;
  const ans = table * multiplier;

  const wrong = new Set<number>([ans]);
  while (wrong.size < 4) {
    const offset = Math.floor(Math.random() * 8) - 4;
    const w = Math.max(1, ans + offset * table);
    if (w !== ans) wrong.add(w);
  }
  return {
    q: `${table} × ${multiplier} = ?`,
    answer: ans,
    options: shuffleArray([...wrong]),
  };
}

function TimesTableGame({
  studentId,
  level,
  onBack,
  onDone,
}: {
  studentId: string;
  level: Level;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[8];
  const TIME = 60;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [question, setQuestion] = useState(() =>
    buildTimesTableQuestion(level),
  );
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
      if (s >= 2) gameAudioRef.current?.playWin();
      else gameAudioRef.current?.playGameOver();
      setScreen("end");
      onDone(s, finalScore, finalTotal);
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
    setQuestion(buildTimesTableQuestion(level));
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
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
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
      setQuestion(buildTimesTableQuestion(level));
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
              style={{ background: `${timerColor}20`, color: timerColor }}
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
                key={`topt-${opt}`}
                type="button"
                onClick={() => pick(opt)}
                disabled={chosen !== null}
                data-ocid={`games.times.option.${optPos + 1}`}
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
// Leaderboard
// ─────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  id: string;
  studentId: string;
  studentName: string;
  stars: number;
  score: number;
  total: number;
  playedAt: string;
}

function Leaderboard({
  studentId,
  studentClass,
}: {
  studentId: string;
  studentClass: string;
}) {
  const [selectedGame, setSelectedGame] = useState<GameId>("alphabet-match");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getGameLeaderboardFromBackend(selectedGame, studentClass)
      .then((scores) => {
        const sorted = [...scores]
          .sort((a, b) => {
            const starsDiff = Number(b.stars) - Number(a.stars);
            if (starsDiff !== 0) return starsDiff;
            return Number(b.score) - Number(a.score);
          })
          .slice(0, 10)
          .map((s) => ({
            id: s.id,
            studentId: s.studentId,
            studentName: s.studentName,
            stars: Number(s.stars),
            score: Number(s.score),
            total: Number(s.total),
            playedAt: s.playedAt,
          }));
        setEntries(sorted);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [selectedGame, studentClass]);

  const rankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-foreground text-lg">Class Leaderboard</h3>
        <Badge variant="outline" className="text-xs">
          Class {studentClass}
        </Badge>
      </div>

      <div className="max-w-xs">
        <Select
          value={selectedGame}
          onValueChange={(v) => setSelectedGame(v as GameId)}
        >
          <SelectTrigger data-ocid="games.leaderboard.game_select">
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent>
            {GAMES.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.emoji} {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="space-y-3" data-ocid="games.leaderboard.loading_state">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center text-destructive"
          data-ocid="games.leaderboard.error_state"
        >
          <p className="font-semibold">Could not load leaderboard</p>
          <p className="text-sm mt-1 text-muted-foreground">
            Please try again later
          </p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div
          className="bg-card border-2 border-dashed border-border rounded-xl p-10 text-center"
          data-ocid="games.leaderboard.empty_state"
        >
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-semibold text-foreground">No scores yet!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to play and claim the top spot!
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div
          className="bg-card border border-border rounded-xl overflow-hidden"
          data-ocid="games.leaderboard.table"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Stars</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => {
                const isMe = entry.studentId === studentId;
                const rank = idx + 1;
                const rowOcid = `games.leaderboard.row.${rank}` as const;
                return (
                  <TableRow
                    key={entry.id}
                    data-ocid={rowOcid}
                    style={
                      isMe
                        ? {
                            background: "oklch(0.92 0.10 264 / 0.35)",
                            fontWeight: 700,
                          }
                        : undefined
                    }
                  >
                    <TableCell className="text-center text-xl font-bold">
                      {rankMedal(rank)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {entry.studentName}
                        {isMe && (
                          <span
                            className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                            style={{
                              background: "oklch(0.88 0.15 264)",
                              color: "oklch(0.25 0.15 264)",
                            }}
                          >
                            You
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Stars count={entry.stars} size="sm" />
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {entry.score}/{entry.total}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs hidden sm:table-cell">
                      {formatDate(entry.playedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Games Hub
// ─────────────────────────────────────────────────────────────
function GamesHub({
  level,
  myScores,
  studentId,
  studentClass,
  onPlay,
}: {
  level: Level;
  myScores: Record<string, { stars: number; score: number; total: number }>;
  studentId: string;
  studentClass: string;
  onPlay: (gameId: GameId) => void;
}) {
  const available = GAMES.filter((g) => g.levels.includes(level));
  const locked = GAMES.filter((g) => !g.levels.includes(level));

  return (
    <div data-ocid="games.section">
      <div className="flex items-center justify-between mb-1">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          🎮 Learning Games
        </h2>
        <button
          type="button"
          data-ocid="games.music.toggle"
          onClick={() => gameAudioRef.current?.toggleMusic()}
          className="text-2xl p-2 rounded-full hover:bg-muted transition-colors"
          title={
            gameAudioRef.current?.musicOn ? "Turn off music" : "Turn on music"
          }
        >
          {gameAudioRef.current?.musicOn !== false ? "🎵" : "🔇"}
        </button>
      </div>
      <p className="section-subtitle">
        Fun games for Class {level} students — learn English &amp; Maths while
        playing!
      </p>

      <Tabs defaultValue="games">
        <TabsList className="mb-6">
          <TabsTrigger value="games" data-ocid="games.games.tab">
            🎮 Games
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-ocid="games.leaderboard.tab">
            🏆 Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games">
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
                const backendScore = myScores[game.id];
                const bestStars = backendScore?.stars ?? 0;
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

                    <div className="flex flex-col items-center gap-1">
                      {bestStars > 0 ? (
                        <>
                          <p className="text-xs text-muted-foreground font-medium">
                            Best Score
                          </p>
                          <Stars count={bestStars} size="sm" />
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No score yet
                        </p>
                      )}
                    </div>

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
                    <p className="font-bold text-muted-foreground">
                      {game.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {game.ageRange}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard studentId={studentId} studentClass={studentClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Speak the Word Game
// ─────────────────────────────────────────────────────────────
const SPEAK_WORDS: Record<string, string[]> = {
  UKG: ["cat", "dog", "sun", "hat", "red", "big", "run", "sit"],
  "1": ["apple", "ball", "cake", "fish", "girl", "hand", "jump", "kite"],
  "2": ["water", "light", "cloud", "grass", "sweet", "bread", "stone", "table"],
};
const SPEAK_WORD_EMOJIS: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  sun: "☀️",
  hat: "🎩",
  red: "🔴",
  big: "🐘",
  run: "🏃",
  sit: "🪑",
  apple: "🍎",
  ball: "⚽",
  cake: "🎂",
  fish: "🐟",
  girl: "👧",
  hand: "✋",
  jump: "🦘",
  kite: "🪁",
  water: "💧",
  light: "💡",
  cloud: "☁️",
  grass: "🌿",
  sweet: "🍬",
  bread: "🍞",
  stone: "🪨",
  table: "🪑",
};

function speakWord(word: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.rate = 0.85;
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}

const hasSpeechRecognition =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

function SpeakTheWordGame({
  studentId,
  level,
  onBack,
  onDone,
}: {
  studentId: string;
  level: Level;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[9];
  const wordList = SPEAK_WORDS[level] ?? SPEAK_WORDS["1"];
  const TOTAL = wordList.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [recognized, setRecognized] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recRef = useRef<any>(null);

  const currentWord = wordList[round] ?? wordList[0];

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setFeedback(null);
    setRecognized("");
    setIsListening(false);
  }, []);

  const finishGame = useCallback(
    (finalScore: number) => {
      const s = calcStars(finalScore, TOTAL);
      setStars(s);
      saveScore(meta.id, studentId, s);
      if (s >= 2) gameAudioRef.current?.playWin();
      else gameAudioRef.current?.playGameOver();
      setScreen("end");
      onDone(s, finalScore, TOTAL);
    },
    [TOTAL, meta.id, studentId, onDone],
  );

  const advance = useCallback(
    (correct: boolean) => {
      const newScore = correct ? score + 1 : score;
      if (correct) setScore((s) => s + 1);
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        setTimeout(() => finishGame(newScore), 1200);
      } else {
        setTimeout(() => {
          setRound(nextRound);
          setFeedback(null);
          setRecognized("");
        }, 1200);
      }
    },
    [round, score, TOTAL, finishGame],
  );

  const startListening = () => {
    if (!hasSpeechRecognition || feedback !== null) return;
    try {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const rec = new SR();
      recRef.current = rec;
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      setIsListening(true);
      rec.onresult = (e: any) => {
        setIsListening(false);
        const heard = Array.from(e.results[0])
          .map((r: any) => r.transcript.toLowerCase().trim())
          .join(" ");
        setRecognized(heard);
        const correct = heard.includes(currentWord.toLowerCase());
        setFeedback(correct ? "correct" : "wrong");
        if (correct) gameAudioRef.current?.playCorrect();
        else gameAudioRef.current?.playWrong();
        advance(correct);
      };
      rec.onerror = () => {
        setIsListening(false);
        setRecognized("(Could not hear – try again)");
      };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const manualCorrect = () => {
    if (feedback !== null) return;
    setFeedback("correct");
    setRecognized("✓ Marked as correct");
    advance(true);
  };

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={() => {
        init();
        setScreen("play");
      }}
      onPlayAgain={() => {
        init();
        setScreen("play");
      }}
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

        <h2 className="text-xl font-extrabold text-center mb-6">
          {meta.emoji} {meta.name}
        </h2>

        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div
            className="w-full bg-card border-2 rounded-3xl p-8 flex flex-col items-center gap-3 shadow-md"
            style={{
              borderColor:
                feedback === "correct"
                  ? "oklch(0.65 0.18 150)"
                  : feedback === "wrong"
                    ? "oklch(0.55 0.2 25)"
                    : "oklch(0.55 0.15 264)",
            }}
          >
            <div className="text-6xl">
              {SPEAK_WORD_EMOJIS[currentWord] ?? "📝"}
            </div>
            <p className="text-4xl font-extrabold tracking-wider">
              {currentWord}
            </p>
            {feedback && (
              <div className="text-center">
                <span className="text-2xl">
                  {feedback === "correct" ? "✅" : "❌"}
                </span>
                {recognized && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Heard: "{recognized}"
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap justify-center w-full">
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl gap-2 font-bold"
              onClick={() => speakWord(currentWord)}
              data-ocid="games.listen_button"
            >
              🔊 Listen
            </Button>
            {hasSpeechRecognition ? (
              <Button
                size="lg"
                disabled={feedback !== null}
                onClick={startListening}
                data-ocid="games.speak_button"
                className={`rounded-2xl gap-2 font-bold transition-all ${
                  isListening
                    ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                    : ""
                }`}
                style={
                  !isListening
                    ? { background: "oklch(0.55 0.18 264)", color: "#fff" }
                    : {}
                }
              >
                🎤 {isListening ? "Listening…" : "Speak"}
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={feedback !== null}
                onClick={manualCorrect}
                data-ocid="games.isaid_button"
                className="rounded-2xl gap-2 font-bold"
                style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}
              >
                ✅ I Said It!
              </Button>
            )}
          </div>
          {!hasSpeechRecognition && (
            <p className="text-xs text-muted-foreground text-center px-4">
              🎙️ Microphone not supported in this browser. Press "I Said It!"
              after speaking.
            </p>
          )}
        </div>
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Listen & Spell Game
// ─────────────────────────────────────────────────────────────
const SPELL_WORDS: Record<string, string[]> = {
  "1": ["ball", "cat", "dog", "fish", "jump", "kite", "lamp", "moon"],
  "2": ["chair", "bread", "cloud", "dream", "fruit", "green", "house", "juice"],
  "3": [
    "below",
    "catch",
    "dance",
    "eagle",
    "flame",
    "grade",
    "happy",
    "island",
  ],
};

function ListenAndSpellGame({
  studentId,
  level,
  onBack,
  onDone,
}: {
  studentId: string;
  level: Level;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[10];
  const wordList = SPELL_WORDS[level] ?? SPELL_WORDS["2"];
  const TOTAL = wordList.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const currentWord = wordList[round] ?? wordList[0];

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setTyped("");
    setFeedback(null);
  }, []);

  const submit = () => {
    if (feedback !== null || typed.trim() === "") return;
    const correct = typed.trim().toLowerCase() === currentWord.toLowerCase();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) gameAudioRef.current?.playCorrect();
    else gameAudioRef.current?.playWrong();
    const newScore = correct ? score + 1 : score;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        const s = calcStars(newScore, TOTAL);
        setStars(s);
        saveScore(meta.id, studentId, s);
        if (s >= 2) gameAudioRef.current?.playWin();
        else gameAudioRef.current?.playGameOver();
        setScreen("end");
        onDone(s, newScore, TOTAL);
      } else {
        setRound(nextRound);
        setTyped("");
        setFeedback(null);
      }
    }, 1500);
  };

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={() => {
        init();
        setScreen("play");
      }}
      onPlayAgain={() => {
        init();
        setScreen("play");
      }}
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

        <h2 className="text-xl font-extrabold text-center mb-6">
          {meta.emoji} {meta.name}
        </h2>

        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <p className="text-muted-foreground text-center text-sm">
            Press the button to hear the word, then type its spelling.
          </p>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="rounded-2xl gap-2 font-bold"
              style={{ background: "oklch(0.55 0.18 264)", color: "#fff" }}
              onClick={() => speakWord(currentWord)}
              data-ocid="games.hear_button"
            >
              🔊 Hear the Word
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl gap-2 font-bold"
              onClick={() => speakWord(currentWord)}
              data-ocid="games.hear_again_button"
            >
              🔁 Again
            </Button>
          </div>

          <div
            className="w-full bg-card border-2 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-md"
            style={{
              borderColor:
                feedback === "correct"
                  ? "oklch(0.65 0.18 150)"
                  : feedback === "wrong"
                    ? "oklch(0.55 0.2 25)"
                    : "oklch(0.55 0.15 264)",
            }}
          >
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              disabled={feedback !== null}
              placeholder="Type the word here…"
              className="w-full text-center text-2xl font-bold bg-transparent border-b-2 border-border outline-none py-2 tracking-wider disabled:opacity-60"
              data-ocid="games.spell_input"
            />
            {feedback && (
              <div className="text-center">
                <span className="text-3xl">
                  {feedback === "correct" ? "✅" : "❌"}
                </span>
                {feedback === "wrong" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Correct spelling: <strong>{currentWord}</strong>
                  </p>
                )}
              </div>
            )}
            <Button
              size="lg"
              disabled={feedback !== null || typed.trim() === ""}
              onClick={submit}
              data-ocid="games.submit_button"
              className="rounded-2xl font-bold px-8"
              style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}
            >
              ✔ Check Answer
            </Button>
          </div>
        </div>
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Picture Pronunciation Game
// ─────────────────────────────────────────────────────────────
const PICTURE_WORDS = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "sun", emoji: "☀️" },
  { word: "fish", emoji: "🐟" },
  { word: "tree", emoji: "🌳" },
  { word: "book", emoji: "📚" },
  { word: "ball", emoji: "⚽" },
  { word: "bird", emoji: "🐦" },
];

function PicturePronounceGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[11];
  const TOTAL = PICTURE_WORDS.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [recognized, setRecognized] = useState("");
  const [isListening, setIsListening] = useState(false);

  const current = PICTURE_WORDS[round];

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    setFeedback(null);
    setRecognized("");
    setIsListening(false);
  }, []);

  const finishGame = useCallback(
    (finalScore: number) => {
      const s = calcStars(finalScore, TOTAL);
      setStars(s);
      saveScore(meta.id, studentId, s);
      if (s >= 2) gameAudioRef.current?.playWin();
      else gameAudioRef.current?.playGameOver();
      setScreen("end");
      onDone(s, finalScore, TOTAL);
    },
    [TOTAL, meta.id, studentId, onDone],
  );

  const advance = useCallback(
    (correct: boolean) => {
      const newScore = correct ? score + 1 : score;
      if (correct) setScore((s) => s + 1);
      const nextRound = round + 1;
      if (nextRound >= TOTAL) {
        setTimeout(() => finishGame(newScore), 1200);
      } else {
        setTimeout(() => {
          setRound(nextRound);
          setFeedback(null);
          setRecognized("");
        }, 1200);
      }
    },
    [round, score, TOTAL, finishGame],
  );

  const startListening = () => {
    if (!hasSpeechRecognition || feedback !== null) return;
    try {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      setIsListening(true);
      rec.onresult = (e: any) => {
        setIsListening(false);
        const heard = Array.from(e.results[0])
          .map((r: any) => r.transcript.toLowerCase().trim())
          .join(" ");
        setRecognized(heard);
        const correct = heard.includes(current.word.toLowerCase());
        setFeedback(correct ? "correct" : "wrong");
        if (correct) gameAudioRef.current?.playCorrect();
        else gameAudioRef.current?.playWrong();
        advance(correct);
      };
      rec.onerror = () => {
        setIsListening(false);
        setRecognized("(Could not hear – try again)");
      };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const manualCorrect = () => {
    if (feedback !== null) return;
    setFeedback("correct");
    setRecognized("✓ Marked as correct");
    advance(true);
  };

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={() => {
        init();
        setScreen("play");
      }}
      onPlayAgain={() => {
        init();
        setScreen("play");
      }}
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
            Picture {round + 1}/{TOTAL} · ✅ {score}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-center mb-6">
          {meta.emoji} {meta.name}
        </h2>

        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div
            className="w-full bg-card border-2 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-md"
            style={{
              borderColor:
                feedback === "correct"
                  ? "oklch(0.65 0.18 150)"
                  : feedback === "wrong"
                    ? "oklch(0.55 0.2 25)"
                    : "oklch(0.55 0.15 264)",
            }}
          >
            <div className="text-8xl">{current.emoji}</div>
            <p className="text-2xl font-bold text-muted-foreground">
              What is this?
            </p>
            {feedback && (
              <div className="text-center">
                <span className="text-3xl">
                  {feedback === "correct" ? "✅" : "❌"}
                </span>
                {feedback === "wrong" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    It&apos;s a <strong>{current.word}</strong>!
                  </p>
                )}
                {recognized && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Heard: "{recognized}"
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl gap-2 font-bold"
              onClick={() => speakWord(current.word)}
              data-ocid="games.example_button"
            >
              🔊 Example
            </Button>
            {hasSpeechRecognition ? (
              <Button
                size="lg"
                disabled={feedback !== null}
                onClick={startListening}
                data-ocid="games.say_button"
                className={`rounded-2xl gap-2 font-bold transition-all ${
                  isListening
                    ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                    : ""
                }`}
                style={
                  !isListening
                    ? { background: "oklch(0.55 0.18 264)", color: "#fff" }
                    : {}
                }
              >
                🎤 {isListening ? "Listening…" : "Say the Word"}
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={feedback !== null}
                onClick={manualCorrect}
                data-ocid="games.isaid_button"
                className="rounded-2xl gap-2 font-bold"
                style={{ background: "oklch(0.55 0.18 150)", color: "#fff" }}
              >
                ✅ I Said It!
              </Button>
            )}
          </div>
          {!hasSpeechRecognition && (
            <p className="text-xs text-muted-foreground text-center px-4">
              🎙️ Microphone not supported in this browser. Press "I Said It!"
              after speaking.
            </p>
          )}
        </div>
      </div>
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Story Builder Game
// ─────────────────────────────────────────────────────────────
const STORIES = [
  {
    title: "The Lost Kitten",
    sentences: [
      "A little kitten got lost in the park.",
      "She cried loudly for her mother.",
      "A kind boy heard her crying.",
      "He picked her up gently and looked for her home.",
      "Finally, the kitten was back with her family.",
    ],
  },
  {
    title: "The Magic Seed",
    sentences: [
      "A farmer planted a tiny seed in the ground.",
      "Every day he watered it with care.",
      "After a week, a small green shoot appeared.",
      "The shoot grew taller and taller.",
      "One morning, a beautiful flower bloomed.",
    ],
  },
  {
    title: "Rainy Day",
    sentences: [
      "Dark clouds filled the sky.",
      "Thunder rumbled and lightning flashed.",
      "Rain began to pour down heavily.",
      "The children ran inside the school.",
      "They watched the rain through the window happily.",
    ],
  },
  {
    title: "The Helpful Robot",
    sentences: [
      "A small robot lived in a big city.",
      "Every morning it woke up early.",
      "It helped old people cross the road.",
      "It picked up litter from the streets.",
      "Everyone in the city loved the little robot.",
    ],
  },
  {
    title: "The Big Race",
    sentences: [
      "All the animals gathered for a big race.",
      "The rabbit ran very fast at the start.",
      "The tortoise walked slowly but steadily.",
      "The rabbit took a nap under a tree.",
      "The tortoise crossed the finish line first and won.",
    ],
  },
];

function StoryArrangeGame({
  studentId,
  onBack,
  onDone,
}: {
  studentId: string;
  onBack: () => void;
  onDone: (stars: number, score: number, total: number) => void;
}) {
  const meta = GAMES[12];
  const TOTAL = STORIES.length;
  const [screen, setScreen] = useState<GameScreen>("start");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const story = STORIES[round];

  const buildRound = useCallback((r: number) => {
    setShuffled(shuffleArray(STORIES[r].sentences));
    setSelected([]);
    setFeedback(null);
  }, []);

  const init = useCallback(() => {
    setRound(0);
    setScore(0);
    setStars(0);
    buildRound(0);
  }, [buildRound]);

  const tapSentence = (sentence: string) => {
    if (feedback !== null) return;
    const alreadyIdx = selected.indexOf(sentence);
    if (alreadyIdx >= 0) {
      setSelected((s) => s.filter((_, i) => i !== alreadyIdx));
      return;
    }
    const newSelected = [...selected, sentence];
    setSelected(newSelected);

    if (newSelected.length === story.sentences.length) {
      const correct = newSelected.join("|") === story.sentences.join("|");
      setFeedback(correct ? "correct" : "wrong");
      if (correct) gameAudioRef.current?.playCorrect();
      else gameAudioRef.current?.playWrong();
      const newScore = correct ? score + 1 : score;
      if (correct) setScore((s) => s + 1);
      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL) {
          const s = calcStars(newScore, TOTAL);
          setStars(s);
          saveScore(meta.id, studentId, s);
          if (s >= 2) gameAudioRef.current?.playWin();
          else gameAudioRef.current?.playGameOver();
          setScreen("end");
          onDone(s, newScore, TOTAL);
        } else {
          setRound(nextRound);
          buildRound(nextRound);
        }
      }, 1500);
    }
  };

  const remaining = shuffled.filter((s) => !selected.includes(s));

  return (
    <GameShell
      meta={meta}
      screen={screen}
      stars={stars}
      score={score}
      total={TOTAL}
      onStart={() => {
        init();
        setScreen("play");
      }}
      onPlayAgain={() => {
        init();
        setScreen("play");
      }}
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
            Story {round + 1}/{TOTAL} · ✅ {score}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-center mb-1">
          {meta.emoji} {meta.name}
        </h2>
        <p className="text-center text-base font-semibold text-muted-foreground mb-4">
          📖 {story.title}
        </p>

        {/* Selected sentences (built story) */}
        <div
          className="bg-card border-2 rounded-2xl p-3 mb-4 min-h-[80px] max-w-lg mx-auto"
          style={{
            borderColor:
              feedback === "correct"
                ? "oklch(0.65 0.18 150)"
                : feedback === "wrong"
                  ? "oklch(0.55 0.2 25)"
                  : "oklch(0.55 0.15 264)",
          }}
        >
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-2">
              Tap sentences below to build the story…
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {selected.map((s, idx) => (
                <button
                  key={`sel-${s.slice(0, 20)}`}
                  type="button"
                  onClick={() => tapSentence(s)}
                  disabled={feedback !== null}
                  className="text-left text-sm bg-primary/10 hover:bg-primary/20 rounded-xl px-3 py-2 font-medium transition-colors"
                  data-ocid={`games.story_selected.${idx + 1}`}
                >
                  <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                  {s}
                </button>
              ))}
            </div>
          )}
          {feedback && (
            <div className="text-center mt-2">
              <span className="text-2xl">
                {feedback === "correct"
                  ? "✅ Perfect order!"
                  : "❌ Not quite – try again next story!"}
              </span>
            </div>
          )}
        </div>

        {/* Remaining sentence tiles */}
        <div className="flex flex-col gap-2 max-w-lg mx-auto">
          {remaining.map((s, idx) => (
            <button
              key={`tile-${s.slice(0, 20)}`}
              type="button"
              onClick={() => tapSentence(s)}
              disabled={feedback !== null}
              className="text-left text-sm bg-card border-2 border-border hover:border-primary rounded-xl px-3 py-2 font-medium transition-colors disabled:opacity-50"
              data-ocid={`games.story_tile.${idx + 1}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

export default function LearningGames({
  studentId,
  studentName,
  studentClass,
}: {
  studentId: string;
  studentName: string;
  studentClass: string;
}) {
  const level = parseLevel(studentClass);
  useGameAudio(); // initializes gameAudioRef + background music
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // Backend scores (personal best per game)
  const [myScores, setMyScores] = useState<
    Record<string, { stars: number; score: number; total: number }>
  >(() => {
    // Initialize from localStorage as fallback
    const s: Record<string, { stars: number; score: number; total: number }> =
      {};
    for (const g of GAMES) {
      const stars = loadScore(g.id, studentId);
      s[g.id] = { stars, score: 0, total: 0 };
    }
    return s;
  });

  // Load personal bests from backend
  useEffect(() => {
    getMyGameScoresFromBackend(studentId)
      .then((scores) => {
        const map: Record<
          string,
          { stars: number; score: number; total: number }
        > = {};
        for (const s of scores) {
          const gameId = s.gameId;
          const existing = map[gameId];
          const newStars = Number(s.stars);
          if (!existing || newStars > existing.stars) {
            map[gameId] = {
              stars: newStars,
              score: Number(s.score),
              total: Number(s.total),
            };
          }
        }
        setMyScores((prev) => ({ ...prev, ...map }));
      })
      .catch(() => {});
  }, [studentId]);

  const handleDone = useCallback(
    (gameId: GameId, stars: number, score: number, total: number) => {
      // Update local state
      setMyScores((prev) => {
        const existing = prev[gameId];
        if (!existing || stars > existing.stars) {
          return { ...prev, [gameId]: { stars, score, total } };
        }
        return prev;
      });

      // Save to backend
      const scoreRecord: GameScoreRecord = {
        id: `${studentId}-${gameId}-${Date.now()}`,
        studentId,
        studentName,
        class: studentClass,
        gameId,
        stars: BigInt(stars),
        score: BigInt(score),
        total: BigInt(total),
        playedAt: new Date().toISOString(),
      };
      saveGameScoreToBackend(scoreRecord).catch(() => {});
    },
    [studentId, studentName, studentClass],
  );

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
        onDone={(s, sc, t) => handleDone("alphabet-match", s, sc, t)}
      />
    );
  }
  if (activeGame === "number-counting") {
    return (
      <NumberCountingGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("number-counting", s, sc, t)}
      />
    );
  }
  if (activeGame === "word-builder") {
    return (
      <WordBuilderGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("word-builder", s, sc, t)}
      />
    );
  }
  if (activeGame === "spell-the-word") {
    return (
      <SpellWordGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("spell-the-word", s, sc, t)}
      />
    );
  }
  if (activeGame === "maths-challenge") {
    return (
      <MathsChallengeGame
        studentId={studentId}
        level={level}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("maths-challenge", s, sc, t)}
      />
    );
  }
  if (activeGame === "sentence-scramble") {
    return (
      <SentenceScrambleGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("sentence-scramble", s, sc, t)}
      />
    );
  }
  if (activeGame === "color-match") {
    return (
      <ColorMatchGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("color-match", s, sc, t)}
      />
    );
  }
  if (activeGame === "rhyming-words") {
    return (
      <RhymingWordsGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("rhyming-words", s, sc, t)}
      />
    );
  }
  if (activeGame === "times-table") {
    return (
      <TimesTableGame
        studentId={studentId}
        level={level}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("times-table", s, sc, t)}
      />
    );
  }

  if (activeGame === "speak-the-word") {
    return (
      <SpeakTheWordGame
        studentId={studentId}
        level={level}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("speak-the-word", s, sc, t)}
      />
    );
  }
  if (activeGame === "listen-and-spell") {
    return (
      <ListenAndSpellGame
        studentId={studentId}
        level={level}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("listen-and-spell", s, sc, t)}
      />
    );
  }
  if (activeGame === "picture-pronounce") {
    return (
      <PicturePronounceGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("picture-pronounce", s, sc, t)}
      />
    );
  }
  if (activeGame === "story-arrange") {
    return (
      <StoryArrangeGame
        studentId={studentId}
        onBack={handleBack}
        onDone={(s, sc, t) => handleDone("story-arrange", s, sc, t)}
      />
    );
  }

  return (
    <GamesHub
      level={level}
      myScores={myScores}
      studentId={studentId}
      studentClass={studentClass}
      onPlay={(gameId) => setActiveGame(gameId)}
    />
  );
}
