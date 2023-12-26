import { run } from './src/run.mjs';

// Forward the command line arguments to this function
await run(process.argv.slice(2));
