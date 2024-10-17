const { execSync } = require('child_process');

describe('CLI Integration Tests', () => {
  test('should display help message', () => {
    const result = execSync('cmdh configure', { encoding: 'utf-8' });
    expect(result).toContain('Usage');
  });

  test('should run with arguments and produce expected output', () => {
    const result = execSync('cmdh run --arg1 value', { encoding: 'utf-8' });
    expect(result).toContain('Expected output');
  });
});
