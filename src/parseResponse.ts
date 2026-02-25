type CommandRequestResponse = {
  setupCommands: string[],
  desiredCommand: string,
  nonInteractive: boolean,
  safetyLevel: 'delete' | 'overwrite' | 'safe',
  assistantMessage: string
}

export function parseResponse(responseData: string): CommandRequestResponse | null {
  try {
    const data = parseJsonResponse(responseData);

    const desiredCommand = getString(data.desiredCommand);
    const assistantMessage = getString(data.assistantMessage);
    const nonInteractive = getBoolean(data.nonInteractive);
    const safetyLevel = getSafetyLevel(data.safetyLevel);
    const setupCommands = getSetupCommands(data.setupCommands);

    if (!desiredCommand || !assistantMessage || nonInteractive === null || !safetyLevel) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure detected.');
    }

    return {
      setupCommands,
      desiredCommand,
      nonInteractive,
      safetyLevel,
      assistantMessage
    };
  } catch (e) {
    console.error(`Failed to parse response:\n${JSON.stringify(responseData)}`, e);
    throw `Failed to parse response.\n\n${JSON.stringify(responseData)}`;
  }
}

function parseJsonResponse(responseData: string): any {
  const trimmed = responseData.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  const candidates = buildJsonCandidates(withoutFences);
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('No JSON object found in response.');
}

function buildJsonCandidates(raw: string): string[] {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  const extracted = firstBrace >= 0
    ? (lastBrace > firstBrace ? raw.slice(firstBrace, lastBrace + 1) : raw.slice(firstBrace))
    : raw;

  const withClosingBrace = extracted.trim().endsWith('}') ? extracted : `${extracted}}`;

  const candidates = [
    raw,
    extracted,
    withClosingBrace,
    repairInvalidJsonEscapes(raw),
    repairInvalidJsonEscapes(extracted),
    repairInvalidJsonEscapes(withClosingBrace),
  ];

  return [...new Set(candidates.filter((candidate) => candidate.trim().length > 0))];
}

function repairInvalidJsonEscapes(input: string): string {
  // Keep valid JSON escapes intact and only repair invalid ones (for example "\$").
  return input.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
}

function getString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return null;
}

function getSafetyLevel(value: unknown): 'delete' | 'overwrite' | 'safe' | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'delete' || normalized === 'overwrite' || normalized === 'safe') {
    return normalized;
  }
  return null;
}

function getSetupCommands(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
}
