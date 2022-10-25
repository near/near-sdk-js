import childProcess from "child_process";
import { promisify } from "util";
import signal from "signale"
import { ClassDeclaration, ClassDeclarationStructure, ConstructorDeclaration, OptionalKind, Project, PropertyDeclarationStructure, SourceFile } from "ts-morph";
import chalk from "chalk";
import signale from "signale";

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

const UNINITIALIZED_PARAMETERS_ERROR = "All parameters must be initialized in the constructor. Uninitialized parameters:";

export async function validateContract(contractPath: string): Promise<boolean> {
  const project: Project = new Project();
  project.addSourceFilesAtPaths(contractPath);
  const sourceFile: SourceFile = project.getSourceFile(contractPath);
  const classDeclarations: ClassDeclaration[] = sourceFile.getClasses();
  for (const classDeclaration of classDeclarations) {
    const classStructure: ClassDeclarationStructure = classDeclaration.getStructure();
    const { decorators, properties } = classStructure;
    const hasNearBindgen: boolean = decorators.find(
      (decorator) => decorator.name === "NearBindgen"
    ) ? true : false;
    if (hasNearBindgen) {
      const constructors: ConstructorDeclaration[] = classDeclaration.getConstructors();
      const hasConstructor = constructors.length > 0;
      const propertiesToBeInited: OptionalKind<PropertyDeclarationStructure>[] = properties.filter((p) => !p.initializer);
      if (!hasConstructor && propertiesToBeInited.length === 0) {
        return true;
      }
      if (!hasConstructor && propertiesToBeInited.length > 0) {
        signale.error(chalk.redBright(`${UNINITIALIZED_PARAMETERS_ERROR} ${propertiesToBeInited.map((p) => p.name)}`));
        process.exit(1);
      }
      const constructor: ConstructorDeclaration = constructors[0];
      const constructorContent: string = constructor.getText();
      const nonInitedProperties: string[] = [];
      for (const property of propertiesToBeInited) {
        if (!constructorContent.includes(`this.${property.name}`)) {
          nonInitedProperties.push(property.name);
        }
      }
      if (nonInitedProperties.length > 0) {
        signale.error(chalk.redBright(`${UNINITIALIZED_PARAMETERS_ERROR} ${nonInitedProperties.join(", ")}`));
        process.exit(1);
      }
    }
  }
  return true;
}
