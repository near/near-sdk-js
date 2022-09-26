import { exec as exec_ } from 'child_process'
import { promisify } from 'util'

const exec = promisify(exec_)

export async function executeCommand(command, silent = false) {
  console.log(command)
  const { error, stdout, stderr } = await exec(command)

  if (error) {
    console.log(error)
    process.exit(1)
  }

  if (stderr && !silent) {
    console.error(stderr)
  }

  if (silent) {
    return stdout.trim()
  }

  console.log(stdout)
}
