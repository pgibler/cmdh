import { ollamaGenerator } from './ollama.js';

// Generate a response from llmman (https://github.com/llmmanorg/llmman),
// a local model runner that serves the Ollama API on port 17434.
export const generate = ollamaGenerator(() => ({
  host: process.env.LLMMAN_HOST || 'http://localhost:17434',
  model: process.env.LLMMAN_MODEL_NAME,
}));
