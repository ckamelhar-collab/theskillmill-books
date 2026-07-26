---
target: bonus/van-life/index.html
total_score: 29
p0_count: 0
p1_count: 2
timestamp: 2026-07-09T20-44-31Z
slug: bonus-van-life-index-html
---
⚠️ DEGRADED: single-context (no sub-agent/Task tool exposed in this session)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Submit button disables on click but label text never changes to a "Sending…" state, so nothing visibly confirms the click registered until the async fetch resolves |
| 2 | Match Between System / Real World | 4 | Plain language throughout, no jargon |
| 3 | User Control and Freedom | 4 | No traps, no modals, print is reversible |
| 4 | Consistency and Standards | 2 | `.print-btn` and the email submit `button` share the exact same solid-green class — two unrelated actions look like the same priority |
| 5 | Error Prevention | 3 | Inline email regex + required checkbox before submit; good |
| 6 | Recognition Rather Than Recall | 4 | Fully labeled nav and controls, no icon-only affordances |
| 7 | Flexibility and Efficiency | 3 | Print action is a nice power-user affordance |
| 8 | Aesthetic and Minimalist Design | 2 | Not cluttered, but generic — zero imagery anywhere in the DOM, sage/off-white palette + card-with-shadow signup box is the default SaaS-newsletter template regardless of niche |
| 9 | Error Recovery | 3 | Clear plain-language error copy; correctly does NOT call `form.reset()` on failure so the typed email is preserved |
| 10 | Help and Documentation | 1 | No stated cadence/content for what "reader updates" actually are, no FAQ, no reassurance beyond a generic unsubscribe line |
| **Total** | | **29/40** | **Good band, but weak on hierarchy/help — measured, not eyeballed (see evidence below)** |

## Anti-Patterns Verdict

**LLM assessment**: Does not hit the loud AI-slop tells (no gradient text, no side-stripe borders, no glassmorphism, no numbered eyebrow scaffolding repeated per-section). But it lands on the second-order trap: it avoided the obvious tells and landed on the generic minimal-SaaS-newsletter default — sage/off-white palette, system font stack, one card-with-shadow signup box — that could belong to any niche (keto, dog training, productivity). For a "Van Life" lead magnet there is not a single image, texture, or color choice anywhere in the DOM that signals the niche.

**Deterministic scan**: `node scripts/detect.mjs --json bonus/van-life/index.html` → `[]`, exit 0 (clean). No hard-banned patterns present. Notably the scan did NOT catch the eyebrow contrast failure below (4.48:1) — likely scoped to body-copy selectors rather than every text node — so the manual browser-measured pass caught something the automated pass missed.

**Browser evidence** (measured via `preview_inspect`/`preview_eval` against a live localhost static server, not eyeballed):
- Desktop (1280×720): `.capture` form bounding box y=134→513, fully above the fold.
- Mobile (375×812 preset): `.capture` form bounding box y=437→816 — the signup form, including the submit button, starts past the halfway point and its bottom exceeds the 812px viewport entirely. On a real phone with browser chrome (~650-700px usable height) the form is effectively 100% below the fold on load.
- Contrast ratios computed via WCAG relative-luminance formula in-page: `.eyebrow` (#6d755e on #f6f7f2) = **4.48:1**, fails the 4.5:1 AA minimum for text this size (12.48px bold does not meet the 18.66px-bold "large text" 3:1 exemption). All other checked text (dek 6.58:1, bookline 5.84:1, consent label 5.74:1, button 6.25:1, links 6.08:1) passes.
- `.print-btn` computed `background-color: rgb(47,107,87)` and `font-weight: 800` — identical to the email submit button's styling, confirmed via inspection, not assumption.

## Priority Issues

**[P1] Two identically-styled primary buttons compete for the one "primary action" slot.**
Why it matters: `.print-btn` and the email-submit `button` both resolve to solid `background:#2f6b57; color:#fff; font-weight:800`. A visitor scans the page and sees two equally loud green buttons — one of which ("Print This Checklist") lets them get 100% of the content with zero email given, directly undercutting the page's actual job (capture an email).
Fix: Strip `.print-btn` out of the shared `button, .print-btn { background:#2f6b57; ... }` rule and give it its own outline treatment: `.print-btn { background: transparent; color: #2f6b57; border: 1px solid #2f6b57; font-weight: 700; }`. Leave `button[type="submit"]` as the only solid-filled green element on the page.
Suggested command: `/impeccable layout`

**[P1] Copy actively tells the visitor they don't need to give an email.**
Why it matters: hero copy reads "The checklist is on this page. Add your email if you want the follow-up notes…", and the footer reinforces "This companion resource is free and does not require a purchase or review." The entire lead magnet is already rendered, ungated, in `<section class="resource-section">`. There is no incremental reason to type an email.
Fix: Change the capture box to gate something NOT already on the page. Concretely: `<h2>Get Reader Updates</h2>` → `<h2>Get the Printable PDF Checklist</h2>`, and rewrite the paragraph: `<p>Email yourself a printable PDF of this checklist, plus 2 bonus worksheets (fuel-cost calculator, first-week packing list) not published on this page.</p>`. Requires an actual PDF/bonus asset to exist behind the MailerLite automation — but the copy on the live page should stop advertising that email is optional filler.
Suggested command: `/impeccable clarify`

**[P2] Email capture form sits below the fold on mobile.**
Why it matters: measured bounding box (375×812 viewport) places `.capture` at y=437–816 — past the midpoint, extending beyond the viewport itself before any browser chrome is even subtracted. Mobile is the dominant traffic source for a book-bonus link shared from Amazon/social.
Fix: In the existing `@media (max-width: 760px)` block, add tighter hero spacing and reorder so the form appears immediately after the dek, ahead of the companion-book line: `.hero-inner { padding-top: 24px; } .bookline { order: 3; } .capture { order: 2; } .hero-inner > div:first-child { order: 1; }` (requires `.hero-inner` children to be direct flex/grid items, which they already are as a 2-item grid — wrap the text block's paragraphs so `.capture` can be promoted above `.bookline` specifically, or minimally move the `<p class="bookline">` markup after the `<aside class="capture">` in the DOM for mobile-first reading order). Simplest one-line fix: delete the `.bookline` paragraph from the hero entirely and fold "by Open Road Publishing" into the `.dek` sentence — shortens the pre-form scroll on every breakpoint.
Suggested command: `/impeccable adapt`

**[P2] `.eyebrow` text fails WCAG AA contrast (4.48:1, needs 4.5:1).**
Why it matters: it's the literal first thing read on the page ("READER BONUS") and currently fails the accessibility bar by a hair.
Fix: `color: #6d755e` → `color: #5c6350` (verified 5.81:1 against the `#f6f7f2` hero background via in-page contrast calc) — minimal hue-preserving darkening, or `#565c4a` (6.45:1) if more margin is wanted.
Suggested command: `/impeccable audit`

**[P3] Zero imagery anywhere in the DOM.**
Why it matters: there is not one `<img>` tag in the file. The "van life" niche has an obvious, cheap visual hook (a van interior/road photo) and instead the page is 100% text-in-boxes on a sage/off-white background — indistinguishable from a generic newsletter-signup template for any topic.
Fix: Add a real photo as the hero background: `.hero { background: linear-gradient(rgba(20,26,20,.45),rgba(20,26,20,.15)), url('/bonus/van-life/hero.jpg') center/cover; }` with `.eyebrow, h1, .dek, .bookline { color: #fff }` adjusted accordingly (re-verify contrast against the actual photo's darkest region before shipping), or at minimum a small van/road photo inline next to the `.capture` box.
Suggested command: `/impeccable colorize`
