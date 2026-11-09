# Handover: openGym redesign · Today screen · Part 4 (body weight)

Paste everything below into a new session in this Open Design project.

---

You're continuing a redesign of the **openGym** app: a self-hosted, open-source gym tracker built as one React + Capacitor codebase for iOS, Android and web. The real code is at `/Users/kobi.carmeli/Development/Personal/openGym/frontend` (read-only reference, **never edit it**). All design work lives in this Open Design project as HTML prototypes.

We're redesigning the **Today (home) screen one part at a time**, iPhone first, then porting the result to Android and web.

| Part | Topic | Status |
|---|---|---|
| 1 | Hero | Done: full-bleed photo (layout A) |
| 2 | Tab bar | Done: capsule with GO |
| 3 | Week + streak | Done: marked week strip + day sheet. **Streak look and voice still open** (see below) |
| 4 | Body weight | Chosen: C, week by week (`weight.html`, `weight=weeks`) |

## Locked decisions (don't revisit)

**Design system "1b":** Apple HIG structure, dark-first, with bold condensed titles and numbers.

| Token | Value |
|---|---|
| Ground | `#000` |
| Surface | `#1C1C1E` |
| Raised | `#2C2C2E` |
| Secondary text | `rgba(235,235,245,.66)` |
| Accent (brand lime) | `#A3E635` |
| Titles and numbers | Barlow Condensed 800, uppercase |
| Body text | SF Pro (iOS), Roboto (Android), system font (web) |
| Radius | 16 cards, 14 buttons, round chips |
| Spacing | 8pt grid |

**Routine colors:**
- Push `#A3E635` (lime), Pull `#3DDCFF` (cyan), Legs `#FF8A3D` (orange).
- Color only ever marks a routine, never decorates. Streak and other non-routine highlights are **white**.
- A running workout shows as **white**, so it never clashes with Legs orange.

**Only one solid button per action per screen.** The hero's lime "Start workout" is the only solid one.

**Part 1, hero (locked, layout A):**
- A full-bleed photo with the workout name in 64px condensed caps, then the muscles, a meta line, and Start, all on a dark fade.
- **The hero always shows today.** Tapping a day in the week never changes it.
- Only `assets/hero/push.jpg` exists. Pull, Legs and rest-day photos are missing (the user generates them). When they arrive, add them to `PHOTOS` in `og/v2.js`.

**Part 2, tab bar (locked):**
- A floating dark capsule, 64px tall, 12px from the sides, 26px from the bottom.
- Tabs: **Home · Plan · GO · Progress · Exercises**. GO is an outlined disc in today's routine color; while running it's a white live timer with a filling ring.
- Content under the capsule fades to black.

**Part 3, week (locked):**
- **Marked week strip:** Mon–Sun on black, no card, no routine names under the dates (long user-made names would break it).
  - Planned day: the date in a ring of the routine color.
  - Done: a solid disc in the routine color, plus a white check badge.
  - Live workout: a white ring filling around today.
  - Rest: just the grey date.
  - Today is labelled "TODAY" with a thin white outline.
- Title row: "THIS WEEK" plus "1 of 4 done". No "Next" line, because the hero already says it.
- **Tapping a day opens a sheet**, and the hero stays put. The sheet shows:
  - the date, the routine name and the status;
  - the body map and the exercise list;
  - at most one outlined button: "Start workout" today, "Resume workout" while live, or "Do this today instead" on another planned day.
  - Close with the X, Escape or a tap outside.
- **Streak** is openGym's real rule:
  - It counts weeks in a row with at least one workout.
  - This week counts once it has one, and an empty week doesn't break it until it ends.
  - The app also keeps the longest run.
  - The streak sits above the week and is white, not lime.
- **Streak kept:** a one-time moment the first time Today opens after the week's first workout.
  - The number rolls from 6 to 7 and the flame lights.
  - The bigger celebration belongs on the workout summary screen, which is a later part.
- **Open question for the user:** which streak look (A flame card, B poster, C chain) and which copy voice (Coach, Hype, Stats). All three are on `week.html` with 8 situations and a copy table. Ask before polishing the streak further.

## Part 4 brief: body weight

This is what sits under the week today. The current version is `weightBig()` in `og/v2.js`:
- a card titled "Body weight" with a "+ Log" pill;
- a big "80.9 kg" with "↓ 1.5 kg in 30 days";
- "2.9 kg to your 78.0 kg goal";
- a lime trend line;
- tapping Log opens a weigh-in sheet with a ± stepper and Save.

The user called gray cards "uninspiring" in Part 3. This section needs the same energy as the hero, week and streak. It must work with the floating capsule over it, and it's the last section on the page.

**Deliver `weight.html`, iPhone only, judging only this section:**
1. **2–3 directions**, each shown in place on Today under the week, with the capsule. Reuse `today-v2-phone.html` with params `dir=full&day=push&photo=full&tabs=combo&week=score&streak=card`, and add a `weight=` mode the same way `week=` was added.
2. **States:** has a trend; no weigh-ins yet; only one weigh-in; logged today; trending away from goal; no goal set; goal reached.
3. **Data rules:**
   - Use real-looking data (`W` and `GOAL` in `og/v2.js`).
   - Be honest about direction: gaining toward a bulk goal is good, so don't assume down is good.
   - The trend line isn't lime. Lime is Push, so use white or a neutral.
4. **Plain-language notes under each direction:** what it is, its strength, its risk.

Before building, check the real app (read-only) for what it supports:
- a weight goal, and whether the goal can be gain or lose;
- units (kg/lb);
- weigh-in history;
- whether "logged today" is tracked.

Search `src` for weight and goal. Don't design features the app lacks without saying so.

## Files

| File | What it is |
|---|---|
| `week.html` | Part 3 board: three streak looks, a Streak situation switch (8 cases incl. "Streak kept"), a Week state switch, and the full copy table |
| `tabbar.html` | Part 2 board |
| `hero.html` | Part 1 board |
| `today-v2-phone.html` | One iPhone. Params: `dir`, `day=push\|legs`, `photo=full\|framed`, `tabs=combo…`, `week=score\|tiles\|sets\|rail\|rings\|big`, `streak=card\|poster\|chain` |
| `og/v2.js`, `og/v2.css` | The Today v2 screen. Key pieces are listed below. |
| `og/app.css` | The shared 1b system and layout primitives. **Careful:** an old `.today` class there adds a top margin and a border. Don't put a class named `today` on new elements; use `is-today`. |
| `.od-frames/iphone.html` | iPhone shell. Copy it whole for any new handset page. |

Key pieces of the Today v2 screen in `og/v2.js`:
- **Hero:** `poster()`.
- **Week:** `weekScore()` is the chosen marked strip. `weekTiles()` and `weekSets()` were dropped but are kept in the code. `openDay()` is the day sheet.
- **Streak:** `streakBlock()`, `STREAK_CASES` and `STREAK_COPY`.
- **Weight:** `weightBig()`.
- **Tab bar:** `tabbar2()`.
- **Live progress:** `tick()` updates the timers and fills while a workout runs.

Board messages it accepts: `{ogState}`, `{ogSel: dayIndex}` (opens that day's sheet), `{ogStreak: case}`, `{ogTab}`.

## How to work with this user
- **Formatting:** answers short and action-first, numbered steps, at most 5 items per list, one concrete next action at the end. No preamble or recap.
- **Language:** plain, non-technical. Describe what the user will see, not CSS.
- **One part at a time.** Don't redesign the hero, tab bar or week unasked.
- **Feedback:** the user gives fast visual feedback ("body too tall", "doesn't look like days", "next is redundant"). Apply small fixes directly, then say what changed and why.
- **Redundancy:** the user cuts anything that repeats the hero or another section. Don't show the same fact twice.
- **Long text:** user-made names (routines, exercises) can be long. Never rely on short names fitting a narrow column.
- **Alignment:** when one element looks off, check how it lines up with its neighbours.
- **When they ask a question, answer it.** Don't build unless they ask.
- **Engagement:** the user wants encouragement, never guilt, and no invented numbers.
- **Image generation** through Open Design Cloud failed ("not logged in"). Don't switch to another billing provider on your own; hand over prompts instead.
- **Don't claim** screenshots, previews or testing that didn't happen.

**First step:** check the real app's weight features, then build Part 4 (`weight.html`).
