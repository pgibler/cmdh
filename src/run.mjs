import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as readline from 'readline';
import { startChat } from './api.mjs';
import { getSystemInfo } from './system.mjs';
import clipboardy from 'clipboardy';
import chalk from 'chalk';

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
    console.log(chalk.green('run command:'), chalk.yellow(runCommand));
    console.log(chalk.cyan('assistant message:'), assistantMessage);

    const defaultOption = !nonInteractive ? 'C' : (
      nonInteractive && setupCommands.length > 0 ? 'A' : 'R'
    );

    const copyText = defaultOption == 'C' ? chalk.bold('◉ Copy command to clipboard (C)') : '○ Copy command to clipboard (C)';
    const runAllText = defaultOption == 'A' && setupCommands.length > 0 ? chalk.bold('◉ Run all (A)') : '○ Run all (A)';
    const runText = defaultOption == 'R' && setupCommands.length <= 0 ? chalk.bold('◉ Run command (R)') : '○ Run command (R)';

    console.log(chalk.green('Choose an option:'));
    if (setupCommands.length > 0) {
      console.log(runAllText);
    }
    console.log(runText);
    if (!nonInteractive) {
      console.log(copyText);
    }
    if (setupCommands.length > 0) {
      console.log('○ Run setup commands (S)');
    }
    console.log('○ Quit (Q)');
    console.log(`[default: ${chalk.bold(defaultOption)}]: `);

    let choice = await questionAsync('');

    if (choice.trim() === '') {
      choice = defaultOption;
    }
    switch (choice.toLowerCase()) {
      case 'a': // run all
        await setupAndRunCommands(setupCommands, runCommand);
        break;
      case 'r': // run commands
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
        if (defaultOption === 'A') {
          await setupAndRunCommands(setupCommands, runCommand);
        } else if (defaultOption === 'R') {
          await runCommands([runCommand]);
        } else if (defaultOption === 'C') {
          await copyCommand(runCommand);
        }
        break;
    }
  }
}

function parseResponse(response) {
  const regex = /setup commands:\s*((?:\d+\.\s*.+?\n)*?)\nrun command:\s*(.+)\n\nrunnable in non-interactive shell:\s*(.+)\n\nassistant message:\s*(.+)/;
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
  const instructions = `setup commands:\n${setupCommands.join('\n')}\n\nrun command: ${runCommand}\n\nassistant message: ${assistantMessage}\n`;
  const filePath = path.join(__dirname, 'instructions.txt');
  fs.writeFileSync(filePath, instructions);
  console.log(`Instructions saved to: ${filePath}`);
}

await main();