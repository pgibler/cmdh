import dotenv from 'dotenv';
import { oraPromise } from 'ora';
import path from 'path';
import { generate as generateCmdh } from './cmdh.js';
import { generate as generateOpenAI } from './openai.js';
import { generate as generateOllama } from './ollama.js';

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
      return await generateCmdh(prompt, system);
    } else if (LLM_HOST === 'OpenAI') {
      return await generateOpenAI(prompt, system);
    } else if (LLM_HOST === 'ollama') {
      return await generateOllama(prompt, system);
    }
  }
};
