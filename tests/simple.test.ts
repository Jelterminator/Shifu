// Simple guaranteed test
test('Jest is working', () => {
  expect(1 + 1).toBe(2);
});

test('Array contains', () => {
  expect([1, 2, 3]).toContain(2);
});

test('String manipulation', () => {
  expect('hello'.toUpperCase()).toBe('HELLO');
});
