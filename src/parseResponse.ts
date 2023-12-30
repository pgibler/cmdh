
export function parseResponse(response) {
  const regex = /setup commands:\s*((?:\d+\.\s*.+?\n)*?)\ndesired command:\s*(.+)\n\nrunnable in non-interactive shell:\s*(.+)\n\ncommand safety level:\s*(.+)\n\nassistant message:\s*(.+)/;
  const match = response.match(regex);

  if (!match) {
    throw new Error('Invalid response format');
  }

  const setupCommands = match[1]
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.replace(/^\d+\.\s*/, ''));
  const desiredCommand = match[2];
  const nonInteractive = match[3].trim().toLowerCase() === 'yes';
  const safetyLevel = match[4];
  const assistantMessage = match[5];

  return { setupCommands, desiredCommand, nonInteractive, safetyLevel, assistantMessage };
}