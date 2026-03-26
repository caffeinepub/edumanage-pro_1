# EduR – LKG Learning Games Hub

## Current State
The `LearningGames.tsx` (4243 lines) contains 13 games for LKG–Class 4. The `GamesHub` component renders available/locked games filtered by student class level using a flat `GAMES` array. LKG students currently only see Alphabet Match, Number Counting, and Color Match.

## Requested Changes (Diff)

### Add
- A new **LKG Learning Hub** component in a separate file `LKGGames.tsx` that renders when `level === 'LKG'`
- Three top-level categories for LKG:
  1. **Phonics & Literacy Skills** – Strokes, Fun with Letters, Vowels & Consonants, Read Aloud
  2. **Numeracy Skills** – Pre-number concepts (many subtopics), Number practice, Fun with shapes, Fun with colours, Backward counting, Before/Between/After, Number names, Ordinals, One more/One less
  3. **General Awareness** – 40+ topics: This is me, My body, My family, My house, My school, Animals, Food, Transport, Safety, Weather, Festivals, etc.
- Each topic is an interactive mini-game/activity with visuals, taps, and feedback
- Stars per topic saved using existing `saveGameScoreToBackend`
- Navigation: LKG Hub → Category → Topic activity → Back

### Modify
- `GamesHub` in `LearningGames.tsx`: when `level === 'LKG'`, render `<LKGGamesHub>` instead of (or alongside) the existing games grid
- LKG students see the new hub as their primary experience, with the existing games still accessible

### Remove
Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/pages/student/LKGGames.tsx` with:
   - `LKGGamesHub` as default export
   - Category cards grid (3 categories with emoji, color, count)
   - On category click → topic list grid
   - On topic click → inline activity panel (MCQ, tap-to-match, trace hint, image tap, etc.)
   - Lightweight interactive activities for each of the 50+ topics using SVG/emoji visuals
   - Each activity: question/prompt → tap answer → feedback → score → back
   - Stars computed from score, saved via `saveGameScoreToBackend`
2. Import and use `LKGGamesHub` in `LearningGames.tsx` inside `GamesHub` when `level === 'LKG'`, rendered as a new tab or section above existing games
