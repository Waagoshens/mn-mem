import type { Card, FaceSpec, Manifest, Mode, Presentation } from './schema.ts';
export type Random = () => number;
export interface DeckOptions {
  pairs: number;
  imagePair: 'same' | 'different'; // Explicit choice, no hidden pedagogical default.
  random: Random; // Caller supplies seeded PRNG for reproducible decks/tests.
}
function shuffle<T>(values: readonly T[], random: Random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const n = random();
    if (!Number.isFinite(n) || n < 0 || n >= 1) throw new Error('Random must return [0, 1)');
    const j = Math.floor(n * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
function faces(manifest: Manifest, conceptId: string, spec: FaceSpec): Presentation[] {
  if (spec.kind === 'image') return manifest.images
    .filter(i => i.conceptIds.includes(conceptId) && i.review.status === 'approved'
      && i.rights.status === 'approved' && i.source !== null && i.alt.trim() && i.url.trim())
    .map(i => ({ kind: 'image', imageId: i.id, url: i.url, alt: i.alt }));
  return manifest.names.filter(n => n.conceptIds.includes(conceptId) && n.kind === spec.nameKind
    && n.language === spec.language && n.dialect === spec.dialect
    && n.review.status === 'approved' && n.source !== null && n.text?.trim())
    .map(n => ({ kind: 'name', nameId: n.id, text: n.text!, language: n.language, dialect: n.dialect }));
}
/** Compare what the player actually sees, not record IDs. */
function signature(face: Presentation): string {
  return face.kind === 'image' ? `image:${face.url}`
    : `name:${face.text.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()}`;
}
/** Conservative ambiguity policy: excludes every concept involved in a collision.
 * It can reject a viable alternative selection; an editor can curate a narrower manifest.
 */
export function buildDeck(manifest: Manifest, mode: Mode, options: DeckOptions): Card[] {
  if (!Number.isInteger(options.pairs) || options.pairs < 1) throw new Error('pairs must be a positive integer');
  const ids = manifest.concepts.map(c => c.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate concept IDs');
  const candidates = manifest.concepts.filter(c => c.review.status === 'approved').flatMap(c => {
    const left = faces(manifest, c.id, mode.left)[0];
    if (!left) return [];
    const right = faces(manifest, c.id, mode.right).find(r =>
      mode.left.kind !== 'image' || mode.right.kind !== 'image' || options.imagePair === 'same'
        || signature(r) !== signature(left));
    return right ? [{ conceptId: c.id, left, right }] : [];
  });
  const owners = new Map<string, Set<string>>();
  for (const pair of candidates) for (const face of [pair.left, pair.right]) {
    const key = signature(face);
    const set = owners.get(key) ?? new Set<string>();
    set.add(pair.conceptId); owners.set(key, set);
  }
  const eligible = candidates.filter(p => [p.left, p.right].every(f => owners.get(signature(f))!.size === 1));
  if (eligible.length < options.pairs) throw new Error(`Not enough unambiguous approved pairs: requested ${options.pairs}, available ${eligible.length}`);
  const cards = shuffle(eligible, options.random).slice(0, options.pairs).flatMap(p => [
    { id: `${p.conceptId}:left`, matchKey: p.conceptId, face: p.left },
    { id: `${p.conceptId}:right`, matchKey: p.conceptId, face: p.right },
  ]);
  return shuffle(cards, options.random);
}
export function isMatch(a: Card, b: Card): boolean {
  return a.id !== b.id && a.matchKey === b.matchKey;
}
