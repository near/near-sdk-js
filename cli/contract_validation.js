import { Project } from "ts-morph";
import path from "path";
import chalk from "chalk";

const validateContract = async (contractPath) => {
  const project = new Project();
  project.addSourceFilesAtPaths(contractPath);
  const baseFileName = path.parse(contractPath).base;
  const contractClassFile = project.getSourceFile(contractPath);
  const contractClasses = contractClassFile.getClasses(baseFileName);
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
      // reson: examples/clean-state.js
      if (!hasConstructor && propertiesToBeInited.length === 0) {
        return true;
      }
      if (!hasConstructor && propertiesToBeInited.length > 0) {
        console.log(
          chalk.redBright(
            `Ops, constructor isnt initialized, after initialization include ${propertiesToBeInited
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
};

export default validateContract;
