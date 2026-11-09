# Handover: openGym redesign · Part 5 (the rest of the screens)

Paste everything below into a new session in this Open Design project.

---

You're continuing a redesign of **openGym**: a self-hosted, open-source gym tracker built as one React + Capacitor codebase for iOS, Android and web.
- The real code is at `/Users/kobi.carmeli/Development/Personal/openGym/frontend/src`. It is **read-only reference. Never edit it.**
- That filesystem is slow, so read specific files (`views/`, `sheets.jsx`, `lib/`) and don't grep the whole tree.
- All design work lives in this Open Design project as HTML prototypes. The work is **iPhone first**; Android and web come later.

## Read these first
1. **`DECISIONS.md`** is the decision log: every locked choice with its date, what was dropped, and the **Still open** list. **Add a line every time the user decides something.**
2. **`SCREENS-BRIEF.md`** has the locked design system, the shared rules, the sample data story and the file rules for screen boards.
3. `HANDOVER-part4-weight.md` is the older Today-screen handover, with background for Parts 1–4.

## Where things stand

| Screen | Board | Status |
|---|---|---|
| Today | `today-v2-phone.html`, `hero.html`, `tabbar.html`, `week.html`, `weight.html` | Done. Parts 1–4 are locked. The streak look and voice are still open. |
| Live workout | `workout.html` | **C chosen**, with the small animation thumbnail. B dropped; A kept for comparison. Details below. |
| Workout summary | `summary.html` | 3 directions (Moment · Scoreboard · Story), reviewed and fixed. **No direction picked yet.** |
| Plan | `plan.html` | 3 directions (Two lists · Week board · Routine cards), reviewed and fixed. **No direction picked yet.** |
| Progress | `progress.html` | 3 directions (Overview · One at a time · Logbook), reviewed and fixed. **No direction picked yet.** |
| Exercises | `exercises.html` | 3 directions (Search first · Body map · Yours first), reviewed and fixed. **No direction picked yet.** |
| Exercise animation | `animation.html` | Shows where the animation appears: workout, exercise sheet, list stills, Plan editor. It doesn't appear on Summary or Progress. |

### Live workout C, as agreed (the most recent work)
**Two views, never mixed:**
- The **list** of all exercises, all collapsed.
- **One open exercise** that fills the whole space between the top bar and the log bar, with no other rows visible.

**How it moves:**
- Entering opens the **first exercise**.
- There's **no Start button**: the clock says "Not started" until the first set is logged.
- The **log bar names the open exercise** ("Log set 2 · Bench press"), with values filled in. A normal set takes 1 tap.
- After the last set of an exercise, the **next unfinished one slides in**. After the final set of the workout, you land on the list with every result and Finish.
- Back to the list: **"All exercises"**, a tap on the title, or Escape.
- **‹ › or a swipe** go straight to the previous or next exercise.
- Rows never move.

**Allowed actions:**
- **Log bar:** Log, steppers, rest timer.
- **Inside the exercise:** fix or un-log a set (with Undo), thumbnail (opens the how-to), title.
- **⋯ menu:** warm-up, remove set, swap, note, history, remove exercise.
- **Top bar:** Finish, Options (including reorder), Discard.
- **Confirmation** is asked only when logged sets would be lost.

**Rest and the tab bar:**
- Rest belongs to the workout and doesn't reset when you switch exercises.
- The tab bar hides during a workout; minimizing brings it back with GO as the timer.

**URLs:** `workout-phone.html?dir=C&state=<entering|mid|resting|switched|collapsed|fixing|alldone>&anim=small`

## Files and how they fit
- **Shared files:**
  - `og/app.css`: tokens. Never name a class `today`; it has an old margin and border.
  - `og/v2.css` and `og/v2.js`: the Today screen. They also export `OGv2.tabbarHTML(tab, active)` and `OGv2.ui(icon)`.
  - `og/anim.js` and `og/anim.css`: the stand-in exercise animation, `OGAnim.figure(name, {tag, still})`.
- **Each screen:** `<name>.html` (the board), `<name>-phone.html` (one iPhone with `dir=` and `state=`, plus a `{ogState}` postMessage) and `og/<name>.js` / `og/<name>.css`.
- **iPhone shell:** `.od-frames/iphone.html`. Copy it whole for any new phone page.
- **Shared sample data**, consistent across screens:
  - Today is Wed 28 Oct 2026, Push A.
  - Bench press: best 72.5 kg (21 Oct, 72.5 × 5,5,4). Today 75 × 5,5,4, a new record.
  - Push A is 20 work sets.
  - Session totals: Push 15, Pull 14, Legs 27.
  - Streak 7 weeks, best 9.
  - Body weight 80.9 kg, goal 78.0.

## Suggested next steps (ask the user which first)
1. **Pick directions** for Plan, Workout summary, Progress and Exercises. Ideally the summary should feel continuous with workout C.
2. **Workout C gaps:**
   - GO shows a frozen 0:00 if the workout is minimized before the first set; it needs a "not started" look.
   - There's no room yet for the plate-loading line ("each side: 25 + 2.5").
   - The close animation assumes one-line rows.
3. **Workout set types not designed yet:** supersets, per-side sets, timed holds, cardio, effort rating.
4. **Still open from earlier:**
   - the streak look (A flame card / B poster / C chain) and voice (Coach / Hype / Stats) on `week.html`;
   - red for delete actions;
   - the missing hero photos (Pull, Legs, rest day).
5. **Later:** link the boards so the tab bar moves between screens. Then port to Android and web.

## How to work with this user
- **Formatting:** short, action-first answers; numbered steps, at most 5 items per list; end with one concrete next action. No preamble or recap.
- **Language:** plain, non-technical. Describe what people see, not code.
- **Answer questions first.** When the user asks a question or "wdyt", answer it and don't build. Build only on "build it" or "do it".
- **Corrections:** when the user says "you didn't get it", restate their intent in one line, then fix exactly that.
- **No redundancy:** don't show the same fact twice on a screen, and avoid redundant taps.
- **Long user-made names** must never break a layout.
- **Alignment:** when one element looks off, plan how all the elements line up.
- **Encouraging, never guilt;** no invented numbers. Color only marks a routine. One solid button per screen.
- **Agents:** the user likes parallel work, one agent per screen, followed by a separate UX/UI reviewer and fixes. Agents edit only their own screen's files.
- **Image generation** through Open Design Cloud fails ("not logged in"). Don't switch providers; hand over prompts instead.
- **Don't claim** screenshots, previews or testing that didn't happen.
- **Log every decision** in `DECISIONS.md`.

**First step in the new session:** read `DECISIONS.md`, then ask the user which of the next steps above to take.
