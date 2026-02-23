import fs from 'fs'
import inquirer from 'inquirer';

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
    OPENAI_MODEL_NAME: process.env.OPENAI_MODEL_NAME,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    OLLAMA_MODEL_NAME: process.env.OLLAMA_MODEL_NAME,
    CMDH_MODEL_NAME: process.env.CMDH_MODEL_NAME,
    TEXT_GENERATION_WEBUI_MODEL_NAME: process.env.TEXT_GENERATION_WEBUI_MODEL_NAME,
    OLLAMA_HOST: process.env.OLLAMA_HOST,
    CMDH_API_KEY: process.env.CMDH_API_KEY,
    CMDH_API_BASE: process.env.CMDH_API_BASE,
    LLM_HOST: process.env.LLM_HOST,
  };

  console.log(`LLM Host: ${config.LLM_HOST}`);

  // Use a switch or if-else block to display the model name based on LLM_HOST
  switch (config.LLM_HOST) {
    case 'OpenAI':
      console.log(`Model: ${config.OPENAI_MODEL_NAME}`);
      console.log(`API key: ${config.OPENAI_API_KEY}`);
      break;
    case 'Azure-OpenAI':
      console.log(`Deployment: ${config.AZURE_OPENAI_DEPLOYMENT_NAME}`);
      console.log(`Endpoint: ${config.AZURE_OPENAI_ENDPOINT}`);
      console.log(`API key: ${config.AZURE_OPENAI_API_KEY}`);
      break;
    case 'ollama':
      console.log(`Model: ${config.OLLAMA_MODEL_NAME}`);
      console.log(`ollama host URL: ${config.OLLAMA_HOST}`);
      break;
    case 'cmdh':
      console.log(`Model: ${config.CMDH_MODEL_NAME}`);
      console.log(`API key: ${config.CMDH_API_KEY}`);
      console.log(`API base URL: ${config.CMDH_API_BASE}`);
      break;
    case 'text-generation-webui':
      console.log(`Model: ${config.TEXT_GENERATION_WEBUI_MODEL_NAME}`);
      // Additional configuration for text-generation-webui can be displayed here
      break;
    default:
      console.log('Unknown LLM Host.');
  }
}

async function modify() {
  // Update currentConfig to remove MODEL_NAME and include distinct model names for each host
  const currentConfig = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL_NAME: process.env.OPENAI_MODEL_NAME || 'gpt-4', // Default for OpenAI
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || '',
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
    OLLAMA_MODEL_NAME: process.env.OLLAMA_MODEL_NAME || 'custom-model', // Assuming a default
    CMDH_MODEL_NAME: process.env.CMDH_MODEL_NAME || 'custom-model', // Assuming a default
    TEXT_GENERATION_WEBUI_MODEL_NAME: process.env.TEXT_GENERATION_WEBUI_MODEL_NAME || 'custom-model', // Assuming a default
    OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
    CMDH_API_KEY: process.env.CMDH_API_KEY || '',
    CMDH_API_BASE: process.env.CMDH_API_BASE || 'https://cmdh.ai/',
    TEXT_GENERATION_WEBUI_HOST: process.env.TEXT_GENERATION_WEBUI_HOST || 'http://127.0.0.1',
    TEXT_GENERATION_WEBUI_PORT: process.env.TEXT_GENERATION_WEBUI_PORT || '5000'
  };

  const llmHostPrompt = await inquirer.prompt({
    name: 'LLM_HOST',
    type: 'list',
    message: 'Which LLM host do you want to use?',
    choices: ['OpenAI', 'Azure-OpenAI', 'ollama', 'text-generation-webui'], // Ensure all options are included
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
        name: 'OPENAI_MODEL_NAME',
        type: 'list',
        message: 'Which model do you want to use?',
        choices: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
        default: 'gpt-4o',
      }]
    } else if (llmHost === 'Azure-OpenAI') {
      console.log("Configure the Azure OpenAI endpoint, deployment, and API key.")
      return [{
        name: 'AZURE_OPENAI_ENDPOINT',
        type: 'input',
        message: 'Enter your Azure OpenAI endpoint URL:',
        default: currentConfig.AZURE_OPENAI_ENDPOINT,
      }, {
        name: 'AZURE_OPENAI_DEPLOYMENT_NAME',
        type: 'input',
        message: 'Enter your Azure OpenAI deployment name:',
        default: currentConfig.AZURE_OPENAI_DEPLOYMENT_NAME,
      }, {
        name: 'AZURE_OPENAI_API_KEY',
        type: 'input',
        message: 'Enter your Azure OpenAI API key:',
        default: currentConfig.AZURE_OPENAI_API_KEY,
      }]
    } else if (llmHost === 'ollama') {
      console.log("Configure the ollama URL and model to use.")
      return [{
        name: 'OLLAMA_MODEL_NAME',
        type: 'input',
        message: 'Enter the model name:',
        default: 'llama3',
      }, {
        name: 'OLLAMA_HOST',
        type: 'input',
        message: 'Enter the ollama URL:',
        default: currentConfig.OLLAMA_HOST,
      }]
    } else if (llmHost === 'cmdh') {
      console.log("Configure the cmdh-ai API key and model to use.")
      return [{
        name: 'CMDH_MODEL_NAME', // Update to use distinct model name variable
        type: 'input',
        message: 'Enter the model name:',
        default: 'llama3', // Use the host-specific default
      }, {
        name: 'CMDH_API_KEY',
        type: 'input',
        message: 'Enter your cmdh API key:',
        default: currentConfig.CMDH_API_KEY,
      }];
    } else if (llmHost === 'text-generation-webui') {
      console.log("Configure the text-generation-webui host and port.")
      return [{ // No model name for text-generation-webui, configure host and port only
        name: 'TEXT_GENERATION_WEBUI_HOST',
        type: 'input',
        message: 'Enter the text-generation-webui URL:',
        default: currentConfig.TEXT_GENERATION_WEBUI_HOST,
      }, {
        name: 'TEXT_GENERATION_WEBUI_PORT',
        type: 'input',
        message: 'Enter the text-generation-webui port:',
        default: currentConfig.TEXT_GENERATION_WEBUI_PORT,
      }];
    }
  }

  const questions = await getQuestions();

  if (!questions) {
    throw 'Could not get questions';
  }

  const answers = await inquirer.prompt(questions);

  // Modify this part to handle distinct model names
  const modelEnvName = `${llmHost.toUpperCase()}_MODEL_NAME`; // Construct the environment variable name for the model
  const combined = { ...currentConfig, [modelEnvName]: answers.MODEL_NAME, ...answers };

  // Update the configuration string to include distinct model names
  let newConfig = [
    `OPENAI_API_KEY=${combined.OPENAI_API_KEY}`,
    `OPENAI_MODEL_NAME=${combined.OPENAI_MODEL_NAME || ''}`,
    `AZURE_OPENAI_API_KEY=${combined.AZURE_OPENAI_API_KEY || ''}`,
    `AZURE_OPENAI_ENDPOINT=${combined.AZURE_OPENAI_ENDPOINT || ''}`,
    `AZURE_OPENAI_DEPLOYMENT_NAME=${combined.AZURE_OPENAI_DEPLOYMENT_NAME || ''}`,
    `OLLAMA_MODEL_NAME=${combined.OLLAMA_MODEL_NAME || ''}`,
    `CMDH_MODEL_NAME=${combined.CMDH_MODEL_NAME || ''}`,
    `TEXT_GENERATION_WEBUI_MODEL_NAME=${combined.TEXT_GENERATION_WEBUI_MODEL_NAME || ''}`,
    `OLLAMA_HOST=${combined.OLLAMA_HOST}`,
    `CMDH_API_KEY=${combined.CMDH_API_KEY}`,
    `CMDH_API_BASE=${combined.CMDH_API_BASE}`,
    `TEXT_GENERATION_WEBUI_HOST=${combined.TEXT_GENERATION_WEBUI_HOST}`,
    `TEXT_GENERATION_WEBUI_PORT=${combined.TEXT_GENERATION_WEBUI_PORT}`,
    `LLM_HOST=${llmHost}`
  ].join('\n');

  fs.writeFileSync('.env', newConfig);
  console.log('Configuration updated.');
}
