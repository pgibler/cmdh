import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getSystemInfo() {
  try {
    const { stdout: distroOutput } = await execAsync(`grep DISTRIB_DESCRIPTION /etc/*-release | cut -d '=' -f 2 | sed 's/"//g'`);
    const { stdout: archOutput } = await execAsync('uname -m');

    const distro = distroOutput.trim();
    const arch = archOutput.trim();

    return {
      distro,
      arch,
    };
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
  }
}
