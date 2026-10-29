import type { Manifest } from '../src/core/schema.ts';
/** Synthetic test records only: not real names, species, Ojibwe, or photographs. */
export const placeholder: Manifest = {
  schemaVersion: 1, contentVersion: 'placeholder-1', generatedAt: '2026-10-29T00:00:00Z',
  concepts: [1, 2, 3].map(n => ({ id: `placeholder-${n}`, scope: 'species', memberConceptIds: [],
    wordpressTagIds: [], review: { status: 'approved', reviewer: 'TEST ONLY', reviewedAt: null } })),
  names: [1, 2, 3].map(n => ({ id: `label-${n}`, conceptIds: [`placeholder-${n}`], kind: 'english',
    text: `Placeholder label ${n}`, language: 'en', dialect: null,
    source: { citation: 'Synthetic fixture, not educational content', url: null },
    review: { status: 'approved', reviewer: 'TEST ONLY', reviewedAt: null } })),
  images: [1, 2, 3].flatMap(n => [1, 2].map(v => ({ id: `placeholder-${n}-${v}`,
    wordpressMediaId: null, url: `/placeholder-only/${n}-${v}.svg`, alt: `Placeholder shape ${n}, view ${v}`,
    conceptIds: [`placeholder-${n}`], source: { citation: 'Synthetic fixture; no image file', url: null },
    rights: { status: 'approved', note: 'TEST ONLY; not a photo permission record' },
    review: { status: 'approved', reviewer: 'TEST ONLY', reviewedAt: null } }))),
};
