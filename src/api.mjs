import dotenv from 'dotenv';
import { ChatGPTAPI } from 'chatgpt';
import { oraPromise } from 'ora';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

const { OPENAI_API_KEY } = process.env;

const api = new ChatGPTAPI({
  apiKey: OPENAI_API_KEY,
  completionParams: {
    model: 'gpt-4',
    top_p: 0.2,
  }
});

export async function startChat(prompt, options, showOra = true) {
  if (showOra) {
    const promise = api.sendMessage(prompt, options);

    return oraPromise(promise, {
      text: truncate(`Retrieving command... ${prompt}`, 75)
    })
  } else {
    return await api.sendMessage(prompt, options);
  }
}

function truncate(input, length) {
  if (input.length > length) {
    const truncated = input.substring(0, length).replace(/\n/g, ' ') + '...';
    return truncated;
  }
  return input;
}