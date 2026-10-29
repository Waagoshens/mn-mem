import type { Mode, NameKind } from './schema.ts';
const nameMode = (kind: NameKind, language: string, label: string): Mode => ({
  id: `image-${kind}`, label, left: { kind: 'image' },
  right: { kind: 'name', nameKind: kind, language, dialect: null },
});
/** Dialect null selects only entries explicitly marked null, not all dialects. */
export const modes: readonly Mode[] = [
  { id: 'image-image', label: 'Match images', left: { kind: 'image' }, right: { kind: 'image' } },
  nameMode('english', 'en', 'Image ↔ English'),
  nameMode('scientific', 'la', 'Image ↔ scientific name'),
  nameMode('ojibwe', 'oj', 'Image ↔ Ojibwe'),
];
// Add name↔name and dialect-specific modes as data; the deck engine is unchanged.
