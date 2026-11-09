# Handover: openGym redesign · Today screen · Part 2 (tab bar)

Paste everything below into a new session in this Open Design project.

---

You're continuing a redesign of the **openGym** app: a self-hosted, open-source gym tracker built as one React + Capacitor codebase for iOS, Android and web. The real code is at `/Users/kobi.carmeli/Development/Personal/openGym/frontend` (read-only reference, **never edit it**). All design work lives in this Open Design project as HTML prototypes.

We're redesigning the **Today (home) screen one part at a time**, iPhone first, then porting the winner to Android and web.

| Part | Topic | Status |
|---|---|---|
| 1 | Hero | Built, layout not chosen yet |
| **2** | **Tab bar** | **Your job** |
| 3 | Week | Later |
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
| Running / in progress | `#FF9F0A` |
| Titles and numbers | Barlow Condensed 800, uppercase |
| Body text | SF Pro (iOS), Roboto (Android), system font (web) |
| Radius | 16 cards, 14 buttons, round chips |
| Spacing | 8pt grid |

**Routine colors:** Push `#A3E635` (lime), Pull `#3DDCFF` (cyan), Legs `#FF8A3D` (orange). Color only ever marks a routine, never decorates. In the colored direction, the running-workout timer is **white** so it never clashes with Legs orange.

**Today layout, top to bottom:**
1. Hero (photo or body map, workout name, muscles, Start)
2. Week card (7 bars plus the streak)
3. Body weight (big number over a trend line)
4. Tab bar

**Tabs:** match the real app (`frontend/src/components/TabBar.jsx`): **Today · Plan · ▶ Start · Progress · Exercises**.
- The center button starts today's workout from any tab.
- While a session runs, the center button becomes a **live timer** ("12:40") and works as Resume.
- On the workout screen itself, the tab bar is hidden; the workout is full screen.
- Tabs are peers. Switching tabs replaces the screen; Android Back doesn't step back through tabs.
- Settings lives behind the gear on Today.
- Web uses a sidebar from 1024px wide, with Start at the top plus History, Body and Settings.

**Only one solid button per action per screen.** The hero's Start is the solid lime one, so the center tab must not also be a solid lime button while idle.

## Part 2 brief: tab bar

**What the user said:**
- "I don't like the navbar icons."
- "The Start icon in the navbar doesn't fit."

Two icon sets were tried in `today-v2.html`; **neither was approved**:
- **Set A:** bold outline icons that fill when selected.
- **Set B:** solid geometric icons with an underline under the current tab.

The center Start is a 44×28 outlined pill holding a play triangle. It looks foreign next to the other tabs.

**Deliver a new board, `tabbar.html`, iPhone only:**
1. **3 tab-bar directions**, each shown full size and in place on the Today screen. Reuse the hero via `today-v2-phone.html?dir=full&day=push&photo=full`, or add a mode for it.
2. **In each direction, the center Start has to belong to the bar.** Each one must show:
   - Idle: no solid fill.
   - Running: live timer, white in the colored direction.
   - Hidden-on-workout: just describe it.
3. **New icons:** one family, fitness-specific glyphs, all drawn inline in code.
4. **A state switch:** idle / running / on another tab (e.g. Plan selected).
5. **Plain-language notes** under each direction: what it is, its strength, its risk.

**Ideas worth exploring, not mandatory:**
- A floating capsule bar.
- A center Start that is a raised disc integrated into the bar's edge.
- Labels-only text tabs with a lime underline.
- A bar where Start replaces the label row with the timer.

## Files

| File | What it is |
|---|---|
| `hero.html` | Part 1 board. Full-bleed (A) vs framed (B) photo hero. The user hasn't picked one yet; **ask at the start: "A or B?"** |
| `today-v2.html` | Round 1e board: poster plus body map, week bars, big weight, icon sets A/B |
| `today-v2-phone.html` | One iPhone. Query params: `dir=full\|poster`, `day=push\|legs`, `photo=full\|framed` |
| `og/v2.js`, `og/v2.css` | The current Today v2 screen. The tab bar is the `tabbar()` function plus the `ICONS` sets. |
| `og/app.css`, `og/app.js` | The shared 1b system and the round 1d screen. Their iOS tab bar styles are `.p-ios .tabbar` / `.tab`. |
| `platforms.html`, `today-ios.html`, `today-android.html`, `today-web.html` | Round 1d: the system on all three platforms (older Today layout) |
| `assets/hero/push.jpg` | The user's generated Push photo, 896×1200 |
| `.od-frames/iphone.html` | iPhone shell. Copy it whole for any new handset page. |

**Missing assets:** Pull, Legs and rest-day photos. The user generates them themselves; prompts and specs (2:3, 1200×1800, subject in the top two-thirds) were already given. When they arrive, add them to `PHOTOS` in `og/v2.js`.

## How to work with this user
- **Formatting:** answers short and action-first, numbered steps, at most 5 items per list, one concrete next action at the end. No preamble or recap.
- **Language:** plain, non-technical. Describe what the user will see, not CSS.
- **One part at a time.** Don't redesign other parts unasked.
- **When they ask a question, answer it.** Don't build unless they ask.
- **Image generation** through Open Design Cloud failed ("not logged in"), and stock search was unavailable. Don't switch to another billing provider on your own; hand over prompts instead.
- **Don't claim** screenshots, previews or testing that didn't happen.

**First message to send:** "Before the tab bar: hero A (full-bleed) or B (framed)?" Then build Part 2.
