import test from 'node:test';
import assert from 'node:assert/strict';
import { placeholder } from '../fixtures/placeholder.ts';
import { modes } from '../src/core/modes.ts';
import { buildDeck, isMatch } from '../src/core/deck.ts';
import { startGame, reduceGame, isComplete } from '../src/core/game.ts';
import { candidateFrom } from '../src/adapters/wordpress.ts';
const options = { pairs: 3, imagePair: 'same', random: () => 0.25 };
const deck = (manifest = placeholder, mode = modes[1], overrides = {}) => buildDeck(manifest, mode, { ...options, ...overrides });
test('deterministic, immutable deck with unique cards and two per concept', () => {
  const before = JSON.stringify(placeholder); const cards = deck();
  assert.deepEqual(cards, deck()); assert.equal(cards.length, 6);
  assert.equal(new Set(cards.map(c => c.id)).size, 6);
  for (const c of cards) assert.equal(cards.filter(x => isMatch(c, x)).length, 1);
  assert.equal(JSON.stringify(placeholder), before);
});
test('same and different approved image policies', () => {
  for (const imagePair of ['same', 'different']) {
    const cards = deck(placeholder, modes[0], { imagePair });
    for (const c of cards) {
      const other = cards.find(x => isMatch(c, x));
      assert.equal(c.face.url === other.face.url, imagePair === 'same');
    }
  }
});
test('missing, unreviewed, unsourced, and unauthorized data excluded', () => {
  for (const mutate of [
    m => { m.names[0].text = null; }, m => { m.names[0].review.status = 'pending'; },
    m => { m.names[0].source = null; }, m => { m.concepts[0].review.status = 'pending'; },
    m => { m.images.filter(i => i.conceptIds.includes('placeholder-1')).forEach(i => i.rights.status = 'pending'); },
  ]) { const m = structuredClone(placeholder); mutate(m); assert.throws(() => deck(m), /available 2/); }
  assert.throws(() => deck(placeholder, modes[3]), /available 0/);
});
test('colliding normalized labels and shared images cannot create ambiguous answers', () => {
  const m = structuredClone(placeholder); m.names[1].text = '  PLACEHOLDER   label 1 ';
  assert.throws(() => deck(m), /available 1/);
  const shared = structuredClone(placeholder); shared.images[2].url = shared.images[0].url;
  assert.throws(() => deck(shared), /available 1/);
});
test('broad name scope is retained, but not used as indistinguishable species answers', () => {
  const m = structuredClone(placeholder); m.names[0].conceptIds.push('placeholder-2');
  assert.throws(() => deck(m), /available 1/);
});
test('dialect selection is explicit', () => {
  const m = structuredClone(placeholder); m.names.forEach(n => n.dialect = 'fixture-only');
  assert.throws(() => deck(m), /available 0/);
  assert.equal(deck(m, { ...modes[1], right: { ...modes[1].right, dialect: 'fixture-only' } }).length, 6);
});
test('reject invalid options, duplicate concepts and invalid RNG', () => {
  for (const pairs of [0, -1, 1.5, 99]) assert.throws(() => deck(placeholder, modes[1], { pairs }));
  assert.throws(() => deck(placeholder, modes[1], { random: () => 1 }), /Random/);
  const m = structuredClone(placeholder); m.concepts.push(m.concepts[0]); assert.throws(() => deck(m), /Duplicate/);
});
test('mismatch blocks repeated/new flips until explicit hide; matching completes game', () => {
  let state = startGame(deck()); const original = state;
  const a = state.cards[0]; const b = state.cards.find(c => c.matchKey !== a.matchKey);
  state = reduceGame(state, { type: 'flip', cardId: a.id });
  assert.equal(reduceGame(state, { type: 'flip', cardId: a.id }), state);
  state = reduceGame(state, { type: 'flip', cardId: b.id });
  assert.equal(reduceGame(state, { type: 'flip', cardId: state.cards[2].id }), state);
  state = reduceGame(state, { type: 'hide-mismatch' });
  assert.equal(state.turns, 1); assert.deepEqual(original.open, []);
  for (const key of new Set(state.cards.map(c => c.matchKey))) {
    for (const card of state.cards.filter(c => c.matchKey === key)) state = reduceGame(state, { type: 'flip', cardId: card.id });
  }
  assert.equal(isComplete(state), true); assert.equal(state.turns, 4);
  assert.equal(reduceGame(state, { type: 'flip', cardId: a.id }), state);
});
test('invalid deck rejected and unknown card ignored', () => {
  assert.throws(() => startGame([])); assert.throws(() => startGame(deck().slice(1)));
  const s = startGame(deck()); assert.equal(reduceGame(s, { type: 'flip', cardId: 'unknown' }), s);
});
test('WordPress evidence creates pending candidates, never identifications', () => {
  const post = { id: 10, tags: [2], featured_media: 20 };
  const media = { id: 20, post: null, source_url: 'https://example.invalid/image', alt_text: '' };
  assert.equal(candidateFrom(post, media).review, 'pending');
  assert.equal(candidateFrom(post, { ...media, id: 21 }), null);
  assert.equal(candidateFrom(post, { ...media, id: 21, post: 10 }).evidence, 'attachment-parent');
  assert.deepEqual(post.tags, [2]);
});
test('registry can express name-to-name without changing the engine', () => {
  const mode = { id: 'placeholder-name-pair', label: 'Test only', left: modes[1].right, right: modes[1].right };
  const cards = deck(placeholder, mode);
  assert.equal(cards.length, 6); assert.equal(cards.every(c => c.face.kind === 'name'), true);
});
test('different-image mode rejects concepts without two distinct approved images', () => {
  const m = structuredClone(placeholder); m.images = m.images.filter(i => !i.id.endsWith('-2'));
  assert.throws(() => deck(m, modes[0], { imagePair: 'different' }), /available 0/);
});
