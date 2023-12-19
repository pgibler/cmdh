import dotenv from 'dotenv';
import { oraPromise } from 'ora';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../.env');

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

const { OPENAI_API_KEY, MODEL_NAME, LOCAL_URL } = process.env;

const api = {
  sendMessage: async (prompt, system) => {
    if (openAIModels.includes(MODEL_NAME)) {
      const openAIApi = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        completionParams: {
          model: 'gpt-4',
          top_p: 0.2,
        }
      });
      return await openAIApi.sendMessage(prompt, { systemMessage: system });
    }
    return await ollamaResponse(prompt, system);
  }
};

import { ChatGPTAPI } from 'chatgpt';

const openAIModels = ['gpt-3.5', 'gpt-4'];

async function ollamaResponse(prompt, system) {
  const response = await fetch(LOCAL_URL, {
    method: 'POST',
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt,
      system
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.body) {
    throw new Error('Response body is not readable');
  }

  const reader = response.body.getReader();
  let completeResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const chunk = new TextDecoder("utf-8").decode(value);
    const json = JSON.parse(chunk);
    completeResponse += json.response;
  }

  return {
    text: completeResponse
  };
}