# Architecture and content governance

## Boundaries

```text
WordPress read API → refresh/discovery adapter → pending candidates
                                                 ↓ human curation
stable concept/name/image registry → validation → versioned static manifest
                                                       ↓ loaded once
                                   mode + deck engine → game reducer → browser UI
```

The engine has no DOM, fetch, WordPress, or timing dependencies. A caller supplies RNG;
its repeatable sequence plus manifest version/options reproduces a deck. Card instance
ID, matching key, and presentation are separate. Decks contain exactly two cards per key.
The UI owns timers, focus, rendering, and storage; the reducer ignores illegal/repeated
flips and blocks new flips during an unresolved mismatch. Restart calls `startGame`.

## Concept and language registry

Stable opaque concept IDs do not change when spelling or taxonomy changes. Concepts may
be species, broader taxa, or vernacular groups. Approved WordPress tag IDs are discovery
links, never universal biological identifiers. Membership supports broader groupings;
name entries can refer to multiple concepts without forcing an Ojibwe word into a
one-to-one species mapping. A group-learning mode should use curated group concepts,
not silently merge species during play.

Names carry kind, language, nullable dialect, citation/source, and review metadata.
Null text means unavailable, never a prompt to invent a translation. The scientific
mode's `la` is a provisional metadata convention, not a claim that every name is Latin;
confirm the convention in content review. Ojibwe defaults to `oj` with null dialect;
create explicit dialect modes after language/community review. Distinguish identification,
linguistic approval, cultural appropriateness, and permission. Record the actual reviewer
and date for production. The synthetic fixture's approval values are test-only.

Only approved concepts and sourced, approved names/images with approved image rights
are eligible. Missing fields make modes unavailable instead of silently substituting
another language. The engine normalizes visible text for collision detection; duplicate
labels or reused image URLs across matching keys exclude all affected concepts. This
conservative rule may exclude otherwise usable variants and can be improved later by
curating mode-specific selections. Distinct URLs can still show visually identical or
multi-organism photos: editorial review must catch that. A shared broad-scope word must
not become two indistinguishable answers in one species deck.

Image-image options are explicit: the same approved image on both cards, or distinct
approved images for a concept. Neither is selected as a product default. Selection
currently uses registry order before shuffling; randomized photo variants are future work.

## WordPress discovery, not automatic identification

Primary API references (checked 2026-10-29): [Posts](https://developer.wordpress.org/rest-api/reference/posts/)
for `tags` and `featured_media`; [Media](https://developer.wordpress.org/rest-api/reference/media/)
for `post`, `source_url`, and parent filtering; [Tags](https://developer.wordpress.org/rest-api/reference/tags/)
for the `post_tag` term schema. These describe standard WordPress, not verified site-specific configuration.

Standard WordPress tags belong to posts; media attachments do not automatically inherit
those tags. Do not assume a custom attachment taxonomy exists on evolutionspeaks.com.
Inspect actual REST routes before implementing against the site. The intended public,
read-only endpoints are `/wp-json/wp/v2/posts?tags=<id>`, featured media records via
`/wp-json/wp/v2/media/<id>`, and attachment-parent discovery via
`/wp-json/wp/v2/media?parent=<post-id>`. Pagination must be exhausted. Featured images
may be unattached; attachment parent links are incomplete when pictures are reused.
Embedded galleries and custom fields may require a separately verified discovery path.

`candidateFrom` records relationship evidence plus pending review. Post tags are hints
only: one post or photograph can contain many organisms. Approve each image↔concept
association explicitly, including any crop/region necessary for a clear question.
Do not treat alt text or filenames as reliable identifications. Avoid copying raw HTML
into the UI; render labels as plain text. Never edit site content during discovery.

The refresh adapter is an interface, not a live API implementation. Before loading any
external JSON, add runtime schema checks (TypeScript alone is not validation): version,
unique IDs across each collection, references, source/rights/reviewer completeness,
valid dates, allowed HTTPS hostnames, URL protocol, dimensions, image variants, payload
size limits, and no placeholder markers. Validate and atomically publish a new static
manifest only after review; retain last-known-good versions. No API calls per card flip.
Any future private API credential stays in refresh tooling/server-side secrets, never in
browser bundles or manifests. The current scaffold stores no secrets and fetches nothing.

## Accessible UI contract (not implemented)

Use real buttons with stable position labels and keyboard focus, a visible focus ring,
adequate contrast/targets, reduced-motion support, and responsive sizing. Do not expose
hidden faces through accessible labels or off-screen text. After revealing a face,
announce the same information available visually, then announce match/mismatch status
with a polite live region. Use reviewed meaningful image descriptions; do not automatically
speak a scientific answer on a hidden image card. Accessible alternatives must preserve
equivalent learning without making access depend on visual identification alone.

Provide adjustable or user-controlled mismatch dismissal, pause/restart, instructions,
and a no-timer option. Cancel pending UI timers on restart/mode changes and ensure stale
callbacks cannot hide cards in a newer session. Render matched cards without unexpectedly
moving focus. Verify keyboard-only and screen-reader flows, rapid/repeated clicks,
small screens, reduced motion, and long/Unicode labels before embedding.

## Integration and limits

A lightweight TypeScript browser UI can mount in a WordPress shortcode/block or separate
page later; delivery choice remains open. Keep core and content independent of this choice.
No UI, real catalog, refresh pipeline, deployment, persistence, or production security
validation is claimed by the scaffold. Runtime checks listed above are release gates,
not implemented features. The registry is trusted typed input for current tests.

Rights are reserved in `RIGHTS.md`, with original project rights separate from third-party
code, photos, branding, language knowledge, and facts. Before distribution, review locked
dependencies and preserve their required license notices. Private GitHub visibility is
an access setting, not a substitute for rights documentation or secret management.
