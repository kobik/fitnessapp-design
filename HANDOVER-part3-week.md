# Handover: openGym redesign · Today screen · Part 3 (week)

Paste everything below into a new session in this Open Design project.

---

You're continuing a redesign of the **openGym** app: a self-hosted, open-source gym tracker built as one React + Capacitor codebase for iOS, Android and web. The real code is at `/Users/kobi.carmeli/Development/Personal/openGym/frontend` (read-only reference, **never edit it**). All design work lives in this Open Design project as HTML prototypes.

We're redesigning the **Today (home) screen one part at a time**, iPhone first, then porting the result to Android and web.

| Part | Topic | Status |
|---|---|---|
| 1 | Hero | Done: full-bleed photo (layout A) |
| 2 | Tab bar | Done: capsule with GO |
| **3** | **Week** | **Your job** |
| 4 | Body weight | Later |

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
- Color only ever marks a routine, never decorates.
- A running workout shows as **white**, so it never clashes with Legs orange.

**Only one solid button per action per screen.** The hero's lime "Start workout" is the only solid one.

**Part 1, hero (locked, layout A):**
- A full-bleed photo fills the top of the screen.
- The workout name is 64px condensed caps.
- Below the name: the muscles in the routine color, a meta line, and Start, all on a dark fade.
- The photo drifts slowly (a 22-second push-in, off with reduced motion). It greys out when today's workout is done.
- Only `assets/hero/push.jpg` exists (896×1200). Pull, Legs and rest-day photos are missing, so those days fall back to the body-map poster.
- The user generates the photos themselves; prompts and specs (2:3, 1200×1800, subject in the top two-thirds) were already given. When they arrive, add them to `PHOTOS` in `og/v2.js`.

**Part 2, tab bar (locked):**
- **Shape:** a floating dark capsule, 64px tall, 12px from the sides and 26px from the bottom.
- **Tabs:** **Home · Plan · GO · Progress · Exercises**.
- **Icons:** one family with 2px strokes. The selected tab turns white on a soft pill, and its icon fills.
- **Progress icon:** a line graph on axes, rising to a dot.
- **Center GO:**
  - An outlined disc in today's routine color, sitting level with the other tabs, with no label. GO is optically centered.
  - **Running:** GO becomes a white live timer with a white ring that fills.
  - **During the workout itself:** the bar is hidden.
- **Edge dimming:** content scrolling under the status bar fades to black. Under the capsule it's solid black from the screen edge up to the capsule's middle, then fades over about 70px.

## Part 3 brief: the week section

This is what sits under the hero today. The current version is in `og/v2.js` (`weekBars()`, used when `dir=full`):
- A card titled "This week · 2 of 4".
- A "7 week streak" number with tick marks.
- 7 day bars, Mon–Sun. Each one is colored and filled when done, outlined in the routine color when planned, and short and grey on rest days. The bar fills partly while a workout runs.
- A routine color legend.
- Tapping a day swaps the hero to that day's workout, with a "Back to today" link.

The user called the earlier gray-card look "uninspiring". This section needs the same energy as the hero and tab bar, and it must keep working with the floating capsule over it.

**Deliver `week.html`, iPhone only, judging only this section:**
1. **2–3 week directions**, each shown in place on Today, under the photo hero with the capsule tab bar. Reuse `today-v2-phone.html` (params `dir=full&day=push|legs&photo=full&tabs=combo`) and add a mode for the week variant.
2. **States to cover:** workout day, in progress (partial bar), done today, rest day, first run (no plan yet), and a different day selected.
3. **Data rules:**
   - Streak and counts come from real-looking data.
   - "Done" never relies on color alone; use fill plus shape or a check.
4. **Plain-language notes under each direction:** what it is, its strength, its risk.

**Ideas worth exploring, not mandatory:**
- A horizontal scrollable week of day cards, each with its routine name.
- A ring per day.
- The streak as its own bold stat beside a compact strip.
- Dropping the card and letting the week sit directly on black.

## Files

| File | What it is |
|---|---|
| `tabbar.html` | Part 2 board: the locked tab bar, with a state switch (idle / running / Plan selected) and Push/Legs |
| `hero.html` | Part 1 board: full-bleed vs framed photo hero (A was chosen) |
| `today-v2-phone.html` | One iPhone. Params: `dir=full\|poster`, `day=push\|legs`, `photo=full\|framed`, `tabs=combo\|capsule\|disc\|text` |
| `og/v2.js`, `og/v2.css` | The current Today v2 screen. Key pieces: `poster()` (hero), `weekBars()` / `weekDots()` (week), `weightBig()` (weight), `tabbar2()` / `startBtn()` (tab bar), `IC` (icons), `stateFor()` (sample data and states). |
| `og/app.css`, `og/app.js` | The shared 1b system, plus the older round 1d screen used by `platforms.html` |
| `platforms.html`, `today-ios.html`, `today-android.html`, `today-web.html` | Round 1d: the system on all three platforms (older Today layout; to be updated after Part 4) |
| `today-v2.html`, `index.html` | Earlier exploration boards, kept for reference |
| `.od-frames/iphone.html` | iPhone shell. Copy it whole for any new handset page. |

## How to work with this user
- **Formatting:** answers short and action-first, numbered steps, at most 5 items per list, one concrete next action at the end. No preamble or recap.
- **Language:** plain, non-technical. Describe what the user will see, not CSS.
- **One part at a time.** Don't redesign the hero or tab bar unasked.
- **Feedback:** the user gives fast visual feedback (e.g. "title smaller", "GO isn't centered", "dim behind the navbar"). Apply small fixes directly, then say what changed and why.
- **Alignment:** when one element looks off, check how it lines up with its neighbours, not just the element alone.
- **When they ask a question, answer it.** Don't build unless they ask.
- **Image generation** through Open Design Cloud failed ("not logged in"), and stock search was unavailable. Don't switch to another billing provider on your own; hand over prompts instead.
- **Don't claim** screenshots, previews or testing that didn't happen.

**First step:** build Part 3 (`week.html`).
