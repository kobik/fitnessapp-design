# openGym redesign: decision log

This file lists what's been decided, dropped and left open, newest work last. There's one line per decision; the boards hold the detail. Add to it whenever something is decided.

## Everywhere (locked)

| Date | Decision |
|---|---|
| Oct 2026 | **Design system "1b":** dark-first Apple style, black ground, bold condensed titles and numbers (Barlow Condensed), system font for body text, 8pt spacing. |
| Oct 2026 | **Color only marks a routine:** Push is lime, Pull is cyan, Legs is orange. Streaks, goals, charts and other highlights are **white**. A running workout is **white**. |
| Oct 2026 | **One solid button per screen.** Everything else is outlined or text. |
| Oct 2026 | **Encouraging, never guilt.** No invented numbers; every number comes from the sample data. |
| Oct 2026 | **Long user-made names never break a layout.** No fact shown twice on one screen. Unsaved changes are always visible. Deleting asks first. |
| Oct 2026 | **iPhone first.** Android and web come after. |

## Today screen (`today-v2-phone.html`)

| Date | Decision |
|---|---|
| Oct 2026 | **Part 1, hero:** full-bleed photo (layout A). It always shows today, and tapping a day never changes it. (`hero.html`) |
| Oct 2026 | **Part 2, tab bar:** a floating capsule with Home · Plan · GO · Progress · Exercises. GO is a ring in today's routine color, and a white live timer while a workout runs. (`tabbar.html`) |
| Oct 2026 | **Part 3, week:** a marked Mon–Sun strip. Tapping a day opens a sheet. The streak counts weeks in a row with a workout, shown in white. (`week.html`) |
| 2026-10-29 | **Part 4, body weight:** direction **C, week by week**. Weekly-average columns, this week in white, goal as a dashed line. A and B dropped. (`weight.html`) |
| 2026-10-29 | **Body weight:** keep the Log button even though the app asks for a weigh-in before each workout. "Set a goal" stays a placeholder. "Away from goal" never uses red. |
| 2026-10-29 | **Goal moments** (goal reached, N weeks holding, just outside range) come only from data the app sends. The screen never works them out. |
| 2026-10-30 | **Streak copy fix:** at 7 weeks with a best of 9, it now says "3 more weeks to beat your best". It used to say 2, which only ties it. |

## Other screens (built and reviewed 2026-10-30)

| Date | Decision |
|---|---|
| 2026-10-30 | **Five boards built, each reviewed by a separate reviewer and fixed:** `plan.html`, `workout.html`, `summary.html`, `progress.html`, `exercises.html`. |
| 2026-10-30 | **One data story across all screens:** Bench press best before today 72.5 kg (21 Oct, 72.5 × 5,5,4). Today, Wed 28 Oct, Push A: 75 kg × 5,5,4, a new record. Push A is 20 work sets. Session totals: Push 15, Pull 14, Legs 27. |
| 2026-10-30 | **The big streak celebration** lives on the workout summary. Today only does the small 6 → 7 roll. |

## Live workout (`workout.html`)

| Date | Decision |
|---|---|
| 2026-10-30 | **B (sets table) dropped.** |
| 2026-10-30 | **C chosen** (whole session list), with the **small animation thumbnail**. A stays on the board for comparison. |
| 2026-10-30 | **C flow:** |
| | - At most one exercise open, and the open one is the one you log. |
| | - The first exercise is open on entry. |
| | - No Start button: the clock starts at the first logged set. |
| | - The log bar names the exercise; a normal set takes 1 tap. |
| | - A finished exercise closes into a one-line result, and the next one opens on its own. |
| | - Rows never move. |
| 2026-10-30 | **C is two views, never mixed:** |
| | - The list of all exercises, or one open exercise that fills the whole space between the top bar and the log bar. No other rows show while one is open. |
| | - Back to the list: "All exercises", a tap on the title, or Escape. |
| | - ‹ › and swipe go straight to the previous or next exercise. |
| 2026-10-30 | **C allowed actions:** |
| | - Log bar: Log, steppers, rest timer. |
| | - Inside the open exercise: fix or un-log a set, the thumbnail, collapse. |
| | - ⋯ menu: warm-up, remove set, swap, note, history, remove exercise. |
| | - Leaving: switch exercise, collapse all, minimize the workout. |
| | - Top bar: Finish, Options, Discard. |
| | - Only actions that lose logged sets ask first. Reordering only from Options. |
| 2026-10-30 | **The tab bar hides during a workout.** Minimizing brings it back, with GO as the live timer. |

## Exercise animation (`animation.html`)

| Date | Decision |
|---|---|
| 2026-10-30 | **Where it shows:** the workout (following the app's Full / Small / Hidden setting), the exercise sheet (large, at the top), list rows (a still) and the Plan editor (a still). It doesn't show on Summary or Progress. |
| 2026-10-30 | **Mocks use a stand-in line figure** tagged "Animation". The app's real clips replace it. |
| 2026-10-30 | **Workout summary: D · Mix is the candidate.** A's header plus B's compact exercise list, made more uplifting with real numbers only: "5 of 6 lifts up" on a plain day, volume vs last time, the streak shown as progress toward the best, and the next step-up above Done. Not locked yet. |
| 2026-10-30 | **Workout summary: D · Mix is locked.** A, B and C stay on the board for comparison only. |
| 2026-10-30 | **Plan: keep both A (Two lists) and C (Routine cards)**, switchable in Settings. B (Week board) dropped. Still open: one shared editor and save rule for both, and the default layout. |
| 2026-10-30 | **Plan A + C share C's editor** (every number one tap away, save bar while anything is unsaved). Only the main Plan page follows the setting. **Default: A.** Settings row: "Plan layout: Lists · Cards" (renamed from "Week · Routines" after review, because A has its own Routines tab). The editor's ⋯ Routine options keep progression, deload, Copy and Print. |
| 2026-10-30 | **Plan editor: the number grid is out** (too cramped, doesn't look like the workout, hard to see the whole routine). The new editor follows workout C: a list of exercises, then one exercise opened full, with its sets. |
| 2026-10-30 | **Plan doesn't mark today** (no Today tag in A, no today mark on C's day buttons). Plan is the weekly pattern; the Today screen covers today. |

## Still open

- **Streak look and voice.** Look: A flame card, B poster or C chain. Voice: Coach, Hype or Stats. (`week.html`)
- **Directions to pick** for Progress and Exercises.
- **Red for delete actions.** It's currently used only for destructive actions, an exception to "color only marks a routine".
- **Workout set types not designed yet:** supersets, per-side sets, timed holds, cardio, effort rating.
- **Missing photos** for the Pull, Legs and rest-day heroes. Image generation isn't working.
- **GO before the first set:** if you minimize a workout before logging anything, GO shows a frozen 0:00. It needs a "not started" look.
- **Plate-loading line** ("each side: 25 + 2.5") has no room in workout C yet.
- **Later:** Settings, login and onboarding, Coach, measurements, progress photos.
