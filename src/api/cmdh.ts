import { readStream } from "./stream.js";

export async function generate(prompt, system) {
  try {
    const apiBaseUrl = process.env.CMDH_API_BASE; // Ensure this is a valid URL
    const apiKey = process.env.CMDH_API_KEY; // Your API key
    const endpoint = '/api/generate'; // API endpoint

    const url = new URL(endpoint, apiBaseUrl).toString(); // Construct the full URL

    const requestBody = {
      prompt,
      system,
      apiKey,
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
    const streamResponse = await readStream(reader);

    return streamResponse.value;
  } catch (e) {
    console.log('An error occurred while communicating with the Cmdh API. Please try again later.');
  }
}