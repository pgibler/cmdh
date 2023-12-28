import dotenv from 'dotenv';
import { oraPromise } from 'ora';
import path from 'path';
import { ollamaResponse } from './ollama.mjs';
import { readStream } from './stream.mjs';
import OpenAI from 'openai';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

export async function startChat(prompt, system, showOra = true) {
  if (showOra) {
    const promise = api.sendMessage(prompt, system);

    return oraPromise(promise, {
      text: truncate(`Retrieving command... ${prompt}`, 75)
    })
  } else {
    return await api.sendMessage(prompt, system);
  }
}

function truncate(input, length) {
  if (input.length > length) {
    const truncated = input.substring(0, length).replace(/\n/g, ' ') + '...';
    return truncated;
  }
  return input;
}

const api = {
  sendMessage: async (prompt, system) => {
    const LLM_HOST = process.env.LLM_HOST;
    if (LLM_HOST === 'cmdh') {
      return await fetchCmdhAPI(prompt, system);
    } else if (LLM_HOST === 'OpenAI') {
      return await fetchOpenAIApi(prompt, system);
    } else if (LLM_HOST === 'ollama') {
      return await ollamaResponse(prompt, system);
    }
  }
};

async function fetchOpenAIApi(prompt, system) {
  try {
    const openai = new OpenAI();
    const stream = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      stream: true,
    });

    try {
      let buffer = '';
      // Collecting data from the stream
      for await (const chunk of stream) {
        // Assuming chunk is a string or can be converted to string
        const content = chunk.choices[0].delta.content
        if (content) {
          buffer += content;
        }
      }
      return buffer;
    } catch (e) {
      throw e;
    }
  } catch (e) {
    if (e.message.includes('OPENAI_API_KEY')) {
      console.log('You must set your OpenAI API key using "cmdh configure" before using the OpenAI mode.');
    } else {
      console.log('An error occurred while communicating with the OpenAI API. Please try again later.');
    }
  }
}

async function fetchCmdhAPI(prompt, system) {
  try {
    const apiBaseUrl = process.env.CMDH_API_BASE; // Ensure this is a valid URL
    const apiKey = process.env.CMDH_API_KEY; // Your API key
    const endpoint = '/api/generate'; // API endpoint

    const url = new URL(endpoint, apiBaseUrl).toString(); // Construct the full URL

    const requestBody = {
      prompt,
      system,
      apiKey,
      model: MODEL_NAME
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