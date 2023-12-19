import fs from 'fs'
import inquirer from 'inquirer';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

export default async function configure() {
  const currentConfig = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    MODEL_NAME: process.env.MODEL_NAME || 'gpt-3.5',
    OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
  };

  const questions = [
    {
      name: 'MODEL_NAME',
      type: 'input',
      message: 'Enter the model name:',
      default: currentConfig.MODEL_NAME,
    },
    {
      name: 'OPENAI_API_KEY',
      type: 'input',
      message: 'Enter your OpenAI API Key:',
      default: currentConfig.OPENAI_API_KEY,
    },
    {
      name: 'OLLAMA_HOST',
      type: 'input',
      message: 'Enter the ollama URL:',
      default: currentConfig.OLLAMA_HOST,
    },
  ];

  console.log("Configure your .env file for cmdh.")
  console.log("The model name will determine whether OpenAI or ollama is used. Use gpt-3.5 or gpt-4 for OpenAI, otherwise ollama will be used.")
  console.log("Set the ollama URL to use ollama or the OpenAI API Key to use the gpt models.")
  console.log("You must set one. You can set both if you want to switch between them.")

  const answers = await inquirer.prompt(questions);

  // Construct the new configuration string, conditionally including OPENAI_API_KEY
  let newConfig = `OPENAI_API_KEY=${answers.OPENAI_API_KEY}\nMODEL_NAME=${answers.MODEL_NAME}\nOLLAMA_HOST=${answers.OLLAMA_HOST}\n`;

  fs.writeFileSync('.env', newConfig);
  console.log('Configuration updated.');
}