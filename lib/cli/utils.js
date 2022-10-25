import childProcess from "child_process";
import { promisify } from "util";
import signal from "signale";
import { Project } from "ts-morph";
import chalk from "chalk";
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
const UNINITIALIZED_PARAMETERS_ERROR = "All parameters must be initialized in the constructor. Uninitialized parameters:";
export async function validateContract(contractPath) {
    const project = new Project();
    project.addSourceFilesAtPaths(contractPath);
    const sourceFile = project.getSourceFile(contractPath);
    const classDeclarations = sourceFile.getClasses();
    for (const classDeclaration of classDeclarations) {
        const classStructure = classDeclaration.getStructure();
        const { decorators, properties } = classStructure;
        const hasNearBindgen = decorators.find((decorator) => decorator.name === "NearBindgen") ? true : false;
        if (hasNearBindgen) {
            const constructors = classDeclaration.getConstructors();
            const hasConstructor = constructors.length > 0;
            const propertiesToBeInited = properties.filter((p) => !p.initializer);
            if (!hasConstructor && propertiesToBeInited.length === 0) {
                return true;
            }
            if (!hasConstructor && propertiesToBeInited.length > 0) {
                console.log(chalk.redBright(`${UNINITIALIZED_PARAMETERS_ERROR} ${propertiesToBeInited.map((p) => p.name)}`));
                process.exit(2);
            }
            const constructor = constructors[0];
            const constructorContent = constructor.getText();
            const nonInitedProperties = [];
            for (const property of propertiesToBeInited) {
                if (!constructorContent.includes(`this.${property.name}`)) {
                    nonInitedProperties.push(property.name);
                }
            }
            if (nonInitedProperties.length > 0) {
                console.log(chalk.redBright(`${UNINITIALIZED_PARAMETERS_ERROR} ${nonInitedProperties.join(", ")}`));
                process.exit(2);
            }
        }
    }
    return true;
}
