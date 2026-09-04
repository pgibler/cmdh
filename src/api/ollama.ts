import { Ollama } from 'ollama';

// Build a generate function for any server that speaks the Ollama API.
// Config is read lazily so that dotenv has populated process.env by then.
export function ollamaGenerator(getConfig: () => { host?: string, model?: string }) {
  return async function generate(prompt: string, system: string) {
    const { host, model } = getConfig();

    const ollama = new Ollama({ host })

    const response = await ollama.chat({
      model: model ?? '',
      messages: [{
        'role': 'system',
        'content': system,
      }, {
        'role': 'user',
        'content': prompt
      }],
      stream: true,
    });

    let buffer = '';
    for await (const part of response) {
      if (part.message) {
        buffer += part.message.content
      }
    }
    return buffer;
  }
}

// Generate a response from ollama
export const generate = ollamaGenerator(() => ({
  host: process.env.OLLAMA_HOST,
  model: process.env.OLLAMA_MODEL_NAME,
}));
