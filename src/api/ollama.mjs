import dotenv from 'dotenv';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export async function ollamaResponse(prompt, system) {
  const ollamaUrl = path.join(process.env.OLLAMA_HOST, 'api/generate');
  const requestBody = JSON.stringify({
    model: process.env["MODEL_NAME"],
    prompt: prompt,
    system: system,  // Simplified for testing
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

    const responseJson = await response.json(); // Read the response body here

    // Use the responseJson for further processing
    return {
      text: responseJson.response
    }; // Adjust according to your needs
  } catch (error) {
    console.error('Error in fetch request:', error);
    throw error;
  }
}