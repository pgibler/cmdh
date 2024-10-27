const { execSync } = require('child_process');

describe('CLI Integration Tests', () => {
  test('should show configuration', () => {
    const result = execSync('cmdh configure show', { encoding: 'utf-8' });
    console.log(result)
    expect(result).toContain('LLM host');
  });

  test('should run with arguments and produce expected output', () => {
    const result = execSync('cmdh run --arg1 value', { encoding: 'utf-8' });
    expect(result).toContain('Expected output');
  });
});
