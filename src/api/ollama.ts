import { Ollama } from 'ollama';

// Generate a response from ollama
export async function generate(prompt: string, system: string) {
  const { OLLAMA_HOST } = process.env;

  const ollama = new Ollama({ host: OLLAMA_HOST })

  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL_NAME ?? '',
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