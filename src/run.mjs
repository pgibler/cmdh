import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as readline from 'readline';
import { startChat } from './api.mjs';
import { getSystemInfo } from './system.mjs';
import clipboardy from 'clipboardy';
import chalk from 'chalk';
import prompt from './inquirer-interactive-list-prompt/index.mjs';
import configure from './configure.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const readFile = promisify(fs.readFile);

async function main() {
  async function questionAsync(prompt) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
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
    const { setupCommands, runCommand, nonInteractive, assistantMessage } = parseResponse(response.text);

    if (setupCommands.length > 0) {
      console.log(chalk.green('setup commands:'), `[ ${setupCommands.map(command => chalk.blue(command)).join(', ')} ]`);
    }
    console.log(chalk.green('desire command:'), chalk.yellow(runCommand));
    console.log(chalk.cyan('assistant message:'), assistantMessage);

    let choice = await getPromptChoice(nonInteractive, setupCommands);

    if (choice.trim() === '') {
      choice = defaultOption;
    }
    switch (choice.toLowerCase()) {
      case 'all': // run all
        await setupAndRunCommands(setupCommands, runCommand);
        break;
      case 'desire': // desire command
        await runCommands([runCommand]);
        break;
      case 'copy':
        copyCommand(runCommand);
        break;
      case 'setup': // Run setup commands
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
      name: 'Run desire command (d)',
      value: 'desire',
      key: 'd',
    },
    {
      name: 'Quit (q)',
      value: 'quit',
      key: 'q',
    },
  ];

  const defaultOption = !nonInteractive ? 'copy' : (
    nonInteractive && setupCommands.length > 0 ? 'all' : 'desire'
  );

  if (setupCommands.length > 0) {
    options.unshift({ name: 'Run setup commands (s)', value: 'setup', key: 's' })
    options.unshift({ name: 'Run all commands (a)', value: 'all', key: 'a' });
  }
  if (!nonInteractive) {
    const spliceIndex = options.findIndex(option => option.value === 'desire') + 1
    const copyChoice = { name: 'Copy command to clipboard (c)', value: 'copy', key: 'c', };
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
  const regex = /setup commands:\s*((?:\d+\.\s*.+?\n)*?)\ndesire command:\s*(.+)\n\nrunnable in non-interactive shell:\s*(.+)\n\nassistant message:\s*(.+)/;
  const match = response.match(regex);

  if (!match) {
    throw new Error('Invalid response format');
  }

  const setupCommands = match[1]
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.replace(/^\d+\.\s*/, ''));
  const runCommand = match[2];
  const nonInteractive = match[3].trim().toLowerCase() === 'yes';
  const assistantMessage = match[4];

  return { setupCommands, runCommand, nonInteractive, assistantMessage };
}

import { spawn } from 'child_process';

async function setupAndRunCommands(setupCommands, runCommand) {
  await runCommands(setupCommands);
  await runCommands([runCommand]);
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

function copyCommand(command) {
  clipboardy.writeSync(command);
  console.log('Command copied to clipboard');
}

await main();