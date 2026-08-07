# /r/<slug> — permanent review-link redirects

## Why this exists
The in-book "Leave a review" call-to-action used to hardcode an Amazon URL at EPUB **build
time** — but a book has no ASIN until Amazon assigns one at publish, so the builder baked the
literal placeholder `asin=PENDING`. Nothing ever rebuilt the file afterwards, so **19 of 20
books shipped with a dead review link** (found 2026-08-07). That matters more than it sounds:
every review this catalogue has ever earned came through that in-book prompt.

## The fix
The EPUB now points at `https://theskillmillbooks.com/r/<slug>` — a URL we control. The ASIN
lives HERE, not baked inside a file we cannot update after it ships. If an ASIN changes, or
Amazon changes its review URL format, we edit one small file and every already-shipped copy
starts working again. That is the whole point: **the destination must stay editable after the
book is frozen.**

## Rules
- **Never add an affiliate tag to these URLs.** The Associates Operating Agreement bars a
  Special Link inside an ebook (an offline carrier). A plain review link is fine; a tagged one
  is not. See memory `reference_amazon_associates_compliance_2026-07-31`.
- Keep `noindex` on every page — these are plumbing, and must never compete with the real
  landing page for the same book in search results.
- Always keep a visible human-clickable fallback link: meta-refresh and JS can both be blocked,
  and a reader who taps a review button should never hit a dead end.
