import 'jest';
import { mergeString } from './util';

test('merge string', () => {
  expect(mergeString('acbdefgh', 'ghfabcd')).toBe('acbdefghfabcd');
  expect(mergeString('acbdghfabcdefgh', 'ghfabcdefgh')).toBe('acbdghfabcdefgh');
  expect(mergeString('acb', 'acb')).toBe('acb');
  expect(mergeString('acb', '')).toBe('acb');
  expect(mergeString('', 'acb')).toBe('acb');
  expect(mergeString('acbdefgh', 'ghfabcd', '+')).toBe('acbdefgh+fabcd');
  expect(mergeString('acb', '', '+')).toBe('acb');
  expect(mergeString('', 'acb', '+')).toBe('acb');
});
