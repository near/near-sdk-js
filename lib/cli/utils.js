import childProcess from "child_process";
import { promisify } from "util";
const exec = promisify(childProcess.exec);
export async function executeCommand(command, verbose = false) {
    if (verbose) {
        console.log(command);
    }
    try {
        const { stdout, stderr } = await exec(command);
        if (stderr && verbose) {
            console.error(stderr);
        }
        if (verbose) {
            console.log(stdout);
        }
        return stdout.trim();
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}
