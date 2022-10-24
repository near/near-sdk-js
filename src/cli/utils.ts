import childProcess from "child_process";
import { promisify } from "util";
import signal from "signale"
import { Project } from "ts-morph";
import chalk from "chalk";

const {Signale} = signal;

const exec = promisify(childProcess.exec);

export async function executeCommand(
  command: string,
  verbose = false
): Promise<string> {
  const signale = new Signale({scope: "exec", interactive: !verbose})

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
  } catch (error) {
    signale.error(error);
    process.exit(1);
  }
}

export async function download(url: string, verbose = false) {
  await executeCommand(`curl -LOf ${url}`, verbose);
}

export async function validateContract(contractPath: string): Promise<boolean> {
  const project = new Project();
  project.addSourceFilesAtPaths(contractPath);
  const contractClassFile = project.getSourceFile(contractPath);
  const contractClasses = contractClassFile.getClasses();
  for (const contractClass of contractClasses) {
    const classStructure = contractClass.getStructure();
    const { decorators, properties } = classStructure;
    const hasBindgen = decorators.find(
      (decorator) => decorator.name === "NearBindgen"
    );
    if (hasBindgen) {
      const constructors = contractClass.getConstructors();
      const hasConstructor = constructors.length > 0;
      const propertiesToBeInited = properties.filter((p) => !p.initializer);
      if (!hasConstructor && propertiesToBeInited.length === 0) {
        return true;
      }
      if (!hasConstructor && propertiesToBeInited.length > 0) {
        console.log(
          chalk.redBright(
            `Ops, constructor is not initialized, after initialization include ${propertiesToBeInited
              .map((p) => p.name)
              .join(", ")} in constructor`
          )
        );
        process.exit(2);
      }
      const constructor = constructors[0];
      const constructorContent = constructor.getText();
      const nonInitedProperties = [];
      for (const property of propertiesToBeInited) {
        if (!constructorContent.includes(`this.${property.name} =`)) {
          nonInitedProperties.push(property.name);
        }
      }
      if (nonInitedProperties.length > 0) {
        console.log(
          chalk.redBright(
            `Ops, please initialise ${nonInitedProperties.join(
              ", "
            )} in constructor`
          )
        );
        process.exit(2);
      }
    }
  }
  return true;
}
