import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as readline from 'readline';
import { startChat } from './api.mjs';
import { getSystemInfo } from './system.mjs';
import clipboardy from 'clipboardy';
import chalk from 'chalk';
import inquirer from 'inquirer';

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

  const promptArg = process.argv[2];

  if (promptArg) {
    await handlePrompt(promptArg);
  } else {
    const input = await questionAsync('Enter your command request prompt: ');
    await handlePrompt(input);
  }

  async function handlePrompt(input) {
    const systemMessageTemplate = await readFile(path.resolve(__dirname, '../system.prompt'), 'utf-8');
    const systemInfo = getSystemInfo();
    const { distro, arch } = systemInfo;
    const systemMessage = systemMessageTemplate.replace('{distro}', distro).replace('{arch}', arch);

    const response = await startChat(input, { systemMessage });
    const { setupCommands, runCommand, nonInteractive, assistantMessage } = parseResponse(response.text);

    if (setupCommands.length > 0) {
      console.log(chalk.green('setup commands:'), setupCommands);
    }
    console.log(chalk.green('main command:'), chalk.yellow(runCommand));
    console.log(chalk.cyan('assistant message:'), assistantMessage);

    let choice = await getMenuChoice(nonInteractive, setupCommands);

    if (choice.trim() === '') {
      choice = defaultOption;
    }
    switch (choice.toLowerCase()) {
      case 'a': // run all
        await setupAndRunCommands(setupCommands, runCommand);
        break;
      case 'm': // main command
        await runCommands([runCommand]);
        break;
      case 'c':
        copyCommand(runCommand);
        break;
      case 's': // Run setup commands
        await runCommands(setupCommands);
        break;
      case 'q':
        console.log('👋');
        break;
      default:
        if (defaultOption === 'a') {
          await setupAndRunCommands(setupCommands, runCommand);
        } else if (defaultOption === 'm') {
          await runCommands([runCommand]);
        } else if (defaultOption === 'c') {
          await copyCommand(runCommand);
        }
        break;
    }
  }
}

async function getMenuChoice(nonInteractive, setupCommands) {
  const options = [
    {
      name: 'Run main command (M)',
      value: 'm',
    },
    {
      name: 'Quit (Q)',
      value: 'q',
    },
  ];

  const defaultOption = !nonInteractive ? 'c' : (
    nonInteractive && setupCommands.length > 0 ? 'a' : 'm'
  );

  if (setupCommands.length > 0) {
    options.unshift({ name: 'Run setup commands (S)', value: 's' })
    options.unshift({ name: 'Run all commands (A)', value: 'a' });
  }
  if (!nonInteractive) {
    const spliceIndex = options.findIndex(option => option.value === 'm')
    options.splice(spliceIndex, 0, {
      name: 'Copy command to clipboard (C)',
      value: 'c',
    });
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Choose an option:',
      choices: options,
      default: defaultOption,
    },
  ]);

  return answers.choice;
}

function parseResponse(response) {
  const regex = /setup commands:\s*((?:\d+\.\s*.+?\n)*?)\nmain command:\s*(.+)\n\nrunnable in non-interactive shell:\s*(.+)\n\nassistant message:\s*(.+)/;
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

function writeInstructions(setupCommands, runCommand, assistantMessage) {
  const instructions = `setup commands:\n${setupCommands.join('\n')}\n\nmain command: ${runCommand}\n\nassistant message: ${assistantMessage}\n`;
  const filePath = path.join(__dirname, 'instructions.txt');
  fs.writeFileSync(filePath, instructions);
  console.log(`Instructions saved to: ${filePath}`);
}

await main();