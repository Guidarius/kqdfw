# KQDFW — UX/UI Review

A review of the site as it stands, with an eye toward solidifying the proof of concept. Framed around the audience you named: **existing members and weekly logistics**, with look-and-feel polish as the priority. Findings are grouped by theme and ordered within each group by impact. Nothing here has been changed in code — this is the read-first pass.

---

## The short version

The bones are good. The arcade aesthetic is consistent and tasteful, the content/code separation is genuinely well done, and the data model (auto-computed standings, auto-pulled league days, graceful DB fallbacks) is smarter than most community sites ever get. To go from "proof of concept" to "the thing the scene actually relies on every week," the work is mostly **polish, hierarchy, and closing a few loose ends** — not a rebuild.

The three things worth doing first:

1. **Make "where are we playing this week" the loudest thing on the site.** It's the core reason a member visits, and right now it's a quiet box that's empty by default.
2. **Polish the surfaces members touch most** — home hero, calendar on mobile, league day view — for spacing, contrast, and legibility.
3. **Close the loose ends that make it feel unfinished** — dead doc references, a single point-of-contact, placeholder schedule data.

---

## What's working (keep it)

- **Visual identity is coherent.** Amber-on-near-black, the Silkscreen pixel font used *sparingly* as accent rather than body, the one-pixel marquee strip, the single blinking "insert coin" cursor. Restraint is the right call and it reads as intentional. The `prefers-reduced-motion` guard on the blink is a nice touch most people skip.
- **Content lives in data files, not JSX.** `lib/scene.ts`, `lib/league.ts`, `lib/league-days.ts`, `lib/events.ts` mean a non-developer can keep the site current. This is the single most important thing for a volunteer-run scene site and it's done right.
- **Standings compute from scores; the calendar absorbs league days automatically.** Less to maintain, fewer ways to be wrong.
- **Graceful degradation.** Every DB-backed page has a friendly fallback when Supabase isn't wired up. The site is useful before the backend exists.
- **The voting trust model is thoughtful** — anonymous to peers, auditable to admin, one vote per person enforced at the database level via RLS. That's a real design decision, not an accident.

---

## Priority 1 — Surface the weekly "where are we playing"

For a logistics-first audience this is *the* job of the homepage, and it's currently underpowered.

- **The "this week" callout is empty by default and easy to let go stale.** `thisWeek.headline` is a manual string in `lib/scene.ts`. When it's blank, the homepage falls back to "Where we play is decided by weekly member vote" — which describes the *process* rather than answering the *question*. The most common visit ("where do I go tonight?") gets a non-answer. Options, in rough order of effort: (a) make it impossible to ignore that it's blank, (b) auto-fill it from the most recent closed poll's winning option, or (c) at minimum, when it's blank, link straight to the live poll with the current leader.
- **The callout's "vote now" link points to `/members`, which is gated behind login + approval.** For an approved, logged-in member this is fine. For everyone else it's a dead end. Consider showing the *current poll standings* (read-only) on the homepage so the answer is visible without a login round-trip, and reserve the gated page for actually casting a vote.
- **Hierarchy on the homepage is flat.** Hero, "this week," weeknight schedule, league, and join are all stacked at similar visual weight with identical bordered-card treatment. The thing a returning member wants (this week's spot) should be visually dominant; the evergreen stuff (league info, join) can recede. Right now everything competes equally.

## Priority 2 — Look-and-feel polish

You said the feel is the main thing you want to tighten. Specific, concrete passes:

- **Contrast and small-text legibility.** A fair amount of secondary text is `stone-500`/`stone-400` on a `#0e0c0a` background, and several labels are 10–11px in the pixel font (calendar day-of-week headers, calendar chips, standings rank, "this week" eyebrow). Pixel fonts are *especially* hard to read at small sizes. Worth a pass against WCAG AA (4.5:1 for body, 3:1 for large) — bump the dimmest greys one step and reserve sub-12px pixel text for true ornamental accents only.
- **Calendar on mobile is the weakest surface.** A 7-column month grid at ~380px wide gives each day cell almost no room; event chips truncate to near-uselessness and the `min-h-20` cells make for a lot of vertical scrolling. You already have a clean "Upcoming" list directly below — consider making the **agenda/list the default on small screens** and the month grid an opt-in, or hiding the grid below a breakpoint. This is the single biggest mobile win available.
- **Focus states for keyboard and accessibility.** Inputs use `focus:outline-none` and swap to an amber border, which is okay, but most links and buttons have no visible `:focus-visible` style — only `:hover`. Add a consistent amber focus ring so keyboard users (and anyone tabbing through the join form) can see where they are.
- **Spacing rhythm.** The homepage uses `gap-12` between sections while inner pages use `gap-8`/`gap-10`. Cards are uniformly `border-stone-800` rounded boxes everywhere, which is clean but a little monotonous — introducing one or two levels of emphasis (a brighter border or subtle fill on the "primary" card of each page) would create the hierarchy Priority 1 needs and break the visual sameness.
- **Header wrap on narrow screens.** The nav is `flex-wrap`, so on a phone the brand, five nav links, and "Members" wrap onto multiple lines and push content down. It works, but a tidier mobile treatment (condense to the essentials, or a simple menu) would feel more finished.
- **Branding details.** Favicon is still the Next.js default and there's no Open Graph image or tags. For a community that lives on Instagram and Facebook, links shared to those platforms will render as a bare URL. A simple KQDFW OG image + tags is low effort and high polish-per-dollar.

## Priority 3 — Close the loose ends (the "proof of concept" tells)

These are the small things that signal "unfinished" and undercut trust:

- **Dead documentation references.** `SETUP.md` describes public pages as "home, schedule, first night, league, conduct," and `lib/scene.ts` comments reference a `/first-night` page — but there is **no `/first-night` route and no `/schedule` route** (the schedule is the home page). Either build the "first night" page (a genuinely useful newcomer asset — what to expect, how a night runs, that spectating is welcome) or scrub the references. Right now the docs promise pages that don't exist.
- **Single point of contact.** Every contact path (join form, conduct page, "ask for Bob") routes to one person. Your own `/conduct` best-practice note and a `scene.ts` comment both flag that a second co-contact — ideally a woman — matters a lot for a community's safety-reporting and approachability. For a site whose audience is the community itself, this is worth resolving before it's "solid."
- **Placeholder data still in place.** `thisWeek` is empty, several `lib/scene.ts` fields are marked `// EDIT` (league venue, league time say only "Afternoon"), `lib/events.ts` has "Pickup night" placeholders, and a venue (Cidercade) is commented out pending cab confirmation. A scene member who knows the real schedule will spot the placeholders immediately. A pass to replace every `// EDIT` with real info (the SETUP guide's "search for EDIT" tip is the checklist) is what turns this from demo to live.
- **"Where to Play" doesn't say what's actually playable.** It lists venues with areas, but not which currently have a Killer Queen cab, how many cabs, or whether one is the league venue. `lib/league-days.ts` already encodes that Free Play Dallas runs two cabs — surfacing cab count / "league venue" / "active" status here would make the page answer the question it implies.
- **Members first-login writes a guaranteed-to-fail insert on every visit.** In `app/members/page.tsx`, each load runs `from("members").insert(...)` to lazily create the pending row; for any returning member that violates the primary key and errors every time. The error is silently swallowed so nothing breaks, but it's a failed write per page load and a bit fragile. An `upsert` with `onConflict: "id"` (or a `maybeSingle` existence check first) is cleaner. Minor, but it's the kind of thing worth tidying while "solidifying."

## Smaller notes

- **`/conduct` and `/login` aren't in the main nav** (conduct is footer-only; login is reached through Members). Defensible, but community standards being discoverable is a feature, not clutter — consider whether it belongs more prominently.
- **Maps links are Google search URLs**, not specific place links, so they can occasionally resolve to the wrong result. Pinning real place URLs is more reliable.
- **No "add to calendar" affordance.** For a logistics site, an `.ics` download or Google Calendar link on league days / events would get the dates onto members' phones, which is where the value actually lands.
- **Magic-link email is rate-limited** on Supabase's built-in sender (noted in SETUP). Fine for now; wire up Resend before any night where a batch of people try to log in at once.
- **Tech stack is current and sensible** (Next 16, React 19, Tailwind 4, Supabase). Note the repo's own `AGENTS.md` warning that this Next.js version has breaking changes from older conventions — worth keeping in mind for whoever maintains it.

---

## Suggested order of work

If you want a path from here:

1. **Solidify the data** — replace every `// EDIT` placeholder with real schedule, venue, time, and contact info. Nothing else matters if the schedule is wrong.
2. **Make "this week" loud and self-serving** — homepage hierarchy + visible current-poll answer without a login.
3. **Polish pass** — contrast/legibility audit, focus rings, mobile calendar as agenda view, header on mobile.
4. **Branding finish** — favicon + OG image/tags.
5. **Close loose ends** — first-night page (or remove the references), second contact, members upsert fix, "where to play" cab status.

Most of this is an afternoon or two of focused work, not a redesign — which is the good news. The foundation is already the hard part, and it's solid.
