import path from 'path';

// Generate a response from ollama
export async function generate(prompt, system) {
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