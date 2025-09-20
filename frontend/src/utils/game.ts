import type { CardT } from '../types';

// Calculer la valeur d'une carte
export function faceVal(card: CardT): number {
  if (card.rank === "A") return 11;
  if (["K", "Q", "J", "10"].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
}

// Calculer tous les totaux possibles d'une main
export function totals(cards: CardT[]): number[] {
  let total = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.rank === "A") {
      aces++;
      total += 11;
    } else {
      total += faceVal(card);
    }
  }
  
  const results = [total];
  while (aces > 0) {
    total -= 10;
    aces--;
    results.push(total);
  }
  
  return [...new Set(results)].sort((a, b) => b - a);
}

// Calculer les totaux sûrs (≤ 21)
export function safeTotals(cards: CardT[]): number[] {
  const safe = totals(cards).filter(x => x <= 21).sort((a, b) => a - b);
  return safe.length ? safe : [totals(cards).slice(-1)[0]];
}

// Vérifier si c'est un blackjack
export function isBlackjack(cards: CardT[]): boolean {
  return cards.length === 2 && safeTotals(cards).includes(21);
}

// Vérifier si on peut splitter
export function canSplit(cards: CardT[]): boolean {
  return cards.length === 2 && faceVal(cards[0]) === faceVal(cards[1]);
}

// Vérifier si on peut doubler
export function canDouble(cards: CardT[], noHit?: boolean): boolean {
  return cards.length === 2 && !noHit;
}

