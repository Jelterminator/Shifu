// Simple test to verify Jest setup
describe('Jest Configuration Test', () => {
  it('should add numbers correctly', () => {
    expect(1 + 2).toBe(3);
  });

  it('should handle strings', () => {
    expect('Hello').toContain('Hell');
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
