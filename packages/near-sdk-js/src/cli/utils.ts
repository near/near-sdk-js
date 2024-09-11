import childProcess from "child_process";
import { promisify } from "util";
import signal from "signale";
import { Project } from "ts-morph";
import chalk from "chalk";

const { Signale } = signal;

const exec = promisify(childProcess.exec);

export async function executeCommand(
  command: string,
  verbose = false
): Promise<string> {
  const signale = new Signale({ scope: "exec", interactive: !verbose });

  if (verbose) {
    signale.info(`Running command: ${command}`);
  }

  let stdout,
    stderr,
    code = 0;
  try {
    ({ stdout, stderr } = await exec(command));
  } catch (error) {
    ({ stdout, stderr, code } = error);
  }
  if (code != 0) {
    signale.error(`Command failed: ${command}`);

    const failDueToNameConflict = stderr.match(/conflicting types for '([a-zA-Z0-9_]+)'/);
    if (failDueToNameConflict && failDueToNameConflict.length > 1) {
      signale.error(`'${failDueToNameConflict[1]}' is a reserved word, please use another name for contract method"`);
    }
  }
  if (stderr && verbose) {
    signale.error(`Command stderr: ${stderr}`);
  }
  if (verbose) {
    signale.info(`Command stdout: ${stdout}`);
  }
  if (code != 0) {
    process.exit(1);
  }
  return stdout.trim();
}

export async function download(url: string, verbose = false) {
  await executeCommand(`curl -LOf ${url}`, verbose);
}

const UNINITIALIZED_PARAMETERS_ERROR =
  "All parameters must be initialized in the constructor. Uninitialized parameters:";

/**
 * Validates the contract by checking that all parameters are initialized in the constructor. Works only for contracts written in TypeScript.
 *
 * @param contractPath - Path to the contract.
 * @param verbose - Whether to print verbose output.
 **/
export async function validateContract(
  contractPath: string,
  verbose = false
): Promise<boolean> {
  const signale = new Signale({ scope: "validate-contract" });

  const project = new Project();
  project.addSourceFilesAtPaths(contractPath);

  const sourceFile = project.getSourceFile(contractPath);
  const classDeclarations = sourceFile.getClasses();

  for (const classDeclaration of classDeclarations) {
    const classStructure = classDeclaration.getStructure();
    const { decorators, properties, name } = classStructure;
    const hasNearBindgen = decorators.some(
      ({ name }) => name === "NearBindgen"
    );

    if (hasNearBindgen) {
      if (verbose) {
        signale.info(`Validating ${name} class...`);
      }

      const constructors = classDeclaration.getConstructors();
      const hasConstructor = constructors.length > 0;
      const propertiesToBeInited = properties.filter(
        ({ initializer }) => !initializer
      );

      if (!hasConstructor && propertiesToBeInited.length === 0) {
        return true;
      }

      if (!hasConstructor && propertiesToBeInited.length > 0) {
        signale.error(
          chalk.redBright(
            `${UNINITIALIZED_PARAMETERS_ERROR} ${propertiesToBeInited
              .map(({ name }) => name)
              .join(", ")}`
          )
        );
        return false;
      }

      const [constructor] = constructors;
      const constructorContent = constructor.getText();

      if (verbose) {
        signale.info("Checking for non initialized properties...");
      }

      const nonInitedProperties = propertiesToBeInited.reduce(
        (properties, { name }) => {
          if (constructorContent.includes(`this.${name}`)) {
            return properties;
          }

          return [...properties, name];
        },
        [] as string[]
      );

      if (nonInitedProperties.length > 0) {
        signale.error(
          chalk.redBright(
            `${UNINITIALIZED_PARAMETERS_ERROR} ${nonInitedProperties.join(
              ", "
            )}`
          )
        );
        return false;
      }
    }
  }

  return true;
}

export function parseNamedArgs(args) {
  return args.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key] = value;
    return acc;
  }, {});
}

export function logTotalGas(r) {
  console.log(
    'Total gas used: ',
    formatGas(
      r.result.transaction_outcome.outcome.gas_burnt +
      r.result.receipts_outcome[0].outcome.gas_burnt +
      r.result.receipts_outcome[1].outcome.gas_burnt
    ),
    '\n'
  );
}

export function formatGas(gas) {
  if (gas < 10 ** 12) {
    const tGas = gas / 10 ** 12;
    const roundTGas = Math.round(tGas * 100000) / 100000;
    return roundTGas + "T";
  }
  const tGas = gas / 10 ** 12;
  const roundTGas = Math.round(tGas * 100) / 100;
  return roundTGas + "T";
}
