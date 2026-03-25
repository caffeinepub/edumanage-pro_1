# EduR

## Current State
The Learning Games section (`src/frontend/src/pages/student/LearningGames.tsx`, ~3914 lines) has 13 games with star tracking and leaderboard. There is no audio/music in the games section.

## Requested Changes (Diff)

### Add
- Background music system using Web Audio API (no external files needed) that plays a cheerful looping melody when the games section is open
- A music toggle button (on/off) in the games section header so students can control the music
- Sound effects for game events: correct answer chime, wrong answer buzz, game win fanfare, game over sound
- Remember the music preference in localStorage (so if a student turns it off, it stays off)

### Modify
- `LearningGames.tsx`: add a `useGameAudio` hook at the top of the file that manages background music and sound effects using the Web Audio API. Wire the toggle button into the games header. Call sound effect functions at correct/wrong/win moments in each game.

### Remove
- Nothing removed

## Implementation Plan
1. Create a `useGameAudio` hook (inline in LearningGames.tsx or as a small helper) using Web Audio API that:
   - Generates a cheerful looping background melody (simple pentatonic notes, ~8-bar loop)
   - Provides functions: `playCorrect()`, `playWrong()`, `playWin()`, `playGameOver()`
   - Exposes `musicOn`, `toggleMusic()` state
   - Persists music preference in localStorage
   - Starts/stops background music when the component mounts/unmounts
2. Add a music toggle button (🎵/🔇 icon) in the games hub header area
3. Wire `playCorrect()` and `playWrong()` into answer handling in each game
4. Wire `playWin()` / `playGameOver()` into game end screens
