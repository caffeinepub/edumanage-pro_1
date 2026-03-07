# EduManage Pro

## Current State
Full-featured school management system with Principal, Teacher, and Student portals. The Student dashboard has sections for Overview, My Results, My Progress, Timetable, Online Exams, Fee Status, Notifications, Attendance, Leave Application, Suggestions & Queries, My Profile, and an AI Assistant.

## Requested Changes (Diff)

### Add
- A new "Learning Games" section in the Student dashboard sidebar
- 6 educational mini-games tailored to LKG–4th standard students, each auto-selected by the student's class level:
  1. **Alphabet Match** (LKG/UKG) — tap matching uppercase/lowercase letter pairs from a grid
  2. **Word Builder** (UKG/1st) — drag or tap letters to spell a picture-word shown on screen
  3. **Spell the Word** (1st/2nd) — listen to a word (text shown), choose the correct spelling from 4 options
  4. **Number Counting** (LKG/UKG) — count the shown objects and tap the correct number
  5. **Maths Challenge** (1st–4th) — timed addition/subtraction/multiplication quiz, difficulty scales by class (1st=add, 2nd=sub, 3rd=mul, 4th=mix)
  6. **Sentence Scramble** (3rd/4th) — arrange shuffled words into a correct English sentence

- Each game has:
  - A start screen with instructions and a "Play" button
  - Score tracking (correct answers, stars 0–3)
  - A congratulations / try-again screen at the end
  - Bright, child-friendly colors and large touch targets
  - A "Back to Games" button

- The Games hub shows a grid of game cards filtered to the student's class level, with subject label (English / Maths), suitable class range, and a star rating showing best score

### Modify
- StudentDashboard: add "games" to navItems and renderSection switch
- No backend changes needed (scores stored locally per session)

### Remove
- Nothing removed

## Implementation Plan
1. Create `/src/frontend/src/pages/student/LearningGames.tsx` with:
   - `GamesHub` component — grid of unlocked game cards based on student class
   - `AlphabetMatch` game component (LKG/UKG)
   - `NumberCounting` game component (LKG/UKG)
   - `WordBuilder` game component (UKG/1st)
   - `SpellTheWord` game component (1st/2nd)
   - `MathsChallenge` game component (1st–4th, difficulty by class)
   - `SentenceScramble` game component (3rd/4th)
2. Add `games` section to StudentDashboard navItems (Gamepad icon) and renderSection
3. Each game uses React state only (no canvas needed for these quiz/card games)
4. Scores tracked in component state; best score shown in hub via localStorage
