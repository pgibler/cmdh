import fs from 'fs'
import inquirer from 'inquirer';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

export default async function configure(promptArg: string) {
  if (promptArg === 'show') {
    await showConfiguration();
  } else {
    await modify();
  }
}

async function showConfiguration() {
  const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MODEL_NAME: process.env.MODEL_NAME,
    OLLAMA_HOST: process.env.OLLAMA_HOST,
    CMDH_API_KEY: process.env.CMDH_API_KEY,
    CMDH_API_BASE: process.env.CMDH_API_BASE,
    LLM_HOST: process.env.LLM_HOST,
  };

  console.log(`LLM Host: ${config.LLM_HOST}`);
  console.log(`Model: ${config.MODEL_NAME}`);

  if ('OpenAI' === config.LLM_HOST) {
    console.log(`API key: ${config.OPENAI_API_KEY}`);
  }
  if ('ollama' === config.LLM_HOST) {
    console.log(`ollama host URL: ${config.OLLAMA_HOST}`);
  }
  if ('cmdh' === config.LLM_HOST) {
    console.log(`API key: ${config.CMDH_API_KEY}`);
    console.log(`API base URL: ${config.CMDH_API_BASE}`);
  }
}

async function modify() {
  const currentConfig = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    MODEL_NAME: process.env.MODEL_NAME || 'gpt-4',
    OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
    CMDH_API_KEY: process.env.CMDH_API_KEY || '',
    CMDH_API_BASE: process.env.CMDH_API_BASE || 'https://cmdh.ai/',
  };

  const llmHostPrompt = await inquirer.prompt({
    name: 'LLM_HOST',
    type: 'list',
    message: 'Which LLM host do you want to use?',
    choices: ['OpenAI', 'ollama'],
  });

  const llmHost = llmHostPrompt.LLM_HOST;

  async function getQuestions() {
    if (llmHost === 'OpenAI') {
      console.log("Configure the OpenAI API key and model to use.")
      return [{
        name: 'OPENAI_API_KEY',
        type: 'input',
        message: 'Enter your OpenAI API Key:',
        default: currentConfig.OPENAI_API_KEY,
      }, {
        name: 'MODEL_NAME',
        type: 'list',
        message: 'Which model do you want to use?',
        choices: ['gpt-3.5-turbo', 'gpt-4'],
        default: currentConfig.MODEL_NAME,
      }]
    } else if (llmHost === 'ollama') {
      console.log("Configure the ollama URL and model to use. ollama must be running with the configured model when using cmdh.")
      return [{
        name: 'MODEL_NAME',
        type: 'input',
        message: 'Enter the model name:',
        default: currentConfig.MODEL_NAME,
      }, {
        name: 'OLLAMA_HOST',
        type: 'input',
        message: 'Enter the ollama URL:',
        default: currentConfig.OLLAMA_HOST,
      }]
    } else if (llmHost === 'cmdh') {
      console.log("Configure the cmdh-ai API key and model to use.")
      return [{
        name: 'MODEL_NAME',
        type: 'input',
        message: 'Enter the model name:',
        default: currentConfig.MODEL_NAME,
      }, {
        name: 'CMDH_API_KEY',
        type: 'input',
        message: 'Enter your cmdh API key:',
        default: currentConfig.CMDH_API_KEY,
      }];
    }
  }

  const questions = await getQuestions();

  const answers = await inquirer.prompt(questions);

  const combined = { ...currentConfig, ...answers, }

  // Construct the new configuration string, conditionally including OPENAI_API_KEY
  let newConfig = [
    `OPENAI_API_KEY=${combined.OPENAI_API_KEY}`,
    `MODEL_NAME=${combined.MODEL_NAME}`,
    `OLLAMA_HOST=${combined.OLLAMA_HOST}`,
    `CMDH_API_KEY=${combined.CMDH_API_KEY}`,
    `CMDH_API_BASE=${combined.CMDH_API_BASE}`,
    `LLM_HOST=${llmHost}`
  ].join('\n')

  fs.writeFileSync('.env', newConfig);
  console.log('Configuration updated.');
}