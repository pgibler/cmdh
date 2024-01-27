type CommandRequestResponse = {
  setupCommands: string[],
  desiredCommand: string,
  nonInteractive: 'yes' | 'no',
  safetyLevel: 'delete' | 'overwrite' | 'safe',
  assistantMessage: string
}

export function parseResponse(responseData: string): CommandRequestResponse | null {
  try {
    const escapedResponse = responseData.replace(/\\n/g, "\n");
    const data = JSON.parse(escapedResponse);

    if (!Array.isArray(data.setupCommands) || typeof data.desiredCommand !== 'string' ||
      (data.nonInteractive !== 'yes' && data.nonInteractive !== 'no') ||
      (data.safetyLevel !== 'delete' && data.safetyLevel !== 'overwrite' && data.safetyLevel !== 'safe') ||
      typeof data.assistantMessage !== 'string') {
      console.error('Invalid response structure:', data);
      return null;
    }

    return {
      setupCommands: data.setupCommands,
      desiredCommand: data.desiredCommand,
      nonInteractive: data.nonInteractive,
      safetyLevel: data.safetyLevel,
      assistantMessage: data.assistantMessage
    };
  } catch (e) {
    console.error('Failed to parse response:', e);
    return null;
  }
}
