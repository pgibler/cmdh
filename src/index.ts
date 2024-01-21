import { run } from './run.js';

async function main() {
  // Forward the command line arguments to this function
  const command = process.argv.slice(2);
  await run(command);
}

main();