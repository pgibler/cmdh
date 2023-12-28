import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { startChat } from './api/api.mjs';
import { getSystemInfo } from './system.mjs';
import chalk from 'chalk';
import prompt from 'inquirer-interactive-list-prompt';
import inquirer from 'inquirer';
import configure from './configure.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const readFile = promisify(fs.readFile);

export async function run() {
  async function questionAsync(message) {
    const answers = await inquirer.prompt({
      name: 'COMMAND_REQUEST',
      type: 'input',
      message,
      default: 'Output current working directory',
    });

    return answers.COMMAND_REQUEST;
  }

  async function getSystemMessage() {
    const systemMessageTemplate = await readFile(path.resolve(__dirname, '../system.prompt'), 'utf-8');
    const systemInfo = getSystemInfo();
    const { distro, arch } = systemInfo;
    return systemMessageTemplate.replace('{distro}', distro).replace('{arch}', arch);
  }

  const promptArg = process.argv[2];

  if (promptArg) {
    if (promptArg.trim() === 'configure') {
      await configure();
      return;
    } else {
      await handlePrompt(promptArg);
    }
  } else {
    const input = await questionAsync('Enter your command request prompt: ');
    await handlePrompt(input);
  }

  async function handlePrompt(input) {
    const systemMessage = await getSystemMessage();

    const response = await startChat(input, systemMessage);
    const { setupCommands, desiredCommand, nonInteractive, assistantMessage } = parseResponse(response);

    if (setupCommands.length > 0) {
      console.log(chalk.green('setup commands:'), `[ ${setupCommands.map(command => chalk.blue(command)).join(', ')} ]`);
    }
    console.log(chalk.green('desired command:'), chalk.yellow(desiredCommand));
    console.log(chalk.cyan('assistant message:'), assistantMessage);

    let choice = await getPromptChoice(nonInteractive, setupCommands);

    if (choice.trim() === '') {
      choice = defaultOption;
    }
    switch (choice.toLowerCase()) {
      case 'all': // run all
        await runAllCommands(setupCommands, desiredCommand);
        break;
      case 'desired':
        await runCommands([desiredCommand]);
        break;
      case 'emit':
        copyCommand(desiredCommand);
        break;
      case 'setup':
        await runCommands(setupCommands);
        break;
      case 'quit':
        console.log('👋');
        break;
      default:
        console.log('No option selected. Exiting program.')
        break;
    }
  }
}

async function getPromptChoice(nonInteractive, setupCommands) {
  const options = [
    {
      name: 'Run desired command',
      value: 'desired',
      key: 'd',
    },
    {
      name: 'Quit',
      value: 'quit',
      key: 'q',
    },
  ];

  const defaultOption = !nonInteractive ? 'copy' : (
    nonInteractive && setupCommands.length > 0 ? 'all' : 'desired'
  );

  if (setupCommands.length > 0) {
    options.unshift({ name: 'Run setup commands', value: 'setup', key: 's' })
    options.unshift({ name: 'Run all commands', value: 'all', key: 'a' });
  }
  if (!nonInteractive) {
    const spliceIndex = options.findIndex(option => option.value === 'desired') + 1
    const copyChoice = { name: 'Copy command to clipboard', value: 'copy', key: 'c', };
    options.splice(spliceIndex, 0, copyChoice);
  }

  const answer = await prompt({
    message: 'Choose an option:',
    choices: options,
    default: defaultOption,
  });

  return answer;
}

function parseResponse(response) {
  const regex = /setup commands:\s*((?:\d+\.\s*.+?\n)*?)\ndesired command:\s*(.+)\n\nrunnable in non-interactive shell:\s*(.+)\n\nassistant message:\s*(.+)/;
  const match = response.match(regex);

  if (!match) {
    throw new Error('Invalid response format');
  }

  const setupCommands = match[1]
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.replace(/^\d+\.\s*/, ''));
  const desiredCommand = match[2];
  const nonInteractive = match[3].trim().toLowerCase() === 'yes';
  const assistantMessage = match[4];

  return { setupCommands, desiredCommand, nonInteractive, assistantMessage };
}

import { spawn } from 'child_process';

async function runAllCommands(setupCommands, desiredCommand) {
  await runCommands(setupCommands);
  await runCommands([desiredCommand]);
}

async function runCommands(commands) {
  for (const command of commands) {
    // Run each command
    console.log(`Running: ${command}`);
    try {
      await runCommandWithSpawn(command);
    } catch (error) {
      console.error(`Error executing command: ${error.message}`);
    }
  }
}

function runCommandWithSpawn(command) {
  return new Promise((resolve, reject) => {
    const spawnedCommand = spawn(command, { stdio: 'inherit', shell: true });

    spawnedCommand.on('error', (error) => {
      reject(error);
    });

    spawnedCommand.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}

async function copyCommand(command, showImportErrorMessage = false) {
  try {
    // Dynamically import clipboardy
    const clipboardy = await import('clipboardy');

    // If import succeeds, use clipboardy to copy the command
    clipboardy.writeSync(command);
    console.log('Command copied to clipboard');
  } catch (error) {
    // Fallback to logging the command if import or execution fails
    if (showImportErrorMessage) {
      console.log('Failed to copy command using clipboardy. Please manually copy the following command:');
    }
    console.log(command);
  }
}

