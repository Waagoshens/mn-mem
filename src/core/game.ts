import type { Card } from './schema.ts';
import { isMatch } from './deck.ts';
export interface GameState {
  cards: readonly Card[];
  open: readonly string[];
  matched: readonly string[];
  turns: number;
}
export type Action = { type: 'flip'; cardId: string } | { type: 'hide-mismatch' };
export function startGame(cards: readonly Card[]): GameState {
  if (!cards.length || new Set(cards.map(c => c.id)).size !== cards.length) throw new Error('Expected nonempty deck with unique card IDs');
  const counts = new Map<string, number>();
  cards.forEach(c => counts.set(c.matchKey, (counts.get(c.matchKey) ?? 0) + 1));
  if ([...counts.values()].some(n => n !== 2)) throw new Error('Expected exactly two cards per match key');
  return { cards: cards.map(c => ({ ...c, face: { ...c.face } })), open: [], matched: [], turns: 0 };
}
/** UI owns mismatch timing; engine owns state and ignores duplicate/locked flips. */
export function reduceGame(state: GameState, action: Action): GameState {
  if (action.type === 'hide-mismatch') return state.open.length === 2 ? { ...state, open: [] } : state;
  if (state.open.length === 2 || state.open.includes(action.cardId) || state.matched.includes(action.cardId)) return state;
  const card = state.cards.find(c => c.id === action.cardId);
  if (!card) return state;
  const first = state.cards.find(c => c.id === state.open[0]);
  if (!first) return { ...state, open: [card.id] };
  return isMatch(first, card)
    ? { ...state, open: [], matched: [...state.matched, first.id, card.id], turns: state.turns + 1 }
    : { ...state, open: [first.id, card.id], turns: state.turns + 1 };
}
export const isComplete = (state: GameState): boolean => state.matched.length === state.cards.length;
