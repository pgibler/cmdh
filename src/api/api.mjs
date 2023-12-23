import dotenv from 'dotenv';
import { oraPromise } from 'ora';
import path from 'path';
import { ollamaResponse } from './ollama.mjs';

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

const { OPENAI_API_KEY, MODEL_NAME, CMDH_API_KEY } = process.env;

import { ChatGPTAPI } from 'chatgpt';

const openAIModels = ['gpt-3.5-turbo', 'gpt-4'];

const api = {
  sendMessage: async (prompt, system) => {
    if (CMDH_API_KEY.trim() !== '') {
      const response = await fetch('https://cmdh.ai/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          system,
          apiKey: process.env.CMDH_API_KEY,
          model: MODEL_NAME
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } else if (openAIModels.includes(MODEL_NAME)) {
      const openAIApi = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        completionParams: {
          model: MODEL_NAME,
          top_p: 0.2,
        }
      });
      return await openAIApi.sendMessage(prompt, { systemMessage: system });
    } else {
      return await ollamaResponse(prompt, system);
    }
  }
};
