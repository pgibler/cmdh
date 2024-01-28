import { oraPromise } from 'ora';
import { generate as generateCmdh } from './cmdh.js';
import { generate as generateOpenAI } from './openai.js';
import { generate as generateOllama } from './ollama.js';
import { generate as generateTextGenerationWebUI } from './text_generation_web_ui.js';

const generateFunctionMap = {
  'cmdh': generateCmdh,
  'OpenAI': generateOpenAI,
  'ollama': generateOllama,
  'text-generation-webui': generateTextGenerationWebUI
}

export async function startChat(prompt, system, showOra = true) {
  const generateFunction = generateFunctionMap[process.env.LLM_HOST]
  if (showOra) {
    const promise = generateFunction(prompt, system);

    return oraPromise(promise, {
      text: truncate(`Retrieving command... ${prompt}`, 75)
    })
  } else {
    return await generateFunction(prompt, system);
  }
}

function truncate(input, length) {
  if (input.length > length) {
    const truncated = input.substring(0, length).replace(/\n/g, ' ') + '...';
    return truncated;
  }
  return input;
}