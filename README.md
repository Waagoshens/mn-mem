# mn-mem

**Private, proprietary scaffold — not a finished game or published website.**
Copyright © 2026 Eric Holton. All rights reserved. See [RIGHTS.md](RIGHTS.md).

A memory-style learning game for evolutionspeaks.com photographs: image ↔ image,
image ↔ English, image ↔ scientific name, image ↔ Ojibwe, and future combinations.
Approved content is required before any mode becomes playable. No real photographs,
species identifications, or Ojibwe names are supplied here.

## Run the foundation

Node 24+ runs the TypeScript source directly via built-in type stripping:

```sh
npm test                # no install required; built-in Node test runner
npm ci                  # installs the locked development-only TypeScript compiler
npm run typecheck
npm run check           # typecheck + tests
```

There are no runtime dependencies, no server, no browser build yet, and no credentials.
`private: true` prevents accidental npm publication; it does not control GitHub visibility.
Keep the GitHub repository private. A lockfile is included for reproducible development installs; preserve dependency notices. No remote, push, deployment, or website edit
is performed by this scaffold.

## Layout

- `src/core/schema.ts`: versioned content contract, review/provenance/rights metadata.
- `src/core/modes.ts`: extensible mode definitions, including Ojibwe without invented labels.
- `src/core/deck.ts`: deterministic pairing, eligibility, ambiguity exclusion, shuffling.
- `src/core/game.ts`: pure turn state reducer, mismatch lock, match and completion checks.
- `src/adapters/wordpress.ts`: read-only adapter contract and pending candidate construction.
- `fixtures/placeholder.ts`: synthetic records only; image paths are intentionally nonexistent.
- `tests/core.test.mjs`: executable foundation tests.
- `docs/architecture.md`: boundaries, ingestion, accessibility, safety, next steps.

## First implementation milestones

1. Confirm actual WordPress taxonomy/media behavior and choose a small content collection.
2. Curate stable concepts, image permissions, source-backed labels, and language review.
3. Build and validate a versioned manifest via a separate refresh command.
4. Add an accessible UI against the pure core; choose same-image vs different-view behavior.
5. Test keyboard/screen-reader/mobile use and only then integrate with WordPress.

No accounts, payments, analytics, or leaderboards are included. There is no open-source
license grant; dependencies, photographs, and branding require their own rights handling.
