import { readStream } from "./stream.js";

export async function generate(prompt: string, system: string) {
  try {
    const { CMDH_API_BASE, CMDH_API_KEY } = process.env;
    const endpoint = '/api/generate'; // API endpoint

    const url = new URL(endpoint, CMDH_API_BASE).toString(); // Construct the full URL

    const requestBody = {
      prompt,
      system,
      apiKey: CMDH_API_KEY,
      model: process.env.MODEL_NAME,
    };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Handle the stream
    const reader = response.body;
    if(!reader) {
      throw new Error("Reader was null.");
    }
    const streamResponse = await readStream(
      reader,
      value => value
    );

    return streamResponse.value
  } catch (e) {
    console.log('An error occurred while communicating with the Cmdh API. Please try again later.');
  }
}