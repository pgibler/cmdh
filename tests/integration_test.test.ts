const { execSync } = require('child_process');

describe('CLI Integration Tests', () => {
  test('should install the CLI successfully', () => {
    try {
      // Replace with actual install command
      execSync('npm install -g ./', { stdio: 'inherit' });
    } catch (error: any) {
      throw new Error(`CLI installation failed: ${error.message}`);
    }
  });

  test('should display help message', () => {
    const result = execSync('mycli --help', { encoding: 'utf-8' });
    expect(result).toContain('Usage');
  });

  test('should run with arguments and produce expected output', () => {
    const result = execSync('mycli run --arg1 value', { encoding: 'utf-8' });
    expect(result).toContain('Expected output');
  });
});
