# EduR

## Current State
The LoginPage.tsx has three tabs (Principal, Teacher, Student). The Student tab shows a plain login form. After login, StudentWelcomeScreen shows an animated welcome overlay. The login page itself has no student-specific animations.

## Requested Changes (Diff)

### Add
- Floating emoji particles (🌟 📚 ✏️ 🎒 🏫 🖍️) animating in the student tab background
- Animated greeting header above the student form with bounce/wave animation
- Voice greeting via speechSynthesis when Student tab is clicked
- Animated pulse on the Sign In button in the student tab
- Colorful animated gradient border on the student login card

### Modify
- LoginPage.tsx: track active tab, add student-specific animated UI and voice trigger

### Remove
- Nothing

## Implementation Plan
1. Convert Tabs to controlled state in LoginPage to detect Student tab activation
2. On Student tab click, trigger speechSynthesis greeting
3. Add floating emoji particles inside student TabsContent
4. Add bouncing animated greeting above student form
5. Style student card with animated gradient border using CSS keyframes
6. Add pulse animation to Sign In button in student tab
7. Inject all keyframes via style tag
