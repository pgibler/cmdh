import { describe, expect, jest, test } from '@jest/globals';
import { parseResponse } from './parseResponse.js';

describe('parseResponse', () => {
  test('accepts string "false" for nonInteractive and coerces to boolean false', () => {
    const raw = JSON.stringify({
      setupCommands: [],
      desiredCommand: 'watch sensors',
      nonInteractive: 'false',
      safetyLevel: 'safe',
      assistantMessage: 'Monitor temperatures in real-time.',
    });

    const parsed = parseResponse(raw);
    expect(parsed?.nonInteractive).toBe(false);
  });

  test('parses fenced JSON responses', () => {
    const raw = [
      '```json',
      '{',
      '  "setupCommands": [],',
      '  "desiredCommand": "watch sensors",',
      '  "nonInteractive": true,',
      '  "safetyLevel": "safe",',
      '  "assistantMessage": "Monitor temperatures in real-time."',
      '}',
      '```',
    ].join('\n');

    const parsed = parseResponse(raw);
    expect(parsed?.desiredCommand).toBe('watch sensors');
  });

  test('repairs invalid JSON escapes like \\$ in command text', () => {
    const raw = '{' +
      '"setupCommands":[],' +
      '"desiredCommand":"awk \'{print \\$1}\' /tmp/x",' +
      '"nonInteractive":false,' +
      '"safetyLevel":"safe",' +
      '"assistantMessage":"Shows first column."' +
      '}';

    const parsed = parseResponse(raw);
    expect(parsed?.desiredCommand).toContain("\\$1");
    expect(parsed?.nonInteractive).toBe(false);
  });

  test('recovers when model omits final closing brace', () => {
    const raw = '{' +
      '"setupCommands":[],' +
      '"desiredCommand":"watch sensors",' +
      '"nonInteractive":false,' +
      '"safetyLevel":"safe",' +
      '"assistantMessage":"Monitor temperatures."';

    const parsed = parseResponse(raw);
    expect(parsed?.assistantMessage).toBe('Monitor temperatures.');
  });

  test('throws when required fields are missing', () => {
    const raw = JSON.stringify({
      setupCommands: [],
      desiredCommand: 'watch sensors',
      nonInteractive: true,
    });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => parseResponse(raw)).toThrow('Failed to parse response');
    } finally {
      errorSpy.mockRestore();
    }
  });
});
