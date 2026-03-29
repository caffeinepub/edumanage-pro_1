import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type GameScoreRecord, saveGameScoreToBackend } from "@/store/data";
import { ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import BodyLabelGame from "./BodyLabelGame";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface LKGQuestion {
  prompt: string;
  visual?: string;
  options: string[];
  correct: number;
  feedback?: string;
}

interface LKGTopic {
  id: string;
  name: string;
  emoji: string;
  category: string;
  questions: LKGQuestion[];
}

interface LKGCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  topics: LKGTopic[];
}

// ─────────────────────────────────────────────────────────────
// Score helpers
// ─────────────────────────────────────────────────────────────
function loadLKGScore(studentId: string, topicId: string): number {
  try {
    return (
      Number.parseInt(
        localStorage.getItem(`lkg_game_${studentId}_${topicId}`) || "0",
        10,
      ) || 0
    );
  } catch {
    return 0;
  }
}

function saveLKGScore(studentId: string, topicId: string, stars: number) {
  try {
    const prev = loadLKGScore(studentId, topicId);
    if (stars > prev)
      localStorage.setItem(`lkg_game_${studentId}_${topicId}`, String(stars));
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// Category 1: Phonics & Literacy
// ─────────────────────────────────────────────────────────────
const phonicsTopics: LKGTopic[] = [
  {
    id: "strokes-standing-sleeping",
    name: "Standing & Sleeping Lines",
    emoji: "📏",
    category: "phonics",
    questions: [
      {
        prompt: "Which line is this?  |  (vertical)",
        visual: "|",
        options: [
          "Standing line",
          "Sleeping line",
          "Slanting line",
          "Zigzag line",
        ],
        correct: 0,
        feedback: "✅ Yes! A vertical line is a Standing line!",
      },
      {
        prompt: "Which line is this?  ─  (horizontal)",
        visual: "─",
        options: [
          "Standing line",
          "Sleeping line",
          "Slanting line",
          "Zigzag line",
        ],
        correct: 1,
        feedback: "✅ Yes! A horizontal line is a Sleeping line!",
      },
      {
        prompt: "A line that stands up straight is called a ___ line.",
        options: ["Standing", "Sleeping", "Slanting", "Curved"],
        correct: 0,
      },
      {
        prompt: "A line that lies flat is called a ___ line.",
        options: ["Standing", "Sleeping", "Slanting", "Curved"],
        correct: 1,
      },
      {
        prompt: "Which direction does a STANDING line go?",
        options: [
          "Up and down",
          "Left and right",
          "Diagonal",
          "Round and round",
        ],
        correct: 0,
      },
    ],
  },
  {
    id: "strokes-slanting",
    name: "Slanting Lines",
    emoji: "✏️",
    category: "phonics",
    questions: [
      {
        prompt: "A line that goes like / is a ___ line.",
        options: ["Slanting", "Sleeping", "Standing", "Zigzag"],
        correct: 0,
      },
      {
        prompt: "Which type of line is this: \\?",
        options: ["Slanting", "Sleeping", "Standing", "Curved"],
        correct: 0,
      },
      {
        prompt: "A slanting line goes in which direction?",
        options: ["Diagonal", "Up & down", "Left & right", "Circular"],
        correct: 0,
      },
      {
        prompt: "The letter A has ___ lines.",
        options: ["Slanting", "Sleeping", "Curved", "Zigzag"],
        correct: 0,
      },
      {
        prompt: "Which of these is a slanting line?",
        options: ["/", "─", "|", "~"],
        correct: 0,
      },
    ],
  },
  {
    id: "strokes-zigzag",
    name: "Zigzag Lines",
    emoji: "〰️",
    category: "phonics",
    questions: [
      {
        prompt: "A line that goes up and down many times is a ___ line.",
        options: ["Zigzag", "Straight", "Curved", "Dotted"],
        correct: 0,
      },
      {
        prompt: "The letter Z has ___ lines.",
        options: ["Zigzag", "Curved", "Dotted", "Wavy"],
        correct: 0,
      },
      {
        prompt: "Which best describes a zigzag?",
        options: [
          "Sharp back and forth",
          "Smooth and round",
          "Only vertical",
          "Only horizontal",
        ],
        correct: 0,
      },
      {
        prompt: "A zigzag line looks like the letter:",
        options: ["Z", "O", "I", "C"],
        correct: 0,
      },
      {
        prompt: "How many direction changes does W have?",
        options: ["3", "0", "1", "5"],
        correct: 0,
      },
    ],
  },
  {
    id: "strokes-mixed",
    name: "Mixed Strokes",
    emoji: "🖊️",
    category: "phonics",
    questions: [
      {
        prompt: "Which type of line is  |  ?",
        options: [
          "Standing line",
          "Sleeping line",
          "Slanting line",
          "Zigzag line",
        ],
        correct: 0,
      },
      {
        prompt: "Which type of line is  ─  ?",
        options: [
          "Sleeping line",
          "Standing line",
          "Slanting line",
          "Dotted line",
        ],
        correct: 0,
      },
      {
        prompt: "Which type of line is  /  ?",
        options: [
          "Slanting line",
          "Standing line",
          "Sleeping line",
          "Curved line",
        ],
        correct: 0,
      },
      {
        prompt: "Which type of line is  Z  ?",
        options: [
          "Zigzag line",
          "Sleeping line",
          "Standing line",
          "Straight line",
        ],
        correct: 0,
      },
      {
        prompt: "A curved line looks like the letter:",
        options: ["C", "I", "Z", "X"],
        correct: 0,
      },
    ],
  },
  {
    id: "fun-letters-capitals",
    name: "Capital Letters",
    emoji: "🔤",
    category: "phonics",
    questions: [
      {
        prompt: "Which letter is shown?  A",
        options: ["A", "B", "C", "D"],
        correct: 0,
      },
      {
        prompt: "Which letter is shown?  E",
        options: ["F", "E", "G", "H"],
        correct: 1,
      },
      {
        prompt: "Which letter is shown?  M",
        options: ["N", "W", "M", "H"],
        correct: 2,
      },
      {
        prompt: "Which letter is shown?  T",
        options: ["L", "I", "F", "T"],
        correct: 3,
      },
      {
        prompt: "Which letter is shown?  P",
        options: ["P", "B", "D", "Q"],
        correct: 0,
      },
      {
        prompt: "Which letter is shown?  S",
        options: ["Z", "N", "S", "C"],
        correct: 2,
      },
      {
        prompt: "Which letter is shown?  R",
        options: ["B", "P", "R", "K"],
        correct: 2,
      },
      {
        prompt: "Which letter is shown?  Z",
        options: ["S", "N", "Z", "X"],
        correct: 2,
      },
    ],
  },
  {
    id: "fun-letters-small",
    name: "Small Letters",
    emoji: "🔡",
    category: "phonics",
    questions: [
      {
        prompt: "Which small letter is shown?  a",
        options: ["a", "b", "c", "d"],
        correct: 0,
      },
      {
        prompt: "Which small letter is shown?  g",
        options: ["q", "p", "g", "b"],
        correct: 2,
      },
      {
        prompt: "Which small letter is shown?  m",
        options: ["n", "m", "r", "u"],
        correct: 1,
      },
      {
        prompt: "Which small letter is shown?  t",
        options: ["l", "i", "t", "f"],
        correct: 2,
      },
      {
        prompt: "Which small letter is shown?  s",
        options: ["z", "s", "c", "x"],
        correct: 1,
      },
      {
        prompt: "Which small letter is shown?  d",
        options: ["b", "p", "q", "d"],
        correct: 3,
      },
      {
        prompt: "Which small letter is shown?  h",
        options: ["n", "h", "r", "m"],
        correct: 1,
      },
      {
        prompt: "Which small letter is shown?  w",
        options: ["v", "u", "w", "n"],
        correct: 2,
      },
    ],
  },
  {
    id: "fun-letters-match",
    name: "Match Capital & Small",
    emoji: "🔀",
    category: "phonics",
    questions: [
      {
        prompt: "Capital A matches which small letter?",
        options: ["a", "b", "c", "d"],
        correct: 0,
      },
      {
        prompt: "Capital B matches which small letter?",
        options: ["d", "p", "b", "q"],
        correct: 2,
      },
      {
        prompt: "Capital G matches which small letter?",
        options: ["q", "j", "g", "p"],
        correct: 2,
      },
      {
        prompt: "Capital M matches which small letter?",
        options: ["n", "w", "m", "u"],
        correct: 2,
      },
      {
        prompt: "Capital R matches which small letter?",
        options: ["n", "r", "p", "b"],
        correct: 1,
      },
      {
        prompt: "Capital S matches which small letter?",
        options: ["z", "c", "s", "x"],
        correct: 2,
      },
      {
        prompt: "Capital T matches which small letter?",
        options: ["l", "t", "i", "f"],
        correct: 1,
      },
      {
        prompt: "Capital Z matches which small letter?",
        options: ["s", "x", "n", "z"],
        correct: 3,
      },
    ],
  },
  {
    id: "vowels-consonants",
    name: "Vowels & Consonants",
    emoji: "🔵",
    category: "phonics",
    questions: [
      {
        prompt: "Is the letter A a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 0,
      },
      {
        prompt: "Is the letter B a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 1,
      },
      {
        prompt: "Is the letter E a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 0,
      },
      {
        prompt: "Is the letter I a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 0,
      },
      {
        prompt: "Is the letter O a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 0,
      },
      {
        prompt: "Is the letter U a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 0,
      },
      {
        prompt: "Is the letter S a vowel or consonant?",
        options: ["Vowel", "Consonant", "Number", "Symbol"],
        correct: 1,
      },
      {
        prompt: "How many vowels are in the alphabet?",
        options: ["5", "3", "6", "4"],
        correct: 0,
      },
    ],
  },
  {
    id: "read-aloud",
    name: "Read Aloud",
    emoji: "📖",
    category: "phonics",
    questions: [
      {
        prompt: "Which picture matches the word: CAT?",
        visual: "cat",
        options: ["🐱", "🐶", "🐮", "🐸"],
        correct: 0,
      },
      {
        prompt: "Which picture matches the word: DOG?",
        visual: "dog",
        options: ["🐱", "🐶", "🐮", "🐸"],
        correct: 1,
      },
      {
        prompt: "Which picture matches the word: HEN?",
        visual: "hen",
        options: ["🦆", "🐦", "🐓", "🦅"],
        correct: 2,
      },
      {
        prompt: "Which picture matches the word: PIG?",
        visual: "pig",
        options: ["🐷", "🐮", "🐑", "🐴"],
        correct: 0,
      },
      {
        prompt: "Which picture matches the word: SUN?",
        visual: "sun",
        options: ["🌙", "⭐", "☀️", "🌈"],
        correct: 2,
      },
      {
        prompt: "Which picture matches the word: CUP?",
        visual: "cup",
        options: ["🥄", "🍽️", "☕", "🍵"],
        correct: 2,
      },
      {
        prompt: "Which picture matches the word: HAT?",
        visual: "hat",
        options: ["👟", "🧣", "🧤", "🎩"],
        correct: 3,
      },
      {
        prompt: "Which picture matches the word: BAG?",
        visual: "bag",
        options: ["👜", "📦", "🪣", "🛒"],
        correct: 0,
      },
    ],
  },
  {
    id: "letter-sounds",
    name: "Letter Sounds",
    emoji: "🔤",
    category: "phonics",
    questions: [
      {
        prompt: "Which word begins with the letter B?",
        options: ["Ball", "Cat", "Dog", "Elephant"],
        correct: 0,
      },
      {
        prompt: "Which word begins with the letter C?",
        options: ["Apple", "Car", "Dog", "Fan"],
        correct: 1,
      },
      {
        prompt: "Which word begins with the letter D?",
        options: ["Mango", "Box", "Drum", "Hen"],
        correct: 2,
      },
      {
        prompt: "Which word begins with the letter F?",
        options: ["Sun", "Rain", "Bird", "Fish"],
        correct: 3,
      },
      {
        prompt: "Which word begins with the letter G?",
        options: ["Goat", "Horse", "Kite", "Lion"],
        correct: 0,
      },
      {
        prompt: "Which word begins with the letter H?",
        options: ["Tree", "Hat", "Pen", "Bag"],
        correct: 1,
      },
      {
        prompt: "Which word begins with the letter M?",
        options: ["Dog", "Cup", "Moon", "Sun"],
        correct: 2,
      },
      {
        prompt: "Which word begins with the letter P?",
        options: ["Mango", "Banana", "Apple", "Plum"],
        correct: 3,
      },
    ],
  },
  {
    id: "cvc-words",
    name: "CVC Words",
    emoji: "📝",
    category: "phonics",
    questions: [
      {
        prompt: "Which word rhymes with CAT?",
        options: ["Bat", "Dog", "Sun", "Cup"],
        correct: 0,
      },
      {
        prompt: "Complete the word: S_T — what is the missing letter?",
        options: ["E", "I", "O", "A"],
        correct: 1,
      },
      {
        prompt: "Which word rhymes with HOP?",
        options: ["Bag", "Cup", "Top", "Pin"],
        correct: 2,
      },
      {
        prompt: "Complete the word: C_P (you drink from it) — missing letter?",
        options: ["I", "A", "E", "U"],
        correct: 3,
      },
      {
        prompt: "Which word rhymes with RED?",
        options: ["Bed", "Cup", "Pin", "Hop"],
        correct: 0,
      },
      {
        prompt: "Complete the word: B_G (very large) — missing letter?",
        options: ["A", "I", "E", "O"],
        correct: 1,
      },
      {
        prompt: "Which word rhymes with LOG?",
        options: ["Cat", "Hen", "Dog", "Pin"],
        correct: 2,
      },
      {
        prompt: "Complete the word: F_N (having fun) — missing letter?",
        options: ["A", "I", "E", "U"],
        correct: 3,
      },
    ],
  },
  {
    id: "sight-words",
    name: "Sight Words",
    emoji: "👀",
    category: "phonics",
    questions: [
      {
        prompt: "Which is the most common word in English?",
        options: ["the", "cat", "run", "big"],
        correct: 0,
      },
      {
        prompt: "Which word means together with?",
        options: ["is", "and", "in", "at"],
        correct: 1,
      },
      {
        prompt: "Which word shows something is happening now?",
        options: ["on", "at", "is", "it"],
        correct: 2,
      },
      {
        prompt: "Which word is used for a thing (not a person)?",
        options: ["the", "and", "is", "it"],
        correct: 3,
      },
      {
        prompt: "Which word tells where something is inside?",
        options: ["in", "on", "at", "can"],
        correct: 0,
      },
      {
        prompt: "Which word tells on top of something?",
        options: ["in", "on", "at", "it"],
        correct: 1,
      },
      {
        prompt: "Which word tells where you are (at school)?",
        options: ["in", "on", "at", "is"],
        correct: 2,
      },
      {
        prompt: "Which word means is able to?",
        options: ["it", "in", "on", "can"],
        correct: 3,
      },
    ],
  },
  {
    id: "rhyming-words",
    name: "Rhyming Words",
    emoji: "🎵",
    category: "phonics",
    questions: [
      {
        prompt: "Which word RHYMES with CAT?",
        options: ["Bat", "Dog", "Sun", "Cup"],
        correct: 0,
      },
      {
        prompt: "Which word RHYMES with SUN?",
        options: ["Dog", "Run", "Cat", "Hop"],
        correct: 1,
      },
      {
        prompt: "Which word RHYMES with BIG?",
        options: ["Dog", "Sun", "Pig", "Cat"],
        correct: 2,
      },
      {
        prompt: "Which word RHYMES with RED?",
        options: ["Sun", "Dog", "Cat", "Bed"],
        correct: 3,
      },
      {
        prompt: "Which word RHYMES with HOP?",
        options: ["Top", "Cat", "Sun", "Big"],
        correct: 0,
      },
      {
        prompt: "Which word RHYMES with CUP?",
        options: ["Cat", "Pup", "Sun", "Hop"],
        correct: 1,
      },
      {
        prompt: "Which word RHYMES with DAY?",
        options: ["Sun", "Cat", "Play", "Dog"],
        correct: 2,
      },
      {
        prompt: "Which word RHYMES with TREE?",
        options: ["Dog", "Cat", "Sun", "Bee"],
        correct: 3,
      },
    ],
  },
  {
    id: "beginning-sounds",
    name: "Beginning Sounds",
    emoji: "🔊",
    category: "phonics",
    questions: [
      {
        prompt: "What sound does SUN begin with?",
        options: ["S", "T", "R", "P"],
        correct: 0,
      },
      {
        prompt: "What sound does BALL begin with?",
        options: ["D", "B", "P", "M"],
        correct: 1,
      },
      {
        prompt: "What sound does CAT begin with?",
        options: ["D", "G", "C", "K"],
        correct: 2,
      },
      {
        prompt: "What sound does DOG begin with?",
        options: ["B", "G", "T", "D"],
        correct: 3,
      },
      {
        prompt: "What sound does FISH begin with?",
        options: ["F", "V", "P", "B"],
        correct: 0,
      },
      {
        prompt: "What sound does HAT begin with?",
        options: ["J", "H", "K", "W"],
        correct: 1,
      },
      {
        prompt: "What sound does MOUSE begin with?",
        options: ["N", "B", "M", "P"],
        correct: 2,
      },
      {
        prompt: "What sound does PEN begin with?",
        options: ["B", "D", "F", "P"],
        correct: 3,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Category 2: Numeracy Skills
// ─────────────────────────────────────────────────────────────
const numeracyTopics: LKGTopic[] = [
  {
    id: "same-different",
    name: "Same and Different",
    emoji: "🔄",
    category: "numeracy",
    questions: [
      {
        prompt: "Which one is DIFFERENT? 🍎 🍎 🍊",
        options: ["🍎 (first)", "🍎 (second)", "🍊 (third)", "All same"],
        correct: 2,
      },
      {
        prompt: "Which one is DIFFERENT? 🐶 🐶 🐱",
        options: ["🐶 (first)", "🐶 (second)", "🐱 (third)", "All same"],
        correct: 2,
      },
      {
        prompt: "Which ones are the SAME? 🌟 ⭐ 🌟",
        options: [
          "First and Third",
          "First and Second",
          "Second and Third",
          "None",
        ],
        correct: 0,
      },
      {
        prompt: "Which one is DIFFERENT? 🔴 🔴 🔵",
        options: ["First red", "Second red", "Blue circle", "All different"],
        correct: 2,
      },
      {
        prompt: "🍌 🍌 🍌 - Are these all the SAME?",
        options: [
          "Yes, all same",
          "No, different",
          "Only two same",
          "None same",
        ],
        correct: 0,
      },
      {
        prompt: "Which one is DIFFERENT? 🐘 🦁 🐘",
        options: ["First elephant", "Lion", "Third elephant", "All same"],
        correct: 1,
      },
    ],
  },
  {
    id: "odd-one-out",
    name: "Odd One Out",
    emoji: "🔍",
    category: "numeracy",
    questions: [
      {
        prompt: "🐶 🐱 🐟 🐰 — Which is the ODD ONE OUT?",
        options: ["🐶 Dog", "🐱 Cat", "🐟 Fish", "🐰 Rabbit"],
        correct: 2,
        feedback: "Fish lives in water, others are land animals!",
      },
      {
        prompt: "🍎 🍊 🍋 🥕 — Which is the ODD ONE OUT?",
        options: ["🍎 Apple", "🍊 Orange", "🍋 Lemon", "🥕 Carrot"],
        correct: 3,
        feedback: "Carrot is a vegetable, others are fruits!",
      },
      {
        prompt: "🔴 🔵 🟡 🟩 — Which is DIFFERENT?",
        options: ["Red circle", "Blue circle", "Yellow circle", "Green square"],
        correct: 3,
        feedback: "Green is a square shape, others are circles!",
      },
      {
        prompt: "✈️ 🚗 🚌 🚂 — Which is the ODD ONE OUT?",
        options: ["✈️ Plane", "🚗 Car", "🚌 Bus", "🚂 Train"],
        correct: 0,
        feedback: "Plane flies in the air, others travel on land!",
      },
      {
        prompt: "🍕 🍔 🍟 🍎 — Which is the ODD ONE OUT?",
        options: ["🍕 Pizza", "🍔 Burger", "🍟 Fries", "🍎 Apple"],
        correct: 3,
        feedback: "Apple is a fruit, others are fast food!",
      },
      {
        prompt: "🌧️ ☀️ ❄️ 🚗 — Which is the ODD ONE OUT?",
        options: ["🌧️ Rain", "☀️ Sun", "❄️ Snow", "🚗 Car"],
        correct: 3,
        feedback: "Car is a vehicle, others are weather!",
      },
    ],
  },
  {
    id: "big-small",
    name: "Big and Small",
    emoji: "📐",
    category: "numeracy",
    questions: [
      {
        prompt: "🐘 vs 🐭 — Which is BIGGER?",
        options: ["🐘 Elephant", "🐭 Mouse", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "🌳 vs 🌱 — Which is BIGGER?",
        options: ["🌱 Seedling", "🌳 Tree", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "🏠 vs 🏚️ — Which is SMALLER?",
        options: ["🏠 House", "🏚️ Hut", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "🦁 vs 🐱 — Which is BIGGER?",
        options: ["🦁 Lion", "🐱 Cat", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "⭐ vs 🌟 — If big star is BIGGER, which should I pick?",
        options: [
          "⭐ Small star",
          "🌟 Big star",
          "They are same",
          "Can't tell",
        ],
        correct: 1,
      },
      {
        prompt: "🍉 vs 🍇 — Which is SMALLER?",
        options: ["🍉 Watermelon", "🍇 Grapes", "They are same", "Can't tell"],
        correct: 1,
      },
    ],
  },
  {
    id: "tall-short",
    name: "Tall and Short",
    emoji: "📏",
    category: "numeracy",
    questions: [
      {
        prompt: "🦒 vs 🐸 — Which is TALLER?",
        options: ["🦒 Giraffe", "🐸 Frog", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "🌴 vs 🌾 — Which is TALLER?",
        options: ["🌴 Palm tree", "🌾 Wheat", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "🐘 vs 🐜 — Which is SHORTER?",
        options: ["🐘 Elephant", "🐜 Ant", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "A building vs a doghouse — which is TALLER?",
        options: ["Doghouse", "Building", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "Your teacher vs a baby — who is TALLER?",
        options: ["Baby", "Teacher", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "🦓 vs 🐇 — Which is SHORTER?",
        options: ["🦓 Zebra", "🐇 Rabbit", "They are same", "Can't tell"],
        correct: 1,
      },
    ],
  },
  {
    id: "heavy-light",
    name: "Heavy and Light",
    emoji: "⚖️",
    category: "numeracy",
    questions: [
      {
        prompt: "🪨 vs 🪶 — Which is HEAVIER?",
        options: ["🪨 Rock", "🪶 Feather", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "🐘 vs 🐦 — Which is LIGHTER?",
        options: ["🐘 Elephant", "🐦 Bird", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "📚 vs 📄 — Which is HEAVIER?",
        options: ["📚 Books", "📄 Paper", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "🍉 vs 🍓 — Which is LIGHTER?",
        options: [
          "🍉 Watermelon",
          "🍓 Strawberry",
          "They are same",
          "Can't tell",
        ],
        correct: 1,
      },
      {
        prompt: "A school bag vs a pencil — which is HEAVIER?",
        options: ["School bag", "Pencil", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A car vs a bicycle — which is HEAVIER?",
        options: ["Car", "Bicycle", "They are same", "Can't tell"],
        correct: 0,
      },
    ],
  },
  {
    id: "long-short",
    name: "Long and Short",
    emoji: "📐",
    category: "numeracy",
    questions: [
      {
        prompt: "🐍 vs 🐛 — Which is LONGER?",
        options: ["🐍 Snake", "🐛 Caterpillar", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A ruler vs a pencil — which is LONGER?",
        options: ["Ruler", "Pencil", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A road vs a footpath — which is LONGER?",
        options: ["Road", "Footpath", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "🦕 vs 🐊 — Which is LONGER?",
        options: ["🦕 Dinosaur", "🐊 Crocodile", "They are same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "Your arm vs your finger — which is SHORTER?",
        options: ["Arm", "Finger", "They are same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "A river vs a swimming pool — which is LONGER?",
        options: ["River", "Swimming pool", "They are same", "Can't tell"],
        correct: 0,
      },
    ],
  },
  {
    id: "empty-full",
    name: "Empty and Full",
    emoji: "🪣",
    category: "numeracy",
    questions: [
      {
        prompt: "A glass with water — is it EMPTY or FULL?",
        options: ["Empty", "Full", "Half full", "Broken"],
        correct: 1,
      },
      {
        prompt: "A bag with no books — is it EMPTY or FULL?",
        options: ["Empty", "Full", "Heavy", "Big"],
        correct: 0,
      },
      {
        prompt: "A bucket filled to the top with water is ___.",
        options: ["Full", "Empty", "Half", "Broken"],
        correct: 0,
      },
      {
        prompt: "A bowl with no food in it is ___.",
        options: ["Full", "Empty", "Heavy", "Hot"],
        correct: 1,
      },
      {
        prompt: "Your tummy after eating a big lunch is ___.",
        options: ["Empty", "Full", "Flat", "Cold"],
        correct: 1,
      },
      {
        prompt: "A bottle with nothing inside is ___.",
        options: ["Full", "Empty", "Heavy", "Big"],
        correct: 1,
      },
    ],
  },
  {
    id: "more-less",
    name: "More and Less",
    emoji: "🔢",
    category: "numeracy",
    questions: [
      {
        prompt: "🍎🍎🍎 vs 🍎🍎 — Which group has MORE?",
        options: [
          "Group 1 (3 apples)",
          "Group 2 (2 apples)",
          "Both same",
          "Can't tell",
        ],
        correct: 0,
      },
      {
        prompt: "⭐ vs ⭐⭐⭐⭐ — Which group has LESS?",
        options: [
          "Group 1 (1 star)",
          "Group 2 (4 stars)",
          "Both same",
          "Can't tell",
        ],
        correct: 0,
      },
      {
        prompt: "🐱🐱🐱🐱🐱 vs 🐱🐱🐱 — Which group has MORE?",
        options: [
          "Group 1 (5 cats)",
          "Group 2 (3 cats)",
          "Both same",
          "Can't tell",
        ],
        correct: 0,
      },
      {
        prompt: "2 cookies vs 7 cookies — which is LESS?",
        options: ["2 cookies", "7 cookies", "Both same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "10 flowers vs 5 flowers — which has MORE?",
        options: ["5 flowers", "10 flowers", "Both same", "Can't tell"],
        correct: 1,
      },
      {
        prompt: "🎈🎈 vs 🎈🎈🎈🎈🎈🎈 — Which is LESS?",
        options: [
          "Group 1 (2 balloons)",
          "Group 2 (6 balloons)",
          "Both same",
          "Can't tell",
        ],
        correct: 0,
      },
    ],
  },
  {
    id: "left-right",
    name: "Left and Right",
    emoji: "👈",
    category: "numeracy",
    questions: [
      {
        prompt: "👈 This hand is pointing in which direction?",
        options: ["Left", "Right", "Up", "Down"],
        correct: 0,
      },
      {
        prompt: "👉 This hand is pointing in which direction?",
        options: ["Left", "Right", "Up", "Down"],
        correct: 1,
      },
      {
        prompt: "We write from ___ to right.",
        options: ["Left", "Right", "Up", "Down"],
        correct: 0,
      },
      {
        prompt: "⬅️ This arrow points to which direction?",
        options: ["Left", "Right", "Up", "Down"],
        correct: 0,
      },
      {
        prompt: "➡️ This arrow points to which direction?",
        options: ["Left", "Right", "Up", "Down"],
        correct: 1,
      },
      {
        prompt:
          "When you face the board, the door is on your left. Is the window on your RIGHT?",
        options: [
          "Yes, right side",
          "No, it is left",
          "It has no window",
          "Can't tell",
        ],
        correct: 0,
      },
    ],
  },
  {
    id: "up-down",
    name: "Up and Down",
    emoji: "⬆️",
    category: "numeracy",
    questions: [
      {
        prompt: "🐦 The bird is flying which direction?",
        options: ["Up", "Down", "Left", "Right"],
        correct: 0,
      },
      {
        prompt: "🍂 A falling leaf goes which direction?",
        options: ["Up", "Down", "Left", "Right"],
        correct: 1,
      },
      {
        prompt: "⬆️ This arrow points?",
        options: ["Up", "Down", "Left", "Right"],
        correct: 0,
      },
      {
        prompt: "⬇️ This arrow points?",
        options: ["Up", "Down", "Left", "Right"],
        correct: 1,
      },
      {
        prompt: "When you jump, you go ___.",
        options: ["Up", "Down", "Left", "Right"],
        correct: 0,
      },
      {
        prompt: "When you sit down, you go ___.",
        options: ["Up", "Down", "Left", "Right"],
        correct: 1,
      },
    ],
  },
  {
    id: "thick-thin",
    name: "Thick and Thin",
    emoji: "📦",
    category: "numeracy",
    questions: [
      {
        prompt: "A dictionary vs a notebook — which is THICKER?",
        options: ["Dictionary", "Notebook", "Both same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A thread vs a rope — which is THINNER?",
        options: ["Thread", "Rope", "Both same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A tree trunk vs a stick — which is THICKER?",
        options: ["Tree trunk", "Stick", "Both same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A pencil vs a marker — which is THINNER?",
        options: ["Pencil", "Marker", "Both same", "Can't tell"],
        correct: 0,
      },
      {
        prompt: "A mattress vs a sheet of paper — which is THICKER?",
        options: ["Mattress", "Paper", "Both same", "Can't tell"],
        correct: 0,
      },
    ],
  },
  {
    id: "hot-cold",
    name: "Hot and Cold",
    emoji: "🌡️",
    category: "numeracy",
    questions: [
      {
        prompt: "🔥 Fire is ___ ",
        options: ["Hot", "Cold", "Warm", "Soft"],
        correct: 0,
      },
      {
        prompt: "🧊 Ice is ___",
        options: ["Hot", "Cold", "Warm", "Wet"],
        correct: 1,
      },
      {
        prompt: "☕ Hot tea is ___",
        options: ["Cold", "Hot", "Wet", "Dry"],
        correct: 1,
      },
      {
        prompt: "❄️ Snow is ___",
        options: ["Hot", "Cold", "Warm", "Soft"],
        correct: 1,
      },
      {
        prompt: "🌞 The sun gives us ___",
        options: ["Cold", "Dark", "Heat/Warmth", "Rain"],
        correct: 2,
      },
      {
        prompt: "🍦 Ice cream feels ___",
        options: ["Hot", "Cold", "Warm", "Dry"],
        correct: 1,
      },
    ],
  },
  {
    id: "shadow-matching",
    name: "Shadow Matching",
    emoji: "🌑",
    category: "numeracy",
    questions: [
      {
        prompt: "🍎 — Which shadow matches this apple?",
        options: [
          "🍎 (apple shape)",
          "🍊 (round)",
          "🍌 (banana shape)",
          "🍇 (bunch)",
        ],
        correct: 0,
      },
      {
        prompt: "🐘 — Which shadow matches this elephant?",
        options: [
          "🐭 (small)",
          "🐘 (large with trunk)",
          "🐊 (long)",
          "🦁 (round)",
        ],
        correct: 1,
      },
      {
        prompt: "⭐ — Which shadow matches a star?",
        options: [
          "⭐ (5 points)",
          "🔵 (round)",
          "🔺 (3 points)",
          "🔷 (diamond)",
        ],
        correct: 0,
      },
      {
        prompt: "🌴 — Which shadow matches a palm tree?",
        options: [
          "🌲 (triangle)",
          "🌴 (tall thin with leaves)",
          "🌻 (round)",
          "🌾 (grain)",
        ],
        correct: 1,
      },
      {
        prompt: "✈️ — Which shadow matches a plane?",
        options: [
          "🚂 (long rectangle)",
          "🚁 (with rotors)",
          "✈️ (wings)",
          "🚀 (rocket)",
        ],
        correct: 2,
      },
      {
        prompt: "🏠 — Which shadow matches a house?",
        options: [
          "🏠 (triangle roof)",
          "⬜ (square)",
          "🔺 (triangle)",
          "🟥 (rectangle)",
        ],
        correct: 0,
      },
    ],
  },
  {
    id: "missing-parts",
    name: "Missing Parts",
    emoji: "🧩",
    category: "numeracy",
    questions: [
      {
        prompt: "A face is missing ___. It has 👁️ but no ___.",
        options: ["Mouth 👄", "Eyes", "Head", "Hair"],
        correct: 0,
      },
      {
        prompt: "A bicycle is missing its ___. It has a seat and frame.",
        options: ["Wheels 🛞", "Engine", "Wings", "Sail"],
        correct: 0,
      },
      {
        prompt: "A clock shows time but the ___ is missing.",
        options: ["Hands", "Frame", "Color", "Battery"],
        correct: 0,
      },
      {
        prompt: "A bird is missing its ___. It has a body and beak.",
        options: ["Wings 🪽", "Teeth", "Paws", "Fins"],
        correct: 0,
      },
      {
        prompt: "A chair has 3 legs — the ___ leg is missing.",
        options: ["4th leg", "1st leg", "Seat", "Back"],
        correct: 0,
      },
    ],
  },
  {
    id: "number-practice",
    name: "Number Practice",
    emoji: "🔢",
    category: "numeracy",
    questions: [
      {
        prompt: "🍎🍎🍎 — How many apples?",
        options: ["2", "3", "4", "5"],
        correct: 1,
      },
      {
        prompt: "⭐⭐⭐⭐⭐ — How many stars?",
        options: ["4", "5", "6", "7"],
        correct: 1,
      },
      {
        prompt: "🐱🐱 — How many cats?",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "🌸🌸🌸🌸🌸🌸🌸 — How many flowers?",
        options: ["5", "6", "7", "8"],
        correct: 2,
      },
      {
        prompt: "1, 2, 3, 4, ___ What comes next?",
        options: ["3", "4", "5", "6"],
        correct: 2,
      },
      {
        prompt: "Show the number FOUR using dots: ●●●●",
        options: ["3", "4", "5", "6"],
        correct: 1,
      },
      {
        prompt: "🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈 — Count the balloons!",
        options: ["8", "9", "10", "11"],
        correct: 2,
      },
      {
        prompt: "Which number comes after 7?",
        options: ["6", "7", "8", "9"],
        correct: 2,
      },
    ],
  },
  {
    id: "fun-shapes",
    name: "Fun with Shapes",
    emoji: "🔷",
    category: "numeracy",
    questions: [
      {
        prompt: "⭕ What shape is this?",
        options: ["Circle", "Square", "Triangle", "Rectangle"],
        correct: 0,
      },
      {
        prompt: "🔲 What shape has 4 equal sides?",
        options: ["Triangle", "Square", "Rectangle", "Circle"],
        correct: 1,
      },
      {
        prompt: "🔺 What shape has 3 sides?",
        options: ["Square", "Circle", "Triangle", "Rectangle"],
        correct: 2,
      },
      {
        prompt: "A door shape is a ___.",
        options: ["Circle", "Triangle", "Square", "Rectangle"],
        correct: 3,
      },
      {
        prompt: "A pizza slice is shaped like a ___.",
        options: ["Circle", "Square", "Triangle", "Rectangle"],
        correct: 2,
      },
      {
        prompt: "A coin is shaped like a ___.",
        options: ["Circle", "Square", "Triangle", "Rectangle"],
        correct: 0,
      },
      {
        prompt: "An egg is shaped like a ___.",
        options: ["Circle", "Oval", "Square", "Triangle"],
        correct: 1,
      },
      {
        prompt: "A star has ___ points.",
        options: ["4", "5", "6", "3"],
        correct: 1,
      },
    ],
  },
  {
    id: "fun-colours",
    name: "Fun with Colours",
    emoji: "🎨",
    category: "numeracy",
    questions: [
      {
        prompt: "🍅 What color is a tomato?",
        options: ["Red", "Blue", "Yellow", "Green"],
        correct: 0,
      },
      {
        prompt: "🌊 What color is the ocean?",
        options: ["Red", "Blue", "Yellow", "Green"],
        correct: 1,
      },
      {
        prompt: "🌻 What color is a sunflower?",
        options: ["Red", "Blue", "Yellow", "Green"],
        correct: 2,
      },
      {
        prompt: "🌿 What color are leaves?",
        options: ["Red", "Blue", "Yellow", "Green"],
        correct: 3,
      },
      {
        prompt: "🍊 What color is an orange?",
        options: ["Red", "Blue", "Orange", "Green"],
        correct: 2,
      },
      {
        prompt: "🍇 What color are grapes?",
        options: ["Orange", "Purple", "Yellow", "Pink"],
        correct: 1,
      },
      {
        prompt: "🐧 What TWO colors does a penguin have?",
        options: [
          "Black and White",
          "Blue and Red",
          "Green and Yellow",
          "Pink and Orange",
        ],
        correct: 0,
      },
      {
        prompt: "☁️ What color are clouds?",
        options: ["Black", "White", "Blue", "Yellow"],
        correct: 1,
      },
      {
        prompt: "🌹 What color is a rose?",
        options: ["Red", "Blue", "Green", "White"],
        correct: 0,
      },
      {
        prompt: "🍫 What color is chocolate?",
        options: ["Black", "White", "Brown", "Red"],
        correct: 2,
      },
    ],
  },
  {
    id: "backward-counting",
    name: "Backward Counting",
    emoji: "⏪",
    category: "numeracy",
    questions: [
      {
        prompt: "10, 9, 8, ___ What comes next?",
        options: ["9", "7", "6", "8"],
        correct: 1,
      },
      {
        prompt: "5, 4, 3, ___ What comes next?",
        options: ["4", "2", "3", "1"],
        correct: 1,
      },
      {
        prompt: "8, 7, ___, 5 What number is missing?",
        options: ["6", "4", "8", "3"],
        correct: 0,
      },
      {
        prompt: "10, ___, 8, 7 What number is missing?",
        options: ["9", "6", "10", "11"],
        correct: 0,
      },
      {
        prompt: "3, 2, 1, ___ What comes next?",
        options: ["2", "0", "1", "3"],
        correct: 1,
      },
      {
        prompt: "7, 6, ___, 4 What number is missing?",
        options: ["5", "3", "6", "8"],
        correct: 0,
      },
      {
        prompt: "Count backwards from 5: 5, 4, 3, 2, ___",
        options: ["0", "1", "2", "3"],
        correct: 1,
      },
      {
        prompt: "9, 8, 7, ___, 5 What is missing?",
        options: ["4", "6", "7", "8"],
        correct: 1,
      },
    ],
  },
  {
    id: "before-between",
    name: "Before, Between & After",
    emoji: "🔢",
    category: "numeracy",
    questions: [
      {
        prompt: "___, 2, 3 — What comes BEFORE 2?",
        options: ["1", "3", "4", "0"],
        correct: 0,
      },
      {
        prompt: "4, ___, 6 — What comes BETWEEN 4 and 6?",
        options: ["3", "5", "7", "4"],
        correct: 1,
      },
      {
        prompt: "7, 8, ___ — What comes AFTER 8?",
        options: ["7", "10", "9", "6"],
        correct: 2,
      },
      {
        prompt: "___, 5, 6 — What comes BEFORE 5?",
        options: ["4", "6", "7", "3"],
        correct: 0,
      },
      {
        prompt: "3, ___, 5 — What number is in the MIDDLE?",
        options: ["2", "6", "4", "3"],
        correct: 2,
      },
      {
        prompt: "9, 10, ___ — What comes AFTER 10?",
        options: ["9", "11", "8", "12"],
        correct: 1,
      },
      {
        prompt: "6, ___, 8 — What is BETWEEN 6 and 8?",
        options: ["5", "9", "7", "6"],
        correct: 2,
      },
      {
        prompt: "___, 3, 4 — What comes BEFORE 3?",
        options: ["2", "4", "5", "1"],
        correct: 0,
      },
    ],
  },
  {
    id: "number-names",
    name: "Number Names",
    emoji: "📝",
    category: "numeracy",
    questions: [
      {
        prompt: "What is the number name for 1?",
        options: ["One", "Two", "Three", "Four"],
        correct: 0,
      },
      {
        prompt: "What is the number name for 5?",
        options: ["Three", "Four", "Five", "Six"],
        correct: 2,
      },
      {
        prompt: "What number does 'Seven' represent?",
        options: ["6", "7", "8", "9"],
        correct: 1,
      },
      {
        prompt: "What is the number name for 10?",
        options: ["Eight", "Nine", "Ten", "Six"],
        correct: 2,
      },
      {
        prompt: "What is the number name for 3?",
        options: ["One", "Two", "Three", "Four"],
        correct: 2,
      },
      {
        prompt: "What number does 'Two' represent?",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "What is the number name for 8?",
        options: ["Six", "Seven", "Eight", "Nine"],
        correct: 2,
      },
      {
        prompt: "What number does 'Four' represent?",
        options: ["3", "4", "5", "6"],
        correct: 1,
      },
    ],
  },
  {
    id: "ordinals",
    name: "Ordinals",
    emoji: "🏆",
    category: "numeracy",
    questions: [
      {
        prompt: "🥇 Gold medal = which position?",
        options: ["1st", "2nd", "3rd", "4th"],
        correct: 0,
      },
      {
        prompt: "🥈 Silver medal = which position?",
        options: ["1st", "2nd", "3rd", "4th"],
        correct: 1,
      },
      {
        prompt: "🥉 Bronze medal = which position?",
        options: ["1st", "2nd", "3rd", "4th"],
        correct: 2,
      },
      {
        prompt: "1st means ___",
        options: ["First", "Second", "Third", "Fourth"],
        correct: 0,
      },
      {
        prompt: "2nd means ___",
        options: ["First", "Second", "Third", "Fourth"],
        correct: 1,
      },
      {
        prompt: "The person who finishes FIRST is in the ___ position.",
        options: ["1st", "2nd", "3rd", "Last"],
        correct: 0,
      },
    ],
  },
  {
    id: "one-more-less",
    name: "One More, One Less",
    emoji: "➕",
    category: "numeracy",
    questions: [
      {
        prompt: "One MORE than 3 is ___",
        options: ["2", "3", "4", "5"],
        correct: 2,
      },
      {
        prompt: "One LESS than 5 is ___",
        options: ["3", "4", "5", "6"],
        correct: 1,
      },
      {
        prompt: "One MORE than 7 is ___",
        options: ["6", "7", "8", "9"],
        correct: 2,
      },
      {
        prompt: "One LESS than 10 is ___",
        options: ["8", "9", "10", "11"],
        correct: 1,
      },
      {
        prompt: "One MORE than 1 is ___",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "One LESS than 4 is ___",
        options: ["2", "3", "4", "5"],
        correct: 1,
      },
      {
        prompt: "One MORE than 9 is ___",
        options: ["8", "9", "10", "11"],
        correct: 2,
      },
      {
        prompt: "One LESS than 2 is ___",
        options: ["0", "1", "2", "3"],
        correct: 1,
      },
    ],
  },
  {
    id: "counting-objects",
    name: "Counting Objects",
    emoji: "🔢",
    category: "numeracy",
    questions: [
      {
        prompt: "How many apples are there? 🍎🍎",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "How many stars are there? ⭐⭐⭐",
        options: ["2", "3", "4", "5"],
        correct: 1,
      },
      {
        prompt: "How many balls are there? 🏀🏀🏀🏀",
        options: ["3", "4", "5", "6"],
        correct: 1,
      },
      {
        prompt: "How many flowers are there? 🌸🌸🌸🌸🌸",
        options: ["4", "5", "6", "7"],
        correct: 1,
      },
      {
        prompt: "How many birds are there? 🐦🐦🐦🐦🐦🐦",
        options: ["5", "6", "7", "8"],
        correct: 1,
      },
      {
        prompt: "How many cars are there? 🚗🚗🚗🚗🚗🚗🚗",
        options: ["6", "7", "8", "9"],
        correct: 1,
      },
      {
        prompt: "How many fish are there? 🐟🐟🐟🐟🐟🐟🐟🐟",
        options: ["7", "8", "9", "10"],
        correct: 1,
      },
      {
        prompt: "How many hearts are there? ❤️❤️❤️❤️❤️❤️❤️❤️❤️",
        options: ["8", "9", "10", "11"],
        correct: 1,
      },
    ],
  },
  {
    id: "number-matching",
    name: "Number Matching",
    emoji: "🔗",
    category: "numeracy",
    questions: [
      {
        prompt: "Which number matches the word ONE?",
        options: ["1", "2", "3", "4"],
        correct: 0,
      },
      {
        prompt: "Which number matches the word TWO?",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "Which number matches the word THREE?",
        options: ["1", "2", "3", "4"],
        correct: 2,
      },
      {
        prompt: "Which number matches the word FOUR?",
        options: ["2", "3", "5", "4"],
        correct: 3,
      },
      {
        prompt: "Which number matches the word FIVE?",
        options: ["5", "6", "7", "8"],
        correct: 0,
      },
      {
        prompt: "Which number matches the word SIX?",
        options: ["5", "6", "7", "8"],
        correct: 1,
      },
      {
        prompt: "Which number matches the word SEVEN?",
        options: ["5", "6", "7", "8"],
        correct: 2,
      },
      {
        prompt: "Which number matches the word EIGHT?",
        options: ["5", "6", "7", "8"],
        correct: 3,
      },
    ],
  },
  {
    id: "simple-addition",
    name: "Simple Addition",
    emoji: "➕",
    category: "numeracy",
    questions: [
      {
        prompt: "1 + 1 = ?",
        options: ["2", "3", "4", "1"],
        correct: 0,
      },
      {
        prompt: "2 + 1 = ?",
        options: ["2", "3", "4", "5"],
        correct: 1,
      },
      {
        prompt: "2 + 2 = ?",
        options: ["3", "5", "4", "6"],
        correct: 2,
      },
      {
        prompt: "3 + 1 = ?",
        options: ["3", "5", "6", "4"],
        correct: 3,
      },
      {
        prompt: "3 + 2 = ?",
        options: ["5", "6", "4", "7"],
        correct: 0,
      },
      {
        prompt: "4 + 1 = ?",
        options: ["4", "5", "6", "7"],
        correct: 1,
      },
      {
        prompt: "2 + 3 = ?",
        options: ["4", "6", "5", "7"],
        correct: 2,
      },
      {
        prompt: "5 + 1 = ?",
        options: ["5", "7", "8", "6"],
        correct: 3,
      },
    ],
  },
  {
    id: "patterns",
    name: "Patterns",
    emoji: "🔁",
    category: "numeracy",
    questions: [
      {
        prompt: "What comes next? Red Blue Red Blue ___",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct: 0,
      },
      {
        prompt: "What comes next? Big Small Big Small ___",
        options: ["Big", "Small", "Medium", "Tiny"],
        correct: 1,
      },
      {
        prompt: "What comes next? Circle Square Circle Square ___",
        options: ["Square", "Circle", "Triangle", "Star"],
        correct: 1,
      },
      {
        prompt: "What comes next? Apple Orange Apple Orange ___",
        options: ["Orange", "Banana", "Apple", "Mango"],
        correct: 2,
      },
      {
        prompt: "What comes next? Cat Dog Cat Dog ___",
        options: ["Rabbit", "Dog", "Cat", "Bird"],
        correct: 2,
      },
      {
        prompt: "What comes next? 1 2 1 2 ___",
        options: ["3", "2", "4", "1"],
        correct: 3,
      },
      {
        prompt: "What comes next? Red Blue Green Red Blue ___",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct: 2,
      },
      {
        prompt: "What comes next? Up Down Up Down ___",
        options: ["Down", "Up", "Left", "Right"],
        correct: 1,
      },
    ],
  },
  {
    id: "days-of-week",
    name: "Days of the Week",
    emoji: "📅",
    category: "numeracy",
    questions: [
      {
        prompt: "What day comes after Monday?",
        options: ["Tuesday", "Wednesday", "Sunday", "Thursday"],
        correct: 0,
      },
      {
        prompt: "What is the first day of the week?",
        options: ["Monday", "Sunday", "Saturday", "Friday"],
        correct: 1,
      },
      {
        prompt: "How many days are in a week?",
        options: ["5", "6", "7", "8"],
        correct: 2,
      },
      {
        prompt: "Which day comes before Sunday?",
        options: ["Monday", "Friday", "Thursday", "Saturday"],
        correct: 3,
      },
      {
        prompt: "What day comes after Friday?",
        options: ["Saturday", "Sunday", "Monday", "Tuesday"],
        correct: 0,
      },
      {
        prompt: "What day comes after Wednesday?",
        options: ["Friday", "Thursday", "Tuesday", "Monday"],
        correct: 1,
      },
      {
        prompt: "Which day comes between Tuesday and Thursday?",
        options: ["Monday", "Friday", "Wednesday", "Saturday"],
        correct: 2,
      },
      {
        prompt: "What is the last day of the school week?",
        options: ["Thursday", "Saturday", "Sunday", "Friday"],
        correct: 3,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Category 3: General Awareness
// ─────────────────────────────────────────────────────────────
const awarenessTopics: LKGTopic[] = [
  {
    id: "this-is-me",
    name: "This is Me",
    emoji: "🧒",
    category: "awareness",
    questions: [
      {
        prompt: "What do you use to SEE?",
        options: ["Eyes 👁️", "Ears", "Nose", "Mouth"],
        correct: 0,
      },
      {
        prompt: "What do you use to HEAR?",
        options: ["Eyes", "Ears 👂", "Nose", "Mouth"],
        correct: 1,
      },
      {
        prompt: "What do you use to SMELL?",
        options: ["Eyes", "Ears", "Nose 👃", "Mouth"],
        correct: 2,
      },
      {
        prompt: "What do you use to TASTE?",
        options: ["Eyes", "Ears", "Nose", "Tongue 👅"],
        correct: 3,
      },
      {
        prompt: "How many eyes do you have?",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
    ],
  },
  {
    id: "my-body",
    name: "My Body",
    emoji: "🦾",
    category: "awareness",
    questions: [
      {
        prompt: "👁️ What is this?",
        options: ["Eye", "Ear", "Nose", "Mouth"],
        correct: 0,
      },
      {
        prompt: "👂 What is this?",
        options: ["Eye", "Ear", "Nose", "Mouth"],
        correct: 1,
      },
      {
        prompt: "👃 What is this?",
        options: ["Eye", "Ear", "Nose", "Mouth"],
        correct: 2,
      },
      {
        prompt: "👄 What is this?",
        options: ["Eye", "Ear", "Nose", "Mouth"],
        correct: 3,
      },
      {
        prompt: "✋ What is this?",
        options: ["Foot", "Hand", "Leg", "Head"],
        correct: 1,
      },
      {
        prompt: "🦵 What is this?",
        options: ["Arm", "Hand", "Leg", "Foot"],
        correct: 2,
      },
    ],
  },
  {
    id: "body-helps-me",
    name: "My Body Helps Me",
    emoji: "💪",
    category: "awareness",
    questions: [
      {
        prompt: "👁️ My EYES help me to...",
        options: ["Hear sounds", "See things", "Smell flowers", "Taste food"],
        correct: 1,
      },
      {
        prompt: "👂 My EARS help me to...",
        options: ["See colours", "Touch things", "Hear sounds", "Taste food"],
        correct: 2,
      },
      {
        prompt: "👃 My NOSE helps me to...",
        options: ["Hear music", "Smell flowers", "See pictures", "Walk fast"],
        correct: 1,
      },
      {
        prompt: "👄 My MOUTH helps me to...",
        options: ["See things", "Hear things", "Eat and speak", "Smell things"],
        correct: 2,
      },
      {
        prompt: "✋ My HANDS help me to...",
        options: [
          "Run and jump",
          "Write and hold things",
          "See colours",
          "Hear music",
        ],
        correct: 1,
      },
      {
        prompt: "🦵 My LEGS help me to...",
        options: ["Write letters", "Taste food", "Walk and run", "Hear sounds"],
        correct: 2,
      },
      {
        prompt: "🦷 My TEETH help me to...",
        options: ["See clearly", "Chew food", "Hear well", "Smell nice things"],
        correct: 1,
      },
      {
        prompt: "Which body part helps you SMELL flowers? 🌸",
        options: ["Eyes", "Ears", "Nose", "Hands"],
        correct: 2,
      },
      {
        prompt: "Which body part helps you SEE beautiful colours? 🌈",
        options: ["Ears", "Nose", "Hands", "Eyes"],
        correct: 3,
      },
      {
        prompt: "Which body part helps you HEAR your teacher? 🎤",
        options: ["Eyes", "Ears", "Nose", "Mouth"],
        correct: 1,
      },
      {
        prompt: "Which body part helps you WRITE in your notebook? ✏️",
        options: ["Legs", "Ears", "Hands", "Eyes"],
        correct: 2,
      },
      {
        prompt: "Which body part helps you KICK a ball? ⚽",
        options: ["Hands", "Ears", "Nose", "Legs"],
        correct: 3,
      },
      {
        prompt: "Which body part helps you TASTE yummy food? 🍎",
        options: ["Nose", "Ears", "Eyes", "Tongue"],
        correct: 3,
      },
      {
        prompt: "Which body part helps you HUG someone you love? 🤗",
        options: ["Legs", "Arms", "Ears", "Nose"],
        correct: 1,
      },
      {
        prompt: "Which body part do you use to THINK? 🧠",
        options: ["Hands", "Legs", "Brain", "Nose"],
        correct: 2,
      },
      {
        prompt: "My BRAIN helps me to...",
        options: ["Run fast", "Think and learn", "Smell things", "Hear music"],
        correct: 1,
      },
    ],
  },
  {
    id: "human-body-explorer",
    name: "Human Body Explorer",
    emoji: "🫀",
    category: "awareness",
    questions: [
      {
        prompt: "🫀 What pumps blood all over your body?",
        options: ["Lungs", "Brain", "Heart", "Stomach"],
        correct: 2,
      },
      {
        prompt: "🫁 What helps you BREATHE?",
        options: ["Heart", "Lungs", "Stomach", "Eyes"],
        correct: 1,
      },
      {
        prompt: "🦴 What holds your body up and gives it shape?",
        options: ["Muscles", "Skin", "Bones", "Heart"],
        correct: 2,
      },
      {
        prompt: "💪 What helps you lift and move things?",
        options: ["Bones", "Muscles", "Brain", "Lungs"],
        correct: 1,
      },
      {
        prompt: "🧠 The BRAIN is inside your...",
        options: ["Chest", "Tummy", "Head", "Arms"],
        correct: 2,
      },
      {
        prompt: "❤️ You can feel your HEART beat in your...",
        options: ["Head", "Hands", "Chest", "Legs"],
        correct: 2,
      },
      {
        prompt: "🦷 We brush our TEETH to keep them...",
        options: ["Yellow", "Clean and healthy", "Wet", "Cold"],
        correct: 1,
      },
      {
        prompt: "🌡️ Our body stays warm because of our...",
        options: ["Bones", "Blood and heart", "Nose", "Ears"],
        correct: 1,
      },
      {
        prompt:
          "👁️ We should NOT look directly at the SUN because it can hurt our...",
        options: ["Ears", "Hands", "Eyes", "Legs"],
        correct: 2,
      },
      {
        prompt: "🍎 Food goes into your STOMACH when you...",
        options: ["Sleep", "Run", "Eat", "Hear"],
        correct: 2,
      },
      {
        prompt: "🩺 We should visit a DOCTOR to keep our body...",
        options: ["Tired", "Dirty", "Healthy", "Hungry"],
        correct: 2,
      },
      {
        prompt: "How many eyes does a person have?",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "How many ears does a person have?",
        options: ["1", "2", "3", "4"],
        correct: 1,
      },
      {
        prompt: "What covers the outside of our body?",
        options: ["Bones", "Muscles", "Skin", "Blood"],
        correct: 2,
      },
      {
        prompt: "🏃 We exercise to keep our BODY...",
        options: ["Tired", "Strong and healthy", "Dirty", "Cold"],
        correct: 1,
      },
    ],
  },
  {
    id: "body-parts-quiz",
    name: "Body Parts Quiz",
    emoji: "🧍",
    category: "awareness",
    questions: [
      {
        prompt: "👆 Point to the TOP of your body. What is it?",
        options: ["Feet", "Tummy", "Head", "Knees"],
        correct: 2,
      },
      {
        prompt: "What do we use to WALK on the ground?",
        options: ["Hands", "Head", "Feet", "Ears"],
        correct: 2,
      },
      {
        prompt: "What body part connects your head to your chest?",
        options: ["Arm", "Neck", "Leg", "Knee"],
        correct: 1,
      },
      {
        prompt: "What part of the leg bends when you sit down?",
        options: ["Elbow", "Wrist", "Knee", "Ankle"],
        correct: 2,
      },
      {
        prompt: "What part of the arm bends when you lift something?",
        options: ["Knee", "Ankle", "Elbow", "Wrist"],
        correct: 2,
      },
      {
        prompt: "🖐️ How many fingers are on ONE hand?",
        options: ["3", "4", "5", "6"],
        correct: 2,
      },
      {
        prompt: "How many toes are on ONE foot?",
        options: ["3", "4", "5", "6"],
        correct: 2,
      },
      {
        prompt: "Where are your SHOULDERS?",
        options: [
          "Below your knees",
          "On your face",
          "Top of your arms",
          "On your feet",
        ],
        correct: 2,
      },
      {
        prompt: "What body part is on your face that you BREATHE with?",
        options: ["Eyes", "Ears", "Nose", "Forehead"],
        correct: 2,
      },
      {
        prompt: "What part of your face helps you SMILE?",
        options: ["Nose", "Ears", "Eyes", "Mouth"],
        correct: 3,
      },
      {
        prompt: "🪥 We brush our teeth TWO times a day - morning and...",
        options: ["Afternoon", "Lunchtime", "Night", "Evening"],
        correct: 2,
      },
      {
        prompt: "🚿 We WASH our hands before...",
        options: ["Playing", "Sleeping", "Eating", "Running"],
        correct: 2,
      },
    ],
  },
  {
    id: "how-i-feel",
    name: "How I Feel",
    emoji: "😊",
    category: "awareness",
    questions: [
      {
        prompt: "😊 What feeling is this?",
        options: ["Happy", "Sad", "Angry", "Scared"],
        correct: 0,
      },
      {
        prompt: "😢 What feeling is this?",
        options: ["Happy", "Sad", "Angry", "Scared"],
        correct: 1,
      },
      {
        prompt: "😠 What feeling is this?",
        options: ["Happy", "Sad", "Angry", "Scared"],
        correct: 2,
      },
      {
        prompt: "😨 What feeling is this?",
        options: ["Happy", "Sad", "Angry", "Scared"],
        correct: 3,
      },
      {
        prompt: "😴 What feeling is this?",
        options: ["Happy", "Sleepy", "Angry", "Excited"],
        correct: 1,
      },
      {
        prompt: "🤩 What feeling is this?",
        options: ["Sad", "Bored", "Excited", "Scared"],
        correct: 2,
      },
    ],
  },
  {
    id: "i-can-be-healthy",
    name: "I Can Be Healthy",
    emoji: "🥦",
    category: "awareness",
    questions: [
      {
        prompt: "What should you do to STAY HEALTHY?",
        options: [
          "Exercise regularly",
          "Eat junk food",
          "Stay up all night",
          "Skip meals",
        ],
        correct: 0,
      },
      {
        prompt: "How often should you BRUSH your teeth?",
        options: ["Once a week", "Twice a day", "Never", "Once a month"],
        correct: 1,
      },
      {
        prompt: "What should you eat for good health?",
        options: [
          "Only sweets",
          "Fruits and vegetables",
          "Only chips",
          "Nothing",
        ],
        correct: 1,
      },
      {
        prompt: "How much water should you drink daily?",
        options: ["No water", "Only 1 sip", "Plenty of water", "Only juice"],
        correct: 2,
      },
      {
        prompt: "What is GOOD for your eyes?",
        options: [
          "Watch TV all day",
          "Read in dark",
          "Sleep well and eat carrots",
          "Rub your eyes hard",
        ],
        correct: 2,
      },
    ],
  },
  {
    id: "things-i-can-do",
    name: "Things I Can Do",
    emoji: "🏃",
    category: "awareness",
    questions: [
      {
        prompt: "Which can YOU do?",
        options: [
          "Fly like a bird",
          "Run and jump",
          "Breathe fire",
          "Live underwater",
        ],
        correct: 1,
      },
      {
        prompt: "Which is something children CAN do?",
        options: [
          "Lift a car",
          "Draw a picture",
          "Fly without wings",
          "Never sleep",
        ],
        correct: 1,
      },
      {
        prompt: "Which CAN you do by yourself?",
        options: [
          "Drive a car",
          "Tie your shoes",
          "Build a rocket",
          "Control weather",
        ],
        correct: 1,
      },
      {
        prompt: "Which is a REAL thing you can do?",
        options: [
          "Become invisible",
          "Sing a song",
          "Walk through walls",
          "Jump to the moon",
        ],
        correct: 1,
      },
      {
        prompt: "Which activity can you do at school?",
        options: ["Cook a meal", "Read a book", "Drive a bus", "Build a house"],
        correct: 1,
      },
    ],
  },
  {
    id: "keeping-clean",
    name: "Keeping Clean",
    emoji: "🪥",
    category: "awareness",
    questions: [
      {
        prompt: "What do you use to BRUSH your teeth?",
        options: ["Comb", "Toothbrush", "Towel", "Soap"],
        correct: 1,
      },
      {
        prompt: "What do you use to WASH your hands?",
        options: ["Toothbrush", "Comb", "Soap and water", "Towel only"],
        correct: 2,
      },
      {
        prompt: "When should you WASH your hands?",
        options: [
          "Never",
          "Only at night",
          "Before eating and after toilet",
          "Only when playing",
        ],
        correct: 2,
      },
      {
        prompt: "What do you use to COMB your hair?",
        options: ["Brush", "Comb", "Soap", "Towel"],
        correct: 1,
      },
      {
        prompt: "What do you use to take a BATH?",
        options: ["Soap and water", "Sand", "Dust", "Dry cloth"],
        correct: 0,
      },
    ],
  },
  {
    id: "this-is-my-family",
    name: "This is My Family",
    emoji: "👨‍👩‍👧‍👦",
    category: "awareness",
    questions: [
      {
        prompt: "Who is your FATHER'S mother?",
        options: ["Grandmother", "Aunt", "Sister", "Mother"],
        correct: 0,
      },
      {
        prompt: "Who is your MOTHER'S brother?",
        options: ["Uncle", "Father", "Cousin", "Grandfather"],
        correct: 0,
      },
      {
        prompt: "Your parents' children are your ___.",
        options: [
          "Cousins",
          "Friends",
          "Siblings (brothers/sisters)",
          "Neighbors",
        ],
        correct: 2,
      },
      {
        prompt: "Your father and mother are your ___.",
        options: ["Teachers", "Parents", "Friends", "Neighbors"],
        correct: 1,
      },
      {
        prompt: "Your father's father is your ___.",
        options: ["Uncle", "Grandfather", "Cousin", "Brother"],
        correct: 1,
      },
    ],
  },
  {
    id: "family-time",
    name: "Family Time",
    emoji: "🏡",
    category: "awareness",
    questions: [
      {
        prompt: "What do families do TOGETHER at home?",
        options: [
          "Fight all day",
          "Eat meals together",
          "Ignore each other",
          "Never talk",
        ],
        correct: 1,
      },
      {
        prompt: "How should you treat your family members?",
        options: [
          "Rudely",
          "With love and respect",
          "Ignore them",
          "Only talk to parents",
        ],
        correct: 1,
      },
      {
        prompt: "What is a fun family activity?",
        options: [
          "Watching TV alone",
          "Playing games together",
          "Arguing",
          "Sleeping all day",
        ],
        correct: 1,
      },
      {
        prompt: "Who in your family do you live WITH?",
        options: [
          "Only friends",
          "Parents, siblings, grandparents",
          "Only teachers",
          "Nobody",
        ],
        correct: 1,
      },
      {
        prompt: "Family members help each other. TRUE or FALSE?",
        options: ["True", "False", "Sometimes", "Never"],
        correct: 0,
      },
    ],
  },
  {
    id: "my-lovely-house",
    name: "My Lovely House",
    emoji: "🏠",
    category: "awareness",
    questions: [
      {
        prompt: "What is a house MADE OF?",
        options: ["Paper", "Bricks and cement", "Water", "Leaves only"],
        correct: 1,
      },
      {
        prompt: "What PROTECTS us from rain in a house?",
        options: ["Walls", "Roof", "Floor", "Door"],
        correct: 1,
      },
      {
        prompt: "What do we use to ENTER a house?",
        options: ["Window", "Roof", "Door", "Wall"],
        correct: 2,
      },
      {
        prompt: "A house keeps us SAFE from ___.",
        options: ["Food", "Rain, wind and cold", "School", "Friends"],
        correct: 1,
      },
      {
        prompt: "What do we have in every room of the house?",
        options: [
          "Swimming pool",
          "Floor, walls and ceiling",
          "Garden",
          "Garage",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "rooms-in-my-house",
    name: "Rooms in My House",
    emoji: "🛋️",
    category: "awareness",
    questions: [
      {
        prompt: "Where do you SLEEP in the house?",
        options: ["Kitchen", "Bedroom", "Bathroom", "Garage"],
        correct: 1,
      },
      {
        prompt: "Where do you COOK food?",
        options: ["Bedroom", "Living room", "Kitchen", "Bathroom"],
        correct: 2,
      },
      {
        prompt: "Where do you take a BATH?",
        options: ["Kitchen", "Bedroom", "Living room", "Bathroom"],
        correct: 3,
      },
      {
        prompt: "Where does the family sit together and watch TV?",
        options: ["Bedroom", "Living room", "Kitchen", "Bathroom"],
        correct: 1,
      },
      {
        prompt: "Where do you store your CAR?",
        options: ["Bedroom", "Kitchen", "Garage", "Bathroom"],
        correct: 2,
      },
      {
        prompt: "Which room has a STOVE for cooking?",
        options: ["Bedroom", "Kitchen", "Living room", "Garage"],
        correct: 1,
      },
    ],
  },
  {
    id: "this-is-my-school",
    name: "This is My School",
    emoji: "🏫",
    category: "awareness",
    questions: [
      {
        prompt: "Who TEACHES you at school?",
        options: ["Doctor", "Teacher", "Chef", "Driver"],
        correct: 1,
      },
      {
        prompt: "What do you do at SCHOOL?",
        options: ["Sleep all day", "Learn and play", "Cook food", "Drive cars"],
        correct: 1,
      },
      {
        prompt: "What do you carry to school?",
        options: ["Suitcase", "School bag", "Fridge", "TV"],
        correct: 1,
      },
      {
        prompt: "Who is the HEAD of the school?",
        options: ["Student", "Principal", "Gardener", "Cook"],
        correct: 1,
      },
      {
        prompt: "What time does school usually START?",
        options: [
          "Late at night",
          "In the morning",
          "At midnight",
          "At sunset",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "my-classroom",
    name: "My Classroom",
    emoji: "📚",
    category: "awareness",
    questions: [
      {
        prompt: "What do you use to write on a BLACKBOARD?",
        options: ["Pencil", "Chalk", "Pen", "Crayon"],
        correct: 1,
      },
      {
        prompt: "Where do STUDENTS sit in the classroom?",
        options: [
          "On the floor",
          "On benches/chairs",
          "On the roof",
          "Outside",
        ],
        correct: 1,
      },
      {
        prompt: "What does the TEACHER write on?",
        options: ["Paper", "Blackboard/Whiteboard", "Wall", "Table"],
        correct: 1,
      },
      {
        prompt: "What do you use to WRITE in a notebook?",
        options: ["Chalk", "Pencil or pen", "Brush", "Stick"],
        correct: 1,
      },
      {
        prompt: "What are books used for?",
        options: [
          "Playing only",
          "Learning and reading",
          "Building houses",
          "Making food",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "other-places-school",
    name: "Other Places in School",
    emoji: "🏃",
    category: "awareness",
    questions: [
      {
        prompt: "Where do you PLAY at school?",
        options: ["Library", "Playground", "Kitchen", "Office"],
        correct: 1,
      },
      {
        prompt: "Where can you find books to READ at school?",
        options: ["Playground", "Library", "Bathroom", "Kitchen"],
        correct: 1,
      },
      {
        prompt: "Where does the principal WORK?",
        options: ["Classroom", "Principal's office", "Playground", "Library"],
        correct: 1,
      },
      {
        prompt: "Where do students eat their lunch at school?",
        options: [
          "Library",
          "Classroom",
          "Canteen/Lunch room",
          "Principal's office",
        ],
        correct: 2,
      },
      {
        prompt: "Where are sick students taken at school?",
        options: ["Library", "Playground", "Medical/Sick room", "Kitchen"],
        correct: 2,
      },
    ],
  },
  {
    id: "fun-with-friends",
    name: "Fun with Friends",
    emoji: "👫",
    category: "awareness",
    questions: [
      {
        prompt: "What do GOOD friends do?",
        options: [
          "Fight all the time",
          "Share and help each other",
          "Ignore each other",
          "Take things without asking",
        ],
        correct: 1,
      },
      {
        prompt: "If a friend is SAD, you should ___.",
        options: [
          "Ignore them",
          "Laugh at them",
          "Comfort and help them",
          "Walk away",
        ],
        correct: 2,
      },
      {
        prompt: "How should you TREAT your friends?",
        options: [
          "Rudely",
          "Kindly and with respect",
          "Push them away",
          "Never talk to them",
        ],
        correct: 1,
      },
      {
        prompt: "What should you do if you want to use a friend's toy?",
        options: ["Grab it", "Ask permission", "Break it", "Hide it"],
        correct: 1,
      },
      {
        prompt: "Good friends ___.",
        options: [
          "Make you feel bad",
          "Support and care for you",
          "Always argue",
          "Take your things",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "my-neighbourhood",
    name: "My Neighbourhood",
    emoji: "🏘️",
    category: "awareness",
    questions: [
      {
        prompt: "Who lives NEAR your house?",
        options: ["Strangers", "Neighbours", "Only family", "Nobody"],
        correct: 1,
      },
      {
        prompt: "How should you treat your NEIGHBOURS?",
        options: [
          "Rudely",
          "With kindness and respect",
          "Ignore them",
          "Bother them",
        ],
        correct: 1,
      },
      {
        prompt: "Your neighbourhood is where ___.",
        options: [
          "Only you live",
          "People live close together",
          "Only shops exist",
          "Only schools are",
        ],
        correct: 1,
      },
      {
        prompt: "Who can help you if you are LOST in your neighbourhood?",
        options: [
          "A stranger on internet",
          "A trusted neighbour or police",
          "Nobody",
          "A baby",
        ],
        correct: 1,
      },
      {
        prompt: "What is a park in your neighbourhood used for?",
        options: [
          "Sleeping",
          "Cooking",
          "Playing and relaxing",
          "Building houses",
        ],
        correct: 2,
      },
    ],
  },
  {
    id: "places-near-house",
    name: "Places Near My House",
    emoji: "🗺️",
    category: "awareness",
    questions: [
      {
        prompt: "Where do you BUY vegetables?",
        options: ["School", "Market/Shop", "Hospital", "Temple"],
        correct: 1,
      },
      {
        prompt: "Where do you go when you are SICK?",
        options: ["Market", "School", "Hospital", "Park"],
        correct: 2,
      },
      {
        prompt: "Where do you go to PRAY?",
        options: ["Hospital", "Market", "Temple/Mosque/Church", "Park"],
        correct: 2,
      },
      {
        prompt: "Where do BUSES and TRAINS stop?",
        options: ["Hospital", "Bus stand/Railway station", "School", "Park"],
        correct: 1,
      },
      {
        prompt: "Where can you take out MONEY?",
        options: ["Temple", "Bank/ATM", "School", "Park"],
        correct: 1,
      },
      {
        prompt: "Where do FIREFIGHTERS work from?",
        options: ["Police station", "Hospital", "Fire station", "School"],
        correct: 2,
      },
    ],
  },
  {
    id: "people-who-help-us",
    name: "People Who Help Us",
    emoji: "🤝",
    category: "awareness",
    questions: [
      {
        prompt: "🧑‍🚒 Who helps when there is a FIRE?",
        options: ["Teacher", "Firefighter", "Chef", "Pilot"],
        correct: 1,
      },
      {
        prompt: "👨‍⚕️ Who helps when you are SICK?",
        options: ["Firefighter", "Police", "Doctor", "Driver"],
        correct: 2,
      },
      {
        prompt: "👮 Who keeps us SAFE on the streets?",
        options: ["Chef", "Police officer", "Farmer", "Pilot"],
        correct: 1,
      },
      {
        prompt: "👨‍🌾 Who grows our FOOD?",
        options: ["Pilot", "Doctor", "Farmer", "Police"],
        correct: 2,
      },
      {
        prompt: "✈️ Who flies an AIRPLANE?",
        options: ["Driver", "Pilot", "Cook", "Farmer"],
        correct: 1,
      },
      {
        prompt: "👩‍🏫 Who TEACHES you at school?",
        options: ["Doctor", "Police", "Teacher", "Chef"],
        correct: 2,
      },
    ],
  },
  {
    id: "being-safe-home",
    name: "Being Safe at Home",
    emoji: "🏠",
    category: "awareness",
    questions: [
      {
        prompt: "Should you TOUCH electrical sockets?",
        options: [
          "Yes, always",
          "No, it is dangerous",
          "Only sometimes",
          "Yes, if curious",
        ],
        correct: 1,
      },
      {
        prompt: "Should you play with SHARP objects like knives?",
        options: [
          "Yes, it's fun",
          "No, it's dangerous",
          "Only big knives",
          "Yes with friends",
        ],
        correct: 1,
      },
      {
        prompt: "If a GAS LEAK smell is noticed, you should ___.",
        options: [
          "Light a matchstick",
          "Tell an adult immediately",
          "Ignore it",
          "Keep playing",
        ],
        correct: 1,
      },
      {
        prompt: "Should you climb HIGH places alone?",
        options: [
          "Yes, always",
          "No, you may fall",
          "Only outside",
          "Yes if no one is watching",
        ],
        correct: 1,
      },
      {
        prompt: "What should you do if a STRANGER calls your home?",
        options: [
          "Open the door immediately",
          "Tell your parents first",
          "Go alone",
          "Ignore it completely",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "being-safe-school",
    name: "Being Safe at School",
    emoji: "🏫",
    category: "awareness",
    questions: [
      {
        prompt: "During a FIRE DRILL at school you should ___.",
        options: [
          "Stay in class",
          "Follow the teacher and exit calmly",
          "Run and push others",
          "Hide under the table",
        ],
        correct: 1,
      },
      {
        prompt: "Should you PUSH others on stairs at school?",
        options: [
          "Yes, it's fun",
          "No, it is dangerous",
          "Only sometimes",
          "Yes when rushing",
        ],
        correct: 1,
      },
      {
        prompt: "If someone BULLIES you at school, you should ___.",
        options: [
          "Fight back alone",
          "Tell a teacher",
          "Ignore it always",
          "Run away from school",
        ],
        correct: 1,
      },
      {
        prompt: "Should you run in the CLASSROOM?",
        options: [
          "Yes, always",
          "No, walk carefully",
          "Only when late",
          "Yes when playing",
        ],
        correct: 1,
      },
      {
        prompt: "Should you talk to STRANGERS who come to school?",
        options: [
          "Yes, always",
          "No, tell your teacher",
          "Only nice ones",
          "Yes if they smile",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "being-safe-playground",
    name: "Being Safe at Playground",
    emoji: "🛝",
    category: "awareness",
    questions: [
      {
        prompt: "What should you NOT do on a SLIDE?",
        options: [
          "Sit properly",
          "Go head first / push others",
          "Wait your turn",
          "Hold the sides",
        ],
        correct: 1,
      },
      {
        prompt: "Before getting on a SWING, you should ___.",
        options: [
          "Run very fast",
          "Check it is safe and sit properly",
          "Push the swing hard",
          "Stand on the swing",
        ],
        correct: 1,
      },
      {
        prompt: "Should you PUSH others at the playground?",
        options: [
          "Yes, it is fun",
          "No, they may fall and get hurt",
          "Only small children",
          "Only when playing tag",
        ],
        correct: 1,
      },
      {
        prompt: "What should you do if you GET HURT at playground?",
        options: [
          "Hide the injury",
          "Tell a teacher or adult",
          "Keep playing",
          "Cry quietly alone",
        ],
        correct: 1,
      },
      {
        prompt: "Where should you PLAY safely?",
        options: [
          "Near the road",
          "In the designated play area",
          "On the rooftop",
          "In the parking lot",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "being-safe-staircase",
    name: "Being Safe on Staircase",
    emoji: "🪜",
    category: "awareness",
    questions: [
      {
        prompt: "When walking on STAIRS, you should ___.",
        options: [
          "Run fast",
          "Hold the railing",
          "Jump the steps",
          "Push others",
        ],
        correct: 1,
      },
      {
        prompt: "Should you RUN on the staircase?",
        options: [
          "Yes, it saves time",
          "No, it is dangerous",
          "Only going down",
          "Only going up",
        ],
        correct: 1,
      },
      {
        prompt: "How should you go DOWN the stairs?",
        options: [
          "Jump down",
          "Slide on railing",
          "Step carefully one by one",
          "Run as fast as possible",
        ],
        correct: 2,
      },
      {
        prompt: "Should you PUSH others on the staircase?",
        options: [
          "Yes, for fun",
          "No, they may fall",
          "Only on wide stairs",
          "Yes if in a hurry",
        ],
        correct: 1,
      },
      {
        prompt: "Why do stairs have RAILINGS?",
        options: [
          "For decoration",
          "To hold and stay safe",
          "To dry clothes",
          "For climbing practice",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "colours-awareness",
    name: "Colours",
    emoji: "🌈",
    category: "awareness",
    questions: [
      {
        prompt: "What colour is the SKY on a clear day?",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct: 1,
      },
      {
        prompt: "What colour is GRASS?",
        options: ["Blue", "Red", "Green", "Purple"],
        correct: 2,
      },
      {
        prompt: "What colour is FIRE?",
        options: ["Blue", "Green", "Red/Orange", "White"],
        correct: 2,
      },
      {
        prompt: "What colour is a BANANA?",
        options: ["Red", "Blue", "Yellow", "Purple"],
        correct: 2,
      },
      {
        prompt: "What colour is MILK?",
        options: ["Yellow", "White", "Blue", "Green"],
        correct: 1,
      },
      {
        prompt: "What colours are in a RAINBOW?",
        options: [
          "Only red",
          "Only blue and green",
          "All colors",
          "Black and white",
        ],
        correct: 2,
      },
      {
        prompt: "What colour is a RIPE TOMATO?",
        options: ["Green", "Red", "Yellow", "Blue"],
        correct: 1,
      },
      {
        prompt: "What colour is COAL?",
        options: ["White", "Blue", "Black", "Brown"],
        correct: 2,
      },
    ],
  },
  {
    id: "i-eat-vegetables",
    name: "I Eat Vegetables",
    emoji: "🥕",
    category: "awareness",
    questions: [
      {
        prompt: "🥕 What vegetable is this?",
        options: ["Carrot", "Potato", "Pumpkin", "Tomato"],
        correct: 0,
      },
      {
        prompt: "🥦 What vegetable is this?",
        options: ["Cauliflower", "Broccoli", "Cabbage", "Beans"],
        correct: 1,
      },
      {
        prompt: "🍅 What is this?",
        options: ["Apple", "Tomato", "Strawberry", "Cherry"],
        correct: 1,
      },
      {
        prompt: "🌽 What vegetable is this?",
        options: ["Corn/Maize", "Pineapple", "Mango", "Banana"],
        correct: 0,
      },
      {
        prompt: "🥬 What vegetable is this?",
        options: ["Spinach", "Lettuce", "Mint", "Curry leaf"],
        correct: 1,
      },
      {
        prompt: "Which of these is a VEGETABLE?",
        options: ["🍎 Apple", "🥕 Carrot", "🍇 Grapes", "🍌 Banana"],
        correct: 1,
      },
      {
        prompt: "🧅 What is this?",
        options: ["Garlic", "Onion", "Ginger", "Potato"],
        correct: 1,
      },
      {
        prompt: "Vegetables are GOOD for our ___ .",
        options: ["Cars", "Health", "Clothes", "Books"],
        correct: 1,
      },
    ],
  },
  {
    id: "i-eat-fruits",
    name: "I Eat Fruits",
    emoji: "🍎",
    category: "awareness",
    questions: [
      {
        prompt: "🍎 What fruit is this?",
        options: ["Apple", "Orange", "Mango", "Pear"],
        correct: 0,
      },
      {
        prompt: "🍌 What fruit is this?",
        options: ["Cucumber", "Papaya", "Banana", "Corn"],
        correct: 2,
      },
      {
        prompt: "🍇 What fruit is this?",
        options: ["Blueberry", "Grapes", "Plum", "Cherry"],
        correct: 1,
      },
      {
        prompt: "🍊 What fruit is this?",
        options: ["Lemon", "Orange", "Mango", "Peach"],
        correct: 1,
      },
      {
        prompt: "🍓 What fruit is this?",
        options: ["Cherry", "Raspberry", "Strawberry", "Tomato"],
        correct: 2,
      },
      {
        prompt: "🍉 What fruit is this?",
        options: ["Watermelon", "Pumpkin", "Muskmelon", "Gourd"],
        correct: 0,
      },
      {
        prompt: "🥭 What fruit is this?",
        options: ["Papaya", "Pineapple", "Mango", "Peach"],
        correct: 2,
      },
      {
        prompt: "🍋 What fruit is this?",
        options: ["Lime", "Lemon", "Orange", "Pear"],
        correct: 1,
      },
    ],
  },
  {
    id: "i-love-flowers",
    name: "I Love Flowers",
    emoji: "🌸",
    category: "awareness",
    questions: [
      {
        prompt: "🌹 What flower is this?",
        options: ["Lotus", "Lily", "Rose", "Daisy"],
        correct: 2,
      },
      {
        prompt: "🌻 What flower is this?",
        options: ["Daisy", "Sunflower", "Marigold", "Tulip"],
        correct: 1,
      },
      {
        prompt: "🌷 What flower is this?",
        options: ["Rose", "Lily", "Tulip", "Jasmine"],
        correct: 2,
      },
      {
        prompt: "Flowers make a garden ___.",
        options: ["Dark", "Beautiful and colorful", "Dusty", "Noisy"],
        correct: 1,
      },
      {
        prompt: "Bees visit flowers to collect ___.",
        options: ["Water", "Nectar and pollen", "Mud", "Leaves"],
        correct: 1,
      },
      {
        prompt: "🌺 Flowers usually grow from ___.",
        options: ["Stones", "Seeds and plants", "Water only", "Air"],
        correct: 1,
      },
    ],
  },
  {
    id: "wild-animals",
    name: "Wild Animals",
    emoji: "🦁",
    category: "awareness",
    questions: [
      {
        prompt: "🦁 What animal is this?",
        options: ["Tiger", "Lion", "Cheetah", "Leopard"],
        correct: 1,
      },
      {
        prompt: "🐯 What animal is this?",
        options: ["Lion", "Jaguar", "Tiger", "Wolf"],
        correct: 2,
      },
      {
        prompt: "🐘 What animal is this?",
        options: ["Rhino", "Hippo", "Elephant", "Buffalo"],
        correct: 2,
      },
      {
        prompt: "🦒 What animal is this?",
        options: ["Camel", "Giraffe", "Ostrich", "Zebra"],
        correct: 1,
      },
      {
        prompt: "🦓 What animal is this?",
        options: ["Horse", "Donkey", "Zebra", "Pony"],
        correct: 2,
      },
      {
        prompt: "🐊 What animal is this?",
        options: ["Lizard", "Crocodile", "Alligator", "Komodo dragon"],
        correct: 1,
      },
      {
        prompt: "Wild animals live in the ___.",
        options: ["House", "Forest/Jungle", "School", "Garden"],
        correct: 1,
      },
      {
        prompt: "🦍 What animal is this?",
        options: ["Monkey", "Orangutan", "Gorilla", "Chimpanzee"],
        correct: 2,
      },
    ],
  },
  {
    id: "domestic-animals",
    name: "Domestic Animals",
    emoji: "🐄",
    category: "awareness",
    questions: [
      {
        prompt: "🐄 What animal is this?",
        options: ["Buffalo", "Cow", "Goat", "Deer"],
        correct: 1,
      },
      {
        prompt: "🐕 What animal is this?",
        options: ["Fox", "Wolf", "Dog", "Cat"],
        correct: 2,
      },
      {
        prompt: "🐈 What animal is this?",
        options: ["Dog", "Rabbit", "Cat", "Mouse"],
        correct: 2,
      },
      {
        prompt: "🐓 What animal is this?",
        options: ["Duck", "Hen/Rooster", "Parrot", "Peacock"],
        correct: 1,
      },
      {
        prompt: "🐑 What animal is this?",
        options: ["Goat", "Lamb/Sheep", "Dog", "Cat"],
        correct: 1,
      },
      {
        prompt: "Domestic animals live WITH ___.",
        options: ["Wild animals", "Humans/People", "In forests", "In ocean"],
        correct: 1,
      },
      {
        prompt: "🐖 What animal is this?",
        options: ["Hippo", "Boar", "Pig", "Goat"],
        correct: 2,
      },
    ],
  },
  {
    id: "water-animals",
    name: "Water Animals",
    emoji: "🐟",
    category: "awareness",
    questions: [
      {
        prompt: "🐟 What is this?",
        options: ["Crab", "Fish", "Whale", "Dolphin"],
        correct: 1,
      },
      {
        prompt: "🐬 What animal is this?",
        options: ["Shark", "Whale", "Dolphin", "Seal"],
        correct: 2,
      },
      {
        prompt: "🐋 What animal is this?",
        options: ["Dolphin", "Shark", "Whale", "Seal"],
        correct: 2,
      },
      {
        prompt: "🦈 What animal is this?",
        options: ["Dolphin", "Shark", "Barracuda", "Whale"],
        correct: 1,
      },
      {
        prompt: "🐙 What animal is this?",
        options: ["Jellyfish", "Squid", "Octopus", "Starfish"],
        correct: 2,
      },
      {
        prompt: "Water animals BREATHE through ___.",
        options: [
          "Lungs like us",
          "Gills (and some through lungs)",
          "Nose",
          "Ears",
        ],
        correct: 1,
      },
      {
        prompt: "🐠 What is this?",
        options: ["Clown fish", "Goldfish", "Catfish", "Swordfish"],
        correct: 0,
      },
    ],
  },
  {
    id: "food",
    name: "Food",
    emoji: "🍽️",
    category: "awareness",
    questions: [
      {
        prompt: "Which meal do you eat in the MORNING?",
        options: ["Dinner", "Lunch", "Breakfast", "Snack"],
        correct: 2,
      },
      {
        prompt: "Which meal do you eat at NOON?",
        options: ["Breakfast", "Lunch", "Dinner", "Snack"],
        correct: 1,
      },
      {
        prompt: "Which meal do you eat in the EVENING/NIGHT?",
        options: ["Breakfast", "Lunch", "Dinner", "Snack"],
        correct: 2,
      },
      {
        prompt: "Which food gives you ENERGY to run and play?",
        options: [
          "Candy only",
          "Healthy food like rice and dal",
          "Cold drinks",
          "Chips",
        ],
        correct: 1,
      },
      {
        prompt: "Why is it important to EAT VEGETABLES?",
        options: [
          "They taste bad",
          "They give vitamins and make us healthy",
          "They are expensive",
          "They are colorful only",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "hard-soft",
    name: "Hard and Soft",
    emoji: "🪨",
    category: "awareness",
    questions: [
      {
        prompt: "Is a ROCK hard or soft?",
        options: ["Hard", "Soft", "Both", "Neither"],
        correct: 0,
      },
      {
        prompt: "Is a PILLOW hard or soft?",
        options: ["Hard", "Soft", "Both", "Neither"],
        correct: 1,
      },
      {
        prompt: "Is a STONE FLOOR hard or soft?",
        options: ["Hard", "Soft", "Both", "Neither"],
        correct: 0,
      },
      {
        prompt: "Is a COTTON BALL hard or soft?",
        options: ["Hard", "Soft", "Both", "Neither"],
        correct: 1,
      },
      {
        prompt: "Is WOOD hard or soft?",
        options: ["Hard", "Soft", "Both", "Neither"],
        correct: 0,
      },
      {
        prompt: "Is a SPONGE hard or soft?",
        options: ["Hard", "Soft", "Both", "Neither"],
        correct: 1,
      },
    ],
  },
  {
    id: "how-do-we-travel",
    name: "How Do We Travel",
    emoji: "🚀",
    category: "awareness",
    questions: [
      {
        prompt: "Which vehicle travels ON WATER?",
        options: ["Car", "Train", "Boat/Ship", "Plane"],
        correct: 2,
      },
      {
        prompt: "Which vehicle travels in the AIR?",
        options: ["Car", "Boat", "Train", "Airplane"],
        correct: 3,
      },
      {
        prompt: "Which vehicle travels on LAND?",
        options: ["Airplane", "Boat", "Car", "Helicopter"],
        correct: 2,
      },
      {
        prompt: "How do you travel to SCHOOL?",
        options: ["Swim", "Fly", "Walk or bus/car", "Teleport"],
        correct: 2,
      },
      {
        prompt: "A BICYCLE runs on ___.",
        options: ["Petrol", "Electricity", "Pedalling by feet", "Water"],
        correct: 2,
      },
    ],
  },
  {
    id: "land-vehicles",
    name: "On Land Vehicles",
    emoji: "🚗",
    category: "awareness",
    questions: [
      {
        prompt: "🚗 What vehicle is this?",
        options: ["Bus", "Car", "Truck", "Van"],
        correct: 1,
      },
      {
        prompt: "🚌 What vehicle is this?",
        options: ["Car", "Taxi", "Bus", "Van"],
        correct: 2,
      },
      {
        prompt: "🚂 What vehicle is this?",
        options: ["Bus", "Subway", "Train", "Tram"],
        correct: 2,
      },
      {
        prompt: "🚲 What vehicle is this?",
        options: ["Scooter", "Tricycle", "Bicycle", "Motorcycle"],
        correct: 2,
      },
      {
        prompt: "A vehicle that carries MANY people on fixed routes is a ___.",
        options: ["Car", "Bus", "Bicycle", "Truck"],
        correct: 1,
      },
      {
        prompt: "🏍️ What vehicle is this?",
        options: ["Bicycle", "Scooter", "Motorcycle", "Car"],
        correct: 2,
      },
    ],
  },
  {
    id: "water-vehicles",
    name: "On Water Vehicles",
    emoji: "⛵",
    category: "awareness",
    questions: [
      {
        prompt: "⛵ What vehicle is this?",
        options: ["Speedboat", "Sailboat", "Ship", "Submarine"],
        correct: 1,
      },
      {
        prompt: "🚢 What vehicle is this?",
        options: ["Boat", "Ferry", "Ship", "Submarine"],
        correct: 2,
      },
      {
        prompt: "🛶 What vehicle is this?",
        options: ["Ship", "Canoe/Rowboat", "Motorboat", "Yacht"],
        correct: 1,
      },
      {
        prompt: "Which vehicle travels UNDER water?",
        options: ["Boat", "Ship", "Submarine", "Sailboat"],
        correct: 2,
      },
      {
        prompt: "Water vehicles float on ___.",
        options: ["Land", "Air", "Water", "Ice"],
        correct: 2,
      },
    ],
  },
  {
    id: "air-vehicles",
    name: "In the Air Vehicles",
    emoji: "✈️",
    category: "awareness",
    questions: [
      {
        prompt: "✈️ What vehicle is this?",
        options: ["Helicopter", "Rocket", "Airplane", "Hot air balloon"],
        correct: 2,
      },
      {
        prompt: "🚁 What vehicle is this?",
        options: ["Airplane", "Helicopter", "Kite", "Glider"],
        correct: 1,
      },
      {
        prompt: "🪂 What is this?",
        options: ["Umbrella", "Kite", "Parachute", "Hang glider"],
        correct: 2,
      },
      {
        prompt: "Air vehicles fly in the ___.",
        options: ["Ocean", "Sky/Air", "Road", "Underground"],
        correct: 1,
      },
      {
        prompt: "Which is the FASTEST air vehicle?",
        options: ["Hot air balloon", "Kite", "Jet airplane", "Helicopter"],
        correct: 2,
      },
    ],
  },
  {
    id: "safety-on-road",
    name: "Safety on the Road",
    emoji: "🚦",
    category: "awareness",
    questions: [
      {
        prompt: "🔴 What does a RED traffic light mean?",
        options: ["Go", "Stop", "Slow down", "Turn"],
        correct: 1,
      },
      {
        prompt: "🟢 What does a GREEN traffic light mean?",
        options: ["Stop", "Wait", "Go", "Turn around"],
        correct: 2,
      },
      {
        prompt: "🟡 What does a YELLOW traffic light mean?",
        options: ["Go fast", "Stop", "Get ready / Slow down", "Park"],
        correct: 2,
      },
      {
        prompt: "Where should you CROSS the road?",
        options: [
          "Anywhere",
          "Only at zebra crossing",
          "Between cars",
          "While running fast",
        ],
        correct: 1,
      },
      {
        prompt: "Should you look LEFT and RIGHT before crossing the road?",
        options: ["No", "Yes, always", "Only sometimes", "Only at night"],
        correct: 1,
      },
    ],
  },
  {
    id: "water-topic",
    name: "Water",
    emoji: "💧",
    category: "awareness",
    questions: [
      {
        prompt: "Water comes from ___.",
        options: [
          "Ground only",
          "Clouds, rain, rivers, and taps",
          "Only bottles",
          "Factories",
        ],
        correct: 1,
      },
      {
        prompt: "We should ___ water.",
        options: [
          "Waste",
          "Save and use carefully",
          "Always spill",
          "Never drink",
        ],
        correct: 1,
      },
      {
        prompt: "Water is used for ___.",
        options: [
          "Drinking only",
          "Drinking, cooking, cleaning, bathing",
          "Only bathing",
          "Only cleaning",
        ],
        correct: 1,
      },
      {
        prompt: "Which of these is NOT a use of water?",
        options: ["Drinking", "Cooking", "Breathing air", "Watering plants"],
        correct: 2,
      },
      {
        prompt: "Can we live without WATER?",
        options: [
          "Yes, easily",
          "No, we need water to survive",
          "Only for a year",
          "Yes if we eat a lot",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "air-topic",
    name: "Air",
    emoji: "🌬️",
    category: "awareness",
    questions: [
      {
        prompt: "We BREATHE in ___.",
        options: ["Water", "Air", "Smoke", "Dust"],
        correct: 1,
      },
      {
        prompt: "Can we SEE air?",
        options: [
          "Yes, always",
          "No, air is invisible",
          "Only coloured air",
          "Yes in winter",
        ],
        correct: 1,
      },
      {
        prompt: "Wind is ___ air.",
        options: ["Still", "Hot", "Moving", "Wet"],
        correct: 2,
      },
      {
        prompt: "Plants need ___ to make food.",
        options: ["Only water", "Air (carbon dioxide)", "Rocks", "Sand"],
        correct: 1,
      },
      {
        prompt: "We should keep air ___.",
        options: [
          "Dirty with smoke",
          "Clean and fresh",
          "Full of dust",
          "Blocked",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "weather",
    name: "Weather",
    emoji: "⛅",
    category: "awareness",
    questions: [
      {
        prompt: "☀️ What weather is this?",
        options: ["Rainy", "Snowy", "Sunny", "Cloudy"],
        correct: 2,
      },
      {
        prompt: "🌧️ What weather is this?",
        options: ["Sunny", "Rainy", "Snowy", "Windy"],
        correct: 1,
      },
      {
        prompt: "❄️ What weather is this?",
        options: ["Sunny", "Rainy", "Snowy", "Windy"],
        correct: 2,
      },
      {
        prompt: "🌪️ What weather is this?",
        options: ["Rain", "Snow", "Sunny", "Stormy/Windy"],
        correct: 3,
      },
      {
        prompt: "What do you wear on a RAINY day?",
        options: [
          "Sunglasses",
          "Raincoat and umbrella",
          "Sweater only",
          "Swimwear",
        ],
        correct: 1,
      },
      {
        prompt: "What do you wear on a SUNNY hot day?",
        options: [
          "Heavy coat",
          "Light clothes and sun protection",
          "Raincoat",
          "Thick socks",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "day-and-night",
    name: "Day and Night",
    emoji: "🌙",
    category: "awareness",
    questions: [
      {
        prompt: "When does the SUN shine?",
        options: ["Night", "Day", "Always", "Never"],
        correct: 1,
      },
      {
        prompt: "When do we see the MOON and STARS?",
        options: ["Daytime", "Nighttime", "Both", "Neither"],
        correct: 1,
      },
      {
        prompt: "What do you do during the DAY?",
        options: ["Sleep", "Go to school and play", "See stars", "Hide"],
        correct: 1,
      },
      {
        prompt: "What do you do at NIGHT?",
        options: ["Go to school", "Play cricket", "Sleep and rest", "Swim"],
        correct: 2,
      },
      {
        prompt: "☀️ is the symbol for ___.",
        options: ["Night", "Day/Sun", "Rain", "Wind"],
        correct: 1,
      },
    ],
  },
  {
    id: "india-festivals",
    name: "India Festivals",
    emoji: "🎉",
    category: "awareness",
    questions: [
      {
        prompt: "Which festival has COLOURED POWDER?",
        options: ["Diwali", "Eid", "Holi", "Christmas"],
        correct: 2,
      },
      {
        prompt: "Which festival has DIYAS and FIREWORKS?",
        options: ["Holi", "Diwali", "Eid", "Onam"],
        correct: 1,
      },
      {
        prompt: "Which festival celebrates with FEASTING and GIFTS on Dec 25?",
        options: ["Diwali", "Holi", "Christmas", "Onam"],
        correct: 2,
      },
      {
        prompt: "ONAM is a harvest festival of ___.",
        options: ["Punjab", "Tamil Nadu", "Kerala", "Assam"],
        correct: 2,
      },
      {
        prompt: "EID is celebrated by ___ people.",
        options: ["Hindu", "Christian", "Sikh", "Muslim"],
        correct: 3,
      },
      {
        prompt: "PONGAL is a harvest festival of ___.",
        options: ["Kerala", "Tamil Nadu", "Gujarat", "Maharashtra"],
        correct: 1,
      },
    ],
  },
  {
    id: "mindful-living",
    name: "Mindful Living",
    emoji: "🧘",
    category: "awareness",
    questions: [
      {
        prompt: "Taking DEEP BREATHS helps you feel ___.",
        options: ["Angry", "Calm", "Sick", "Confused"],
        correct: 1,
      },
      {
        prompt: "Being KIND to others makes them feel ___.",
        options: ["Sad", "Angry", "Happy", "Scared"],
        correct: 2,
      },
      {
        prompt: "When you are ANGRY, you should ___.",
        options: [
          "Hit someone",
          "Breathe deeply and calm down",
          "Shout loudly",
          "Break things",
        ],
        correct: 1,
      },
      {
        prompt: "GRATITUDE means being ___ for what you have.",
        options: ["Sad", "Angry", "Thankful", "Jealous"],
        correct: 2,
      },
      {
        prompt: "To SLEEP well you should ___.",
        options: [
          "Watch TV till midnight",
          "Have a calm bedtime routine",
          "Eat lots of sugar",
          "Stay up all night",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "my-senses",
    name: "My Five Senses",
    emoji: "👂",
    category: "awareness",
    questions: [
      {
        prompt: "Which body part do we use to SEE?",
        options: ["Eyes", "Ears", "Nose", "Mouth"],
        correct: 0,
      },
      {
        prompt: "Which body part do we use to HEAR?",
        options: ["Eyes", "Ears", "Nose", "Tongue"],
        correct: 1,
      },
      {
        prompt: "Which body part do we use to SMELL?",
        options: ["Eyes", "Ears", "Nose", "Skin"],
        correct: 2,
      },
      {
        prompt: "Which body part do we use to TASTE?",
        options: ["Eyes", "Ears", "Nose", "Tongue"],
        correct: 3,
      },
      {
        prompt: "How many senses do we have?",
        options: ["5", "4", "6", "3"],
        correct: 0,
      },
      {
        prompt: "Which sense helps us feel HOT and COLD?",
        options: ["Sight", "Touch", "Smell", "Hearing"],
        correct: 1,
      },
      {
        prompt: "We use our EYES to ___",
        options: ["Hear", "Smell", "See", "Taste"],
        correct: 2,
      },
      {
        prompt: "Which body part do we use to TOUCH?",
        options: ["Eyes", "Ears", "Nose", "Skin"],
        correct: 3,
      },
    ],
  },
  {
    id: "seasons",
    name: "Seasons",
    emoji: "🌸",
    category: "awareness",
    questions: [
      {
        prompt: "How many seasons are there in a year?",
        options: ["4", "3", "5", "2"],
        correct: 0,
      },
      {
        prompt: "What do we wear in Winter to keep warm?",
        options: ["T-shirt", "Woollen clothes", "Raincoat", "Shorts"],
        correct: 1,
      },
      {
        prompt: "In which season do flowers bloom beautifully?",
        options: ["Winter", "Monsoon", "Spring", "Summer"],
        correct: 2,
      },
      {
        prompt: "Which season is the hottest?",
        options: ["Spring", "Winter", "Autumn", "Summer"],
        correct: 3,
      },
      {
        prompt: "We use an umbrella during which season?",
        options: ["Monsoon", "Winter", "Summer", "Spring"],
        correct: 0,
      },
      {
        prompt: "In which season do leaves fall from trees?",
        options: ["Spring", "Autumn", "Summer", "Winter"],
        correct: 1,
      },
      {
        prompt: "Which season comes after Summer in India?",
        options: ["Winter", "Spring", "Monsoon", "Autumn"],
        correct: 2,
      },
      {
        prompt: "What is the cold season called?",
        options: ["Summer", "Spring", "Monsoon", "Winter"],
        correct: 3,
      },
    ],
  },
  {
    id: "plants-and-trees",
    name: "Plants and Trees",
    emoji: "🌱",
    category: "awareness",
    questions: [
      {
        prompt: "Which part of a plant is under the ground?",
        options: ["Root", "Stem", "Leaf", "Flower"],
        correct: 0,
      },
      {
        prompt: "Which part of the plant holds it upright?",
        options: ["Root", "Stem", "Leaf", "Fruit"],
        correct: 1,
      },
      {
        prompt: "Which part of the plant makes food using sunlight?",
        options: ["Root", "Stem", "Leaf", "Flower"],
        correct: 2,
      },
      {
        prompt: "Which part of the plant is colourful and attracts bees?",
        options: ["Root", "Stem", "Leaf", "Flower"],
        correct: 3,
      },
      {
        prompt: "What do plants need to grow?",
        options: [
          "Water and sunlight",
          "Milk and juice",
          "Sand and stones",
          "Ice and snow",
        ],
        correct: 0,
      },
      {
        prompt: "Which of these is a big plant?",
        options: ["Grass", "Tree", "Flower", "Cactus"],
        correct: 1,
      },
      {
        prompt: "Plants give us fresh ___",
        options: ["Water", "Sand", "Air", "Soil"],
        correct: 2,
      },
      {
        prompt: "Which of these grows from a seed?",
        options: ["Stone", "Water", "Soil", "Plant"],
        correct: 3,
      },
    ],
  },
  {
    id: "birds-and-insects",
    name: "Birds and Insects",
    emoji: "🦋",
    category: "awareness",
    questions: [
      {
        prompt: "Can a crow fly?",
        options: ["Yes", "No", "Sometimes", "Only at night"],
        correct: 0,
      },
      {
        prompt: "How many legs does an insect have?",
        options: ["4", "6", "8", "2"],
        correct: 1,
      },
      {
        prompt: "Which bird is known as the bird of peace?",
        options: ["Crow", "Sparrow", "Dove", "Eagle"],
        correct: 2,
      },
      {
        prompt: "Which insect makes honey?",
        options: ["Ant", "Butterfly", "Mosquito", "Bee"],
        correct: 3,
      },
      {
        prompt: "Which bird is the national bird of India?",
        options: ["Peacock", "Sparrow", "Parrot", "Crow"],
        correct: 0,
      },
      {
        prompt: "Which insect has colourful wings?",
        options: ["Ant", "Butterfly", "Mosquito", "Bee"],
        correct: 1,
      },
      {
        prompt: "Which bird cannot fly?",
        options: ["Eagle", "Parrot", "Penguin", "Sparrow"],
        correct: 2,
      },
      {
        prompt: "Which insect glows in the dark?",
        options: ["Ant", "Bee", "Mosquito", "Firefly"],
        correct: 3,
      },
    ],
  },
  {
    id: "sports-and-games",
    name: "Sports and Games",
    emoji: "⚽",
    category: "awareness",
    questions: [
      {
        prompt: "Which sport uses a bat and a ball?",
        options: ["Cricket", "Football", "Swimming", "Running"],
        correct: 0,
      },
      {
        prompt: "In which sport do we kick a ball?",
        options: ["Cricket", "Football", "Basketball", "Tennis"],
        correct: 1,
      },
      {
        prompt: "In which sport do we move in water?",
        options: ["Running", "Cycling", "Swimming", "Jumping"],
        correct: 2,
      },
      {
        prompt: "Which sport is a running race on a track?",
        options: ["Cricket", "Football", "Swimming", "Athletics"],
        correct: 3,
      },
      {
        prompt: "How many players are in a cricket team?",
        options: ["11", "9", "7", "5"],
        correct: 0,
      },
      {
        prompt: "In basketball, the ball is put into a ___",
        options: ["Bat", "Basket", "Net", "Goal"],
        correct: 1,
      },
      {
        prompt: "Which sport uses a racket?",
        options: ["Cricket", "Football", "Badminton", "Swimming"],
        correct: 2,
      },
      {
        prompt: "What do we wear to protect our head while cycling?",
        options: ["Cap", "Scarf", "Gloves", "Helmet"],
        correct: 3,
      },
    ],
  },
  {
    id: "musical-instruments",
    name: "Musical Instruments",
    emoji: "🎵",
    category: "awareness",
    questions: [
      {
        prompt: "Which instrument has strings that we pluck?",
        options: ["Guitar", "Flute", "Drum", "Trumpet"],
        correct: 0,
      },
      {
        prompt: "Which instrument do we blow into to make music?",
        options: ["Guitar", "Flute", "Drum", "Violin"],
        correct: 1,
      },
      {
        prompt: "Which instrument do we beat with sticks?",
        options: ["Guitar", "Flute", "Drum", "Piano"],
        correct: 2,
      },
      {
        prompt: "Which instrument has black and white keys?",
        options: ["Guitar", "Flute", "Drum", "Piano"],
        correct: 3,
      },
      {
        prompt: "The tabla is a ___ instrument",
        options: ["String", "Wind", "Percussion", "Keyboard"],
        correct: 2,
      },
      {
        prompt: "How many strings does a basic guitar have?",
        options: ["6", "4", "8", "2"],
        correct: 0,
      },
      {
        prompt:
          "Which instrument is used in Indian classical music and has many strings?",
        options: ["Drum", "Sitar", "Flute", "Piano"],
        correct: 1,
      },
      {
        prompt: "Which instrument produces sound when we blow air into it?",
        options: ["Guitar", "Tabla", "Drum", "Trumpet"],
        correct: 3,
      },
    ],
  },
  {
    id: "months-of-year",
    name: "Months of the Year",
    emoji: "📆",
    category: "awareness",
    questions: [
      {
        prompt: "How many months are there in a year?",
        options: ["12", "10", "11", "13"],
        correct: 0,
      },
      {
        prompt: "Which is the first month of the year?",
        options: ["December", "January", "February", "March"],
        correct: 1,
      },
      {
        prompt: "Which month has Christmas?",
        options: ["November", "January", "December", "October"],
        correct: 2,
      },
      {
        prompt: "Which is the last month of the year?",
        options: ["November", "January", "March", "December"],
        correct: 3,
      },
      {
        prompt: "Which is the second month of the year?",
        options: ["February", "March", "April", "May"],
        correct: 0,
      },
      {
        prompt: "Which month comes after January?",
        options: ["March", "February", "April", "May"],
        correct: 1,
      },
      {
        prompt: "In which month does India celebrate Republic Day?",
        options: ["March", "November", "January", "August"],
        correct: 2,
      },
      {
        prompt: "Which month comes before December?",
        options: ["October", "January", "March", "November"],
        correct: 3,
      },
    ],
  },
  {
    id: "body-label-drag",
    name: "Label My Body! D83eDec0",
    emoji: "D83eDec0",
    category: "awareness",
    questions: [],
  },
];

// ─────────────────────────────────────────────────────────────
// All categories
// ─────────────────────────────────────────────────────────────
const LKG_CATEGORIES: LKGCategory[] = [
  {
    id: "phonics",
    name: "Phonics & Literacy",
    emoji: "📚",
    color: "from-blue-500 to-purple-600",
    gradient: "bg-gradient-to-br from-blue-50 to-purple-50",
    topics: phonicsTopics,
  },
  {
    id: "numeracy",
    name: "Numeracy Skills",
    emoji: "🔢",
    color: "from-green-500 to-orange-500",
    gradient: "bg-gradient-to-br from-green-50 to-orange-50",
    topics: numeracyTopics,
  },
  {
    id: "awareness",
    name: "General Awareness",
    emoji: "🌍",
    color: "from-amber-500 to-teal-500",
    gradient: "bg-gradient-to-br from-amber-50 to-teal-50",
    topics: awarenessTopics,
  },
];

// ─────────────────────────────────────────────────────────────
// TopicActivity component
// ─────────────────────────────────────────────────────────────
interface TopicActivityProps {
  topic: LKGTopic;
  onBack: () => void;
  onComplete: (stars: number, score: number, total: number) => void;
}

const OPTION_COLORS = [
  "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-900",
  "bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-900",
  "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-900",
  "bg-green-100 hover:bg-green-200 border-green-300 text-green-900",
];

function TopicActivity({ topic, onBack, onComplete }: TopicActivityProps) {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const questions = topic.questions;
  const q = questions[qIdx];
  const total = questions.length;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correct;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (qIdx + 1 >= total) {
        setDone(true);
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 1200);
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    // Call onComplete to save score and navigate back
    const handleDoneBack = () => onComplete(stars, score, total);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-6">
        <div className="text-6xl">
          {stars === 3 ? "🏆" : stars === 2 ? "🥈" : "🥉"}
        </div>
        <h2 className="text-2xl font-bold text-center">
          {topic.name} Complete!
        </h2>
        <div className="flex gap-1">
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
        <p className="text-lg text-center text-muted-foreground">
          {pct >= 90
            ? "🎉 Amazing! You're a star learner!"
            : pct >= 60
              ? "👍 Good job! Keep practising!"
              : "🌱 Keep trying, you can do it!"}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDoneBack}
            data-ocid="lkg.activity.back.button"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            onClick={() => {
              setQIdx(0);
              setScore(0);
              setSelected(null);
              setDone(false);
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            data-ocid="lkg.activity.play_again.button"
          >
            🔄 Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-ocid="lkg.activity.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h3 className="font-bold text-lg">
            {topic.emoji} {topic.name}
          </h3>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {qIdx + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={(qIdx / total) * 100} className="h-2" />

      {/* Question card */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 text-center min-h-[120px] flex flex-col items-center justify-center gap-3">
        {q.visual && (
          <div className="text-5xl mb-1">
            {q.visual.length <= 4 ? q.visual : ""}
          </div>
        )}
        <p className="text-lg font-semibold leading-snug">{q.prompt}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, idx) => {
          let cls = OPTION_COLORS[idx];
          if (selected !== null) {
            if (idx === q.correct)
              cls = "bg-green-200 border-green-400 text-green-900";
            else if (idx === selected && selected !== q.correct)
              cls = "bg-red-200 border-red-400 text-red-900";
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(idx)}
              type="button"
              className={`rounded-xl border-2 p-4 text-base font-semibold transition-all active:scale-95 ${cls} ${selected !== null ? "cursor-default" : "cursor-pointer"}`}
              data-ocid={`lkg.activity.option.${idx + 1}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <div
          className={`rounded-xl p-3 text-center font-semibold text-sm ${
            selected === q.correct
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {selected === q.correct
            ? q.feedback || "🎉 Correct! Well done!"
            : `❌ The correct answer is: ${q.options[q.correct]}`}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CategoryScreen
// ─────────────────────────────────────────────────────────────
interface CategoryScreenProps {
  category: LKGCategory;
  studentId: string;
  onBack: () => void;
  onSelectTopic: (topic: LKGTopic) => void;
}

function CategoryScreen({
  category,
  studentId,
  onBack,
  onSelectTopic,
}: CategoryScreenProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-ocid="lkg.category.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">
          {category.emoji} {category.name}
        </h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {category.topics.length} topics
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {category.topics.map((topic, i) => {
          const stars = loadLKGScore(studentId, topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              type="button"
              className={`rounded-2xl p-4 text-left border-2 border-transparent hover:border-primary/30 transition-all ${category.gradient} shadow-sm hover:shadow-md active:scale-95`}
              data-ocid={`lkg.topic.item.${i + 1}`}
            >
              <div className="text-3xl mb-2">{topic.emoji}</div>
              <p className="text-sm font-semibold leading-snug line-clamp-2">
                {topic.name}
              </p>
              {stars > 0 && (
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LKGGamesHub (main export)
// ─────────────────────────────────────────────────────────────
interface LKGGamesHubProps {
  studentId: string;
  studentName: string;
  studentClass: string;
}

export default function LKGGamesHub({
  studentId,
  studentName,
  studentClass,
}: LKGGamesHubProps) {
  const [view, setView] = useState<"hub" | "category" | "activity">("hub");
  const [selectedCategory, setSelectedCategory] = useState<LKGCategory | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<LKGTopic | null>(null);

  // Compute overall progress per category
  function getProgress(cat: LKGCategory) {
    const completed = cat.topics.filter(
      (t) => loadLKGScore(studentId, t.id) > 0,
    ).length;
    return { completed, total: cat.topics.length };
  }

  function handleComplete(stars: number, score: number, total: number) {
    if (!selectedTopic) return;
    saveLKGScore(studentId, selectedTopic.id, stars);
    const record: GameScoreRecord = {
      id: `${studentId}-lkg-${selectedTopic.id}-${Date.now()}`,
      studentId,
      studentName: studentName || "",
      class: studentClass,
      gameId: `lkg-${selectedTopic.id}`,
      stars: BigInt(stars),
      score: BigInt(score),
      total: BigInt(total),
      playedAt: new Date().toISOString(),
    };
    saveGameScoreToBackend(record).catch(() => {});
    setView("category");
    setSelectedTopic(null);
  }

  if (
    view === "activity" &&
    selectedTopic &&
    selectedTopic.id === "body-label-drag"
  ) {
    return (
      <BodyLabelGame
        studentName={studentName}
        onBack={() => {
          setView("category");
          setSelectedTopic(null);
        }}
        onComplete={handleComplete}
      />
    );
  }

  if (view === "activity" && selectedTopic) {
    return (
      <TopicActivity
        topic={selectedTopic}
        onBack={() => {
          setView("category");
          setSelectedTopic(null);
        }}
        onComplete={handleComplete}
      />
    );
  }

  if (view === "category" && selectedCategory) {
    return (
      <CategoryScreen
        category={selectedCategory}
        studentId={studentId}
        onBack={() => {
          setView("hub");
          setSelectedCategory(null);
        }}
        onSelectTopic={(topic) => {
          setSelectedTopic(topic);
          setView("activity");
        }}
      />
    );
  }

  // Hub view
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🌟 LKG Learning Hub</h2>
        <p className="text-muted-foreground mt-1">
          Choose a subject to start learning!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LKG_CATEGORIES.map((cat, i) => {
          const { completed, total } = getProgress(cat);
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat);
                setView("category");
              }}
              type="button"
              className={`rounded-3xl p-6 text-left bg-gradient-to-br ${cat.color} text-white shadow-lg hover:shadow-xl transition-all active:scale-95 hover:-translate-y-1`}
              data-ocid={`lkg.hub.category.${i + 1}`}
            >
              <div className="text-5xl mb-3">{cat.emoji}</div>
              <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
              <p className="text-white/80 text-sm mb-3">{total} topics</p>
              <div className="bg-white/20 rounded-full h-2 w-full overflow-hidden">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{
                    width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-white/80 text-xs mt-1">
                {completed}/{total} completed
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
