/* ===== Basic Tests for Game Logic ===== */

// Simple async test runner (in production, use Jest or similar)
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}:`, error.message);
  }
};

// Import game logic functions
import {
  faceVal,
  totals,
  best,
  isBJ,
  canSplit,
  applyAction,
  resolveRound
} from '../server.js';

import {
  sanitizeString,
  MAX_NAME_LENGTH,
  validateMatchId
} from '../validation.js';

console.log('Running game logic tests...\n');

await test('faceVal should return correct values', async () => {
  assert(faceVal({ rank: 'A', suit: '♠' }) === 11, 'Ace should be 11');
  assert(faceVal({ rank: 'K', suit: '♠' }) === 10, 'King should be 10');
  assert(faceVal({ rank: '5', suit: '♠' }) === 5, '5 should be 5');
});

await test('totals should calculate correctly', async () => {
  const hand1 = [{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }];
  const result1 = totals(hand1);
  assert(result1.includes(21), 'Ace + King should include 21');

  const hand2 = [{ rank: 'A', suit: '♠' }, { rank: 'A', suit: '♠' }];
  const result2 = totals(hand2);
  assert(result2.includes(12), 'Two Aces should include 12');
  assert(result2.includes(2), 'Two Aces should include 2');
});

await test('best should return highest non-bust value', async () => {
  const hand1 = [{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }];
  assert(best(hand1) === 21, 'Ace + King best should be 21');

  const hand2 = [{ rank: 'K', suit: '♠' }, { rank: '7', suit: '♠' }, { rank: '5', suit: '♠' }];
  assert(best(hand2) === 22, 'Bust hand should return 22');
});

await test('isBJ should detect blackjacks correctly', async () => {
  const bjHand = [{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }];
  assert(isBJ(bjHand) === true, 'Ace + King should be blackjack');

  const nonBJHand = [{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: '2', suit: '♠' }];
  assert(isBJ(nonBJHand) === false, 'Three cards should not be blackjack');
});

await test('canSplit should work correctly', async () => {
  const splittableHand = [{ rank: 'A', suit: '♠' }, { rank: 'A', suit: '♦' }];
  assert(canSplit({ cards: splittableHand }) === true, 'Two Aces should be splittable');

  const nonSplittableHand = [{ rank: 'A', suit: '♠' }, { rank: 'K', suit: '♦' }];
  assert(canSplit({ cards: nonSplittableHand }) === false, 'Ace + King should not be splittable');
});

await test('Name validation should work', async () => {
  const shortName = sanitizeString('Alice');
  assert(shortName === 'Alice', 'Short name should be unchanged');

  const longName = 'A'.repeat(MAX_NAME_LENGTH + 10);
  const sanitized = sanitizeString(longName);
  assert(sanitized.length === MAX_NAME_LENGTH, 'Long name should be truncated');
});

await test('Match ID validation should work', async () => {
  assert(validateMatchId('ABC123').isValid === true, 'Valid match ID should pass');
  assert(validateMatchId('').isValid === false, 'Empty match ID should fail');
  assert(validateMatchId('A'.repeat(20)).isValid === false, 'Too long match ID should fail');
  assert(validateMatchId('ABC!@#').isValid === false, 'Match ID with special chars should fail');
});

console.log('\n✅ All tests completed!');

export { test, assert };
