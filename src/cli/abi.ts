import ts, { Decorator, NodeArray } from "typescript";
import * as abi from "near-abi";
import * as TJS from "near-typescript-json-schema";
import { JSONSchema7 } from "json-schema";
import * as fs from "fs";
import { LIB_VERSION } from "../version.js";

function parseMetadata(packageJsonPath: string): abi.AbiMetadata {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    let authors: string[] = [];
    if (packageJson["author"]) authors.push(packageJson["author"]);
    authors = authors.concat(packageJson["contributors"] || []);

    return {
        name: packageJson["name"],
        version: packageJson["version"],
        authors,
        build: {
            compiler: "tsc " + ts.version,
            builder: "near-sdk-js " + LIB_VERSION
        }
    };
}

function getProgramFromFiles(
    files: string[],
    jsonCompilerOptions = {},
    basePath = "./"
): ts.Program {
    // use built-in default options
    const compilerOptions = ts.convertCompilerOptionsFromJson(jsonCompilerOptions, basePath).options;
    const options: ts.CompilerOptions = {
        noEmit: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        allowUnusedLabels: true,
    };
    for (const k in compilerOptions) {
        // eslint-disable-next-line no-prototype-builtins
        if (compilerOptions.hasOwnProperty(k)) {
            options[k] = compilerOptions[k];
        }
    }
    return ts.createProgram(files, options);
}

export function runAbiCompilerPlugin(
    tsFile: string,
    packageJsonPath: string,
) {
    const program = getProgramFromFiles([tsFile]);
    const typeChecker = program.getTypeChecker();

    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
        diagnostics.forEach((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.error(message);
            }
        });
        return undefined;
    }

    const generator = TJS.buildGenerator(program)!;

    const abiFunctions: abi.AbiFunction[] = [];

    program.getSourceFiles().forEach((sourceFile, _sourceFileIdx) => {
        function inspect(node: ts.Node, tc: ts.TypeChecker) {
            if (
                node.kind === ts.SyntaxKind.MethodDeclaration
            ) {
                const methodDeclaration = node as ts.MethodDeclaration;
                const decorators = methodDeclaration.decorators || ([] as unknown as NodeArray<Decorator>);
                let isCall = false;
                let isView = false;
                let isInit = false;
                const abiModifiers: abi.AbiFunctionModifier[] = [];
                decorators.forEach((decorator) => {
                    if (decorator.expression.kind !== ts.SyntaxKind.CallExpression) return;
                    const decoratorExpression = decorator.expression as ts.CallExpression;
                    if (decoratorExpression.expression.kind !== ts.SyntaxKind.Identifier) return;
                    const decoratorIdentifier = decoratorExpression.expression as ts.Identifier;
                    const decoratorName = decoratorIdentifier.text;
                    if (decoratorName === "call") {
                        isCall = true;
                        decoratorExpression.arguments.forEach((arg) => {
                            if (arg.kind !== ts.SyntaxKind.ObjectLiteralExpression) return;
                            const objLiteral = arg as ts.ObjectLiteralExpression;
                            objLiteral.properties.forEach((prop) => {
                                const propName = (prop.name as any).text;
                                if (propName === "privateFunction") {
                                    if (prop.kind !== ts.SyntaxKind.PropertyAssignment) return;
                                    const propAssignment = prop as ts.PropertyAssignment;
                                    const init = propAssignment.initializer;
                                    if (init.kind === ts.SyntaxKind.TrueKeyword) {
                                        abiModifiers.push(abi.AbiFunctionModifier.Private);
                                    } else if (init.kind === ts.SyntaxKind.FalseKeyword) {
                                        // Do nothing
                                    } else {
                                        throw Error("Unexpected initializer for `privateFunction`: kind " + init.kind);
                                    }
                                }
                                if (propName === "payableFunction") {
                                    if (prop.kind !== ts.SyntaxKind.PropertyAssignment) return;
                                    const propAssignment = prop as ts.PropertyAssignment;
                                    const init = propAssignment.initializer;
                                    if (init.kind === ts.SyntaxKind.TrueKeyword) {
                                        abiModifiers.push(abi.AbiFunctionModifier.Payable);
                                    } else if (init.kind === ts.SyntaxKind.FalseKeyword) {
                                        // Do nothing
                                    } else {
                                        throw Error("Unexpected initializer for `publicFunction`: kind " + init.kind);
                                    }
                                }
                            });
                        });
                    }
                    if (decoratorName === "view") isView = true;
                    if (decoratorName === "initialize") isInit = true;
                });
                const nearDecoratorsCount = [isCall, isView, isInit].filter((b) => b).length;
                if (nearDecoratorsCount > 1) {
                    throw Error("NEAR function cannot be init, call and view at the same time");
                }
                if (nearDecoratorsCount === 0) {
                    return;
                }

                let abiParams: abi.AbiJsonParameter[] = [];
                if (methodDeclaration.parameters.length > 1) {
                    throw Error(
                        "Expected NEAR function to have a single object parameter, but got " + methodDeclaration.parameters.length
                    );
                } else if (methodDeclaration.parameters.length === 1) {
                    const jsonObjectParameter = methodDeclaration.parameters[0];
                    if (jsonObjectParameter.name.kind !== ts.SyntaxKind.ObjectBindingPattern) {
                        throw Error(
                            "Expected NEAR function to have a single object binding parameter"
                        );
                    }

                    const objectBinding = jsonObjectParameter.name as ts.ObjectBindingPattern;
                    abiParams = objectBinding.elements.map((parameter) => {
                        const nodeType = tc.getTypeAtLocation(parameter);
                        const schema = generator.getTypeDefinition(nodeType, true);
                        const abiParameter: abi.AbiJsonParameter = {
                            name: (parameter.name as any).text,
                            type_schema: schema as JSONSchema7
                        };

                        return abiParameter;
                    });
                }
                let abiResult: abi.AbiType | undefined = undefined;
                const returnType = methodDeclaration.type;
                if (returnType) {
                    const nodeType = tc.getTypeAtLocation(returnType);
                    const schema = generator.getTypeDefinition(nodeType, true);
                    abiResult = {
                        serialization_type: abi.AbiSerializationType.Json,
                        type_schema: schema
                    };
                }
                const abiFunction: abi.AbiFunction = {
                    name: (methodDeclaration.name as any).text,
                    kind: isView ? abi.AbiFunctionKind.View : abi.AbiFunctionKind.Call,
                    modifiers: abiModifiers,
                    params: {
                        serialization_type: abi.AbiSerializationType.Json,
                        args: abiParams
                    },
                    result: abiResult
                };
                abiFunctions.push(abiFunction);
            } else {
                ts.forEachChild(node, (n) => inspect(n, tc));
            }
        }
        inspect(sourceFile, typeChecker);
    });
    const abiRoot: abi.AbiRoot = {
        schema_version: abi.SCHEMA_VERSION,
        metadata: parseMetadata(packageJsonPath),
        body: {
            functions: abiFunctions,
            root_schema: generator.getSchemaForSymbol("String", true, false) as JSONSchema7
        }
    };
    return abiRoot;
}
