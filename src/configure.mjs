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
    LOCAL_URL: process.env.LOCAL_URL || 'http://localhost:11434/api/generate',
  };

  const questions = [
    {
      name: 'OPENAI_API_KEY',
      type: 'input',
      message: 'Enter your OpenAI API Key (optional)',
      default: currentConfig.OPENAI_API_KEY,
    },
    {
      name: 'MODEL_NAME',
      type: 'input',
      message: 'Enter the model name:',
      default: currentConfig.MODEL_NAME,
    },
    {
      name: 'LOCAL_URL',
      type: 'input',
      message: 'Enter the local URL:',
      default: currentConfig.LOCAL_URL,
    },
  ];

  const answers = await inquirer.prompt(questions);

  // Construct the new configuration string, conditionally including OPENAI_API_KEY
  let newConfig = `OPENAI_API_KEY=${answers.OPENAI_API_KEY}\nMODEL_NAME=${answers.MODEL_NAME}\nLOCAL_URL=${answers.LOCAL_URL}\n`;

  fs.writeFileSync('.env', newConfig);
  console.log('Configuration updated.');
}