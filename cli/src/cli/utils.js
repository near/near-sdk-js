import childProcess from "child_process";
import { promisify } from "util";
const exec = promisify(childProcess.exec);
export async function executeCommand(command, silent = false) {
    if (!silent) {
        console.log(command);
    }
    try {
        const { stdout, stderr } = await exec(command);
        if (stderr && !silent) {
            console.error(stderr);
        }
        if (!silent) {
            console.log(stdout);
        }
        return stdout.trim();
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}
