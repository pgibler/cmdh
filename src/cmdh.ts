import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { startChat } from './api/api.js';
import { getSystemInfo } from './system.js';
import chalk from 'chalk';
import prompt from 'inquirer-interactive-list-prompt';
import inquirer from 'inquirer';
import configure from './configure.js'

const readFile = promisify(fs.readFile);

import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Forward the command line arguments to this function
  const command = process.argv.slice(2);
  await run(command);
}

main();

async function run(promptArgs: string[]) {
  if (promptArgs.length > 0) {
    if (promptArgs[0] === 'configure') {
      await configure(promptArgs[1]);
      return;
    } else {
      await handlePrompt(promptArgs[0]);
    }
  } else {
    const executionMode = await inquirer.prompt<{ EXECUTION_MODE: string }>({
      name: 'EXECUTION_MODE',
      type: 'list',
      message: 'Select ',
      choices: ['Input a prompt', 'Manage configuration'],
    });

    const executionModeSelection = executionMode.EXECUTION_MODE;

    if (executionModeSelection === 'Input a prompt') {
      async function questionAsync(message: string) {
        const answers = await inquirer.prompt<{ COMMAND_REQUEST: string }>({
          name: 'COMMAND_REQUEST',
          type: 'input',
          message,
          default: 'Output available hard drive space',
        });

        return answers.COMMAND_REQUEST;
      }
      const input = await questionAsync('Enter a prompt to request a command: ');
      await handlePrompt(input);
    } else if (executionModeSelection === 'Manage configuration') {
      const configurationMode = await inquirer.prompt<{ CONFIGURATION_MODE: string }>({
        name: 'CONFIGURATION_MODE',
        type: 'list',
        message: 'Select ',
        choices: ['Modify', 'Show'],
      });

      const configurationModeSelection = configurationMode.CONFIGURATION_MODE;
      if (configurationModeSelection === 'Modify') {
        await configure('')
      } else if (configurationModeSelection === 'Show') {
        await configure('show')
      }
    }
  }

  async function handlePrompt(input: string) {
    async function getSystemMessage() {
      const dirname = path.dirname(new URL(import.meta.url).pathname)
      const systemMessageTemplate = await readFile(path.resolve(dirname, '../../system.prompt'), 'utf-8');
      const systemInfo = await getSystemInfo();
      if(!systemInfo) {
        throw "Could not retrieve system info";
      }
      const { distro, arch } = systemInfo;
      return systemMessageTemplate.replace('{distro}', distro).replace('{arch}', arch);
    }

    const systemMessage = await getSystemMessage();

    const response = await startChat(input, systemMessage);
    if(!response) {
      throw 'Could not get response'
    }
    const parsedResponse = parseResponse(response);
    if(!parsedResponse) {
      throw 'Could not parse response.'
    }
    const { setupCommands, desiredCommand, nonInteractive, safetyLevel, assistantMessage } = parsedResponse;

    if (setupCommands.length > 0) {
      console.log(chalk.green('setup commands:'), `[ ${setupCommands.map((command: string) => chalk.blue(command)).join(', ')} ]`);
    }
    console.log(chalk.green('desired command:'), chalk.yellow(desiredCommand));
    console.log(chalk.cyan('assistant message:'), assistantMessage);

    if (safetyLevel === 'overwrite') {
      console.log(chalk.red('WARNING: This command will overwrite files on your system.'))
    } else if (safetyLevel === 'delete') {
      console.log(chalk.redBright('WARNING: This command will delete files on your system.'))
    }

    await promptAndExecute(setupCommands, desiredCommand, nonInteractive);
  }
}

async function promptAndExecute(setupCommands: string[], desiredCommand: string, nonInteractive: boolean) {
  let choice = await getPromptChoice(nonInteractive, setupCommands);

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

async function getPromptChoice(nonInteractive: boolean, setupCommands: string[]): Promise<string> {
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

import { spawn } from 'child_process';
import { parseResponse } from './parseResponse.js';

async function runAllCommands(setupCommands: string[], desiredCommand: string) {
  await runCommands(setupCommands);
  await runCommands([desiredCommand]);
}

async function runCommands(commands: string[]) {
  for (const command of commands) {
    // Run each command
    console.log(`Running: ${command}`);
    try {
      await runCommandWithSpawn(command);
    } catch (error: any) {
      console.error(`Error executing command: ${error.message}`);
    }
  }
}

function runCommandWithSpawn(command: string) {
  return new Promise((resolve, reject) => {
    const spawnedCommand = spawn(command, { stdio: 'inherit', shell: true });

    spawnedCommand.on('error', (error) => {
      reject(error);
    });

    spawnedCommand.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}

async function copyCommand(command: string, showImportErrorMessage = false) {
  try {
    // Dynamically import clipboardy
    const clipboardy = (await import('clipboardy')).default;

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

