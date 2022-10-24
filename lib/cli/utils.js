import childProcess from "child_process";
import { promisify } from "util";
import signal from "signale";
const { Signale } = signal;
const exec = promisify(childProcess.exec);
export async function executeCommand(command, verbose = false) {
    const signale = new Signale({ scope: "exec", interactive: !verbose });
    if (verbose) {
        signale.info(`Running command: ${command}`);
    }
    try {
        const { stdout, stderr } = await exec(command);
        if (stderr && verbose) {
            signale.error(stderr);
        }
        if (verbose) {
            signale.info(`Command output: ${stdout}`);
        }
        return stdout.trim();
    }
    catch (error) {
        signale.error(error);
        process.exit(1);
    }
}
export async function download(url, verbose = false) {
    await executeCommand(`curl -LOf ${url}`, verbose);
}
