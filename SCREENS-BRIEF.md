# Brief: openGym redesign, the rest of the screens (one agent per screen)

## What openGym is

openGym is a self-hosted, open-source gym tracker: one React + Capacitor codebase for iOS, Android and web.
- The real code is at `/Users/kobi.carmeli/Development/Personal/openGym/frontend/src`. It is **read-only reference. Never edit it.**
  - Screens are in `views/`, sheets in `sheets.jsx`, logic in `lib/`.
  - The filesystem there can be slow, so read specific files rather than grepping the whole tree.
- All design work lives in this project, `/Users/kobi.carmeli/Library/Application Support/Open Design/namespaces/release-stable/data/projects/d7d6d64c-58c7-4db1-b500-57318f0d2ab6`, as HTML prototypes.

The **Today (home) screen is done**. Learn its look before designing:
- `today-v2-phone.html?dir=full&day=push&photo=full&tabs=combo&week=score&streak=card&weight=weeks` is one iPhone.
- `og/v2.js` and `og/v2.css` are the Today screen.
- `og/app.css` holds the shared tokens.
- `week.html` and `weight.html` are example boards. Copy their board layout, notes style and state switch.

## Locked design system "1b" (don't revisit)

**Look:** Apple HIG structure, dark-first, with bold condensed titles and numbers.

**Tokens:**
- Ground `#000`, surface `#1C1C1E`, raised `#2C2C2E`.
- Secondary text `rgba(235,235,245,.66)`.
- Titles and numbers: Barlow Condensed 800, uppercase.
- Body text: SF Pro (system font).
- Radius: 16 for cards, 14 for buttons, round for chips.
- Spacing on an 8pt grid.

**Routine colors:**
- Push `#A3E635` (lime), Pull `#3DDCFF` (cyan), Legs `#FF8A3D` (orange).
- Color ONLY marks a routine. It never decorates, and it never marks a non-routine highlight. Streaks, goals, charts and other highlights are **white**.
- A running workout shows as **white**.

**Buttons:** only one solid button per action per screen. Everything else is outlined, ghost or text.

**Tab bar (locked):**
- A floating dark capsule: **Home · Plan · GO · Progress · Exercises**.
- Use `OGv2.tabbarHTML(tab, active)` from `og/v2.js`. Include `og/app.css`, `og/v2.css` and `og/v2.js`, and put the bar inside `<div class="app v2 od-screen tabs-combo tabs-capsule">` after the `.od-scroll` content.
- Content under the capsule fades to black, and the scroll area already reserves bottom padding.
- Use `OGv2.ui(name)` for the existing line icons (gear, play, plus, x, check, down, up, flat, flag, clipboard), or add your own in the same style: 1.75 stroke, round joins, class `od-icon`.

**Phone shell:**
- Copy `.od-frames/iphone.html` WHOLE for your phone page, then fill its APP CONTENT slot.
- Read `.od-frames/layout.css` for the layout primitives (`od-screen`, `od-scroll`, `od-stat`, `od-nowrap`, `od-truncate`, `od-clamp-2`, `od-rail`, `od-icon`).
- `og/app.css` has an old `.today` class that adds a margin and a border. Never use the class name `today`; use `is-today`.

## Already decided elsewhere (don't contradict)
- **Streak:** weeks in a row with at least one workout. This week counts once it has one. The app also keeps the longest run. The streak is white, with a flame.
- **The bigger streak celebration belongs on the workout summary screen.** Today only does the small "streak kept" roll from 6 to 7.
- **Body weight:** weekly averages in columns. Goal moments come from data the app provides; the screen never works them out itself.
- **The Today hero** shows today's routine with Start. The week strip opens a day sheet with the body map and exercise list.
- **Sample routines** in og/v2.js `ROUTINES`: Push A, Pull A, Legs, with real exercises. Reuse them so all screens tell one story.
  - The week is Mon 26 Oct – Sun 1 Nov 2026, and today is Wed 28 Oct.
  - Plan: Mon Legs (done), Wed Push (today), Fri Pull, Sat Legs.
  - Body weight is about 80.9 kg with a 78.0 goal. The streak is 7 weeks, and the best is 9.

## How to work with this user
- **Plain, non-technical language** in all copy and notes. Describe what people see.
- **Encouragement, never guilt.** No invented numbers: every number must come from the sample data, consistently.
- **Long user-made names** (routines, exercises) must never break a layout. Show one long-name case in the states.
- **No redundancy.** Don't show the same fact twice on one screen.
- **Alignment.** When laying out, plan how all elements line up together.
- **Unapplied changes** must always be visible, and destructive actions (delete, discard a workout) ask for confirmation first.
- **Don't design features the real app lacks without labelling them** "New for the app" in the notes.
- **Images:** don't generate images; that's broken. Reuse `assets/hero/push.jpg` only where it truly fits, otherwise design without photos.
- **Don't claim** screenshots, previews or testing that didn't happen.

## Deliverable per screen (iPhone only)
1. **`<name>-phone.html`:** one iPhone running the screen, with params `dir=` (direction) and `state=`, plus a `postMessage` listener `{ogState: '<state>'}` like today-v2-phone.html. Real interactions work: tabs inside the screen, sheets open and close (X, Escape, tap outside), forms update the visible state, and confirmations work.
2. **`<name>.html`:** a board like `week.html` / `weight.html`.
   - 2–3 directions side by side, each in an iframe of the phone page.
   - A state switch that posts to all the iframes.
   - Under each direction, plain notes: **What it is · Strength · Risk**.
   - A "Same in all" section and a "What the real app supports / New for the app" section.
3. **Your own JS/CSS only:** `og/<name>.js` and `og/<name>.css`.
   - **Do not edit** `og/v2.js`, `og/v2.css`, `og/app.css`, `today-v2-phone.html`, `week.html`, `weight.html` or any other screen's files. Other agents are working at the same time.
4. Meet accessibility basics: 44px tap targets, visible focus, contrast of 4.5:1 or more, and a reduced-motion fallback.
