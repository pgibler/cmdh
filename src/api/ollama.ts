import dotenv from 'dotenv';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export async function ollamaResponse(prompt, system) {
  const ollamaUrl = path.join(process.env.OLLAMA_HOST, 'api/generate');
  const requestBody = JSON.stringify({
    model: process.env.MODEL_NAME,
    prompt: prompt,
    system: system,
    stream: false,
  });

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      body: requestBody,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const responseJson = await response.json();

    return responseJson.response;
  } catch (error) {
    console.error("Error fetching response from Ollama API: ", error);
  }
}