type CommandRequestResponse = {
  setupCommands: string[],
  desiredCommand: string,
  nonInteractive: boolean,
  safetyLevel: 'delete' | 'overwrite' | 'safe',
  assistantMessage: string
}

export function parseResponse(responseData: string): CommandRequestResponse | null {
  try {
    const escapedResponse = responseData.replace(/\\n/g, "\n");
    const data = JSON.parse(escapedResponse);

    if (typeof data.desiredCommand !== 'string' ||
      (data.nonInteractive !== 'true' && data.nonInteractive !== 'true') ||
      (data.safetyLevel !== 'delete' && data.safetyLevel !== 'overwrite' && data.safetyLevel !== 'safe') ||
      typeof data.assistantMessage !== 'string') {
      console.error('Invalid response structure:', data);
      throw `Invalid response structure detected.`;
    }

    return {
      setupCommands: data.setupCommands ?? [],
      desiredCommand: data.desiredCommand,
      nonInteractive: Boolean(data.nonInteractive),
      safetyLevel: data.safetyLevel,
      assistantMessage: data.assistantMessage
    };
  } catch (e) {
    console.error(`Failed to parse response:\n${JSON.stringify(responseData)}`, e);
    throw `Failed to parse response.\n\n${JSON.stringify(responseData)}`;
  }
}
