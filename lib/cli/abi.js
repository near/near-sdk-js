import ts from "typescript";
import * as abi from "near-abi";
import * as TJS from "near-typescript-json-schema";
import * as fs from "fs";
import { LIB_VERSION } from "../version.js";
function parseMetadata(packageJsonPath) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let authors = [];
    if (packageJson["author"])
        authors.push(packageJson["author"]);
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
function getProgramFromFiles(files, jsonCompilerOptions, basePath = "./") {
    const { options, errors } = ts.convertCompilerOptionsFromJson(jsonCompilerOptions, basePath);
    if (errors.length > 0) {
        errors.forEach((error) => {
            console.log(error.messageText);
        });
        throw Error("Invalid compiler options");
    }
    return ts.createProgram(files, options);
}
function validateNearClass(node) {
    if (node.kind !== ts.SyntaxKind.ClassDeclaration) {
        throw Error("Expected NEAR function to be inside of a class");
    }
    const classDeclaration = node;
    const decorators = classDeclaration.decorators || [];
    const containsNearBindgen = decorators.some((decorator) => {
        if (decorator.expression.kind !== ts.SyntaxKind.CallExpression)
            return false;
        const decoratorExpression = decorator.expression;
        if (decoratorExpression.expression.kind !== ts.SyntaxKind.Identifier)
            return false;
        const decoratorIdentifier = decoratorExpression.expression;
        const decoratorName = decoratorIdentifier.text;
        return decoratorName === "NearBindgen";
    });
    if (!containsNearBindgen) {
        throw Error("Expected NEAR function to be inside of a class decorated with @NearBindgen");
    }
}
export function runAbiCompilerPlugin(tsFile, packageJsonPath, tsConfigJsonPath) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigJsonPath, 'utf8'));
    const program = getProgramFromFiles([tsFile], tsConfig["compilerOptions"]);
    const typeChecker = program.getTypeChecker();
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
        diagnostics.forEach((diagnostic) => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.error(message);
            }
        });
        throw Error("Failed to compile the contract");
    }
    const generator = TJS.buildGenerator(program);
    const abiFunctions = [];
    program.getSourceFiles().forEach((sourceFile, _sourceFileIdx) => {
        function inspect(node, tc) {
            if (node.kind === ts.SyntaxKind.MethodDeclaration) {
                const methodDeclaration = node;
                const decorators = methodDeclaration.decorators || [];
                let isCall = false;
                let isView = false;
                let isInit = false;
                const abiModifiers = [];
                decorators.forEach((decorator) => {
                    if (decorator.expression.kind !== ts.SyntaxKind.CallExpression)
                        return;
                    const decoratorExpression = decorator.expression;
                    if (decoratorExpression.expression.kind !== ts.SyntaxKind.Identifier)
                        return;
                    const decoratorIdentifier = decoratorExpression.expression;
                    const decoratorName = decoratorIdentifier.text;
                    if (decoratorName === "call") {
                        isCall = true;
                        decoratorExpression.arguments.forEach((arg) => {
                            if (arg.kind !== ts.SyntaxKind.ObjectLiteralExpression)
                                return;
                            const objLiteral = arg;
                            objLiteral.properties.forEach((prop) => {
                                const propName = prop.name.text;
                                if (propName === "privateFunction") {
                                    if (prop.kind !== ts.SyntaxKind.PropertyAssignment)
                                        return;
                                    const propAssignment = prop;
                                    const init = propAssignment.initializer;
                                    if (init.kind === ts.SyntaxKind.TrueKeyword) {
                                        abiModifiers.push(abi.AbiFunctionModifier.Private);
                                    }
                                    else if (init.kind === ts.SyntaxKind.FalseKeyword) {
                                        // Do nothing
                                    }
                                    else {
                                        throw Error("Unexpected initializer for `privateFunction`: kind " + init.kind);
                                    }
                                }
                                if (propName === "payableFunction") {
                                    if (prop.kind !== ts.SyntaxKind.PropertyAssignment)
                                        return;
                                    const propAssignment = prop;
                                    const init = propAssignment.initializer;
                                    if (init.kind === ts.SyntaxKind.TrueKeyword) {
                                        abiModifiers.push(abi.AbiFunctionModifier.Payable);
                                    }
                                    else if (init.kind === ts.SyntaxKind.FalseKeyword) {
                                        // Do nothing
                                    }
                                    else {
                                        throw Error("Unexpected initializer for `publicFunction`: kind " + init.kind);
                                    }
                                }
                            });
                        });
                    }
                    if (decoratorName === "view")
                        isView = true;
                    if (decoratorName === "initialize")
                        isInit = true;
                });
                const nearDecoratorsCount = [isCall, isView, isInit].filter((b) => b).length;
                if (nearDecoratorsCount > 1) {
                    throw Error("NEAR function cannot be init, call and view at the same time");
                }
                if (nearDecoratorsCount === 0) {
                    return;
                }
                validateNearClass(node.parent);
                let abiParams = [];
                if (methodDeclaration.parameters.length > 1) {
                    throw Error("Expected NEAR function to have a single object parameter, but got " + methodDeclaration.parameters.length);
                }
                else if (methodDeclaration.parameters.length === 1) {
                    const jsonObjectParameter = methodDeclaration.parameters[0];
                    if (jsonObjectParameter.name.kind !== ts.SyntaxKind.ObjectBindingPattern) {
                        throw Error("Expected NEAR function to have a single object binding parameter");
                    }
                    const objectBinding = jsonObjectParameter.name;
                    abiParams = objectBinding.elements.map((parameter) => {
                        const nodeType = tc.getTypeAtLocation(parameter);
                        const schema = generator.getTypeDefinition(nodeType, true);
                        const abiParameter = {
                            name: parameter.name.text,
                            type_schema: schema
                        };
                        return abiParameter;
                    });
                }
                let abiResult = undefined;
                const returnType = methodDeclaration.type;
                if (returnType) {
                    const nodeType = tc.getTypeAtLocation(returnType);
                    const schema = generator.getTypeDefinition(nodeType, true);
                    abiResult = {
                        serialization_type: abi.AbiSerializationType.Json,
                        type_schema: schema
                    };
                }
                const abiFunction = {
                    name: methodDeclaration.name.text,
                    kind: isView ? abi.AbiFunctionKind.View : abi.AbiFunctionKind.Call,
                    modifiers: abiModifiers,
                    params: {
                        serialization_type: abi.AbiSerializationType.Json,
                        args: abiParams
                    },
                    result: abiResult
                };
                abiFunctions.push(abiFunction);
            }
            else {
                ts.forEachChild(node, (n) => inspect(n, tc));
            }
        }
        inspect(sourceFile, typeChecker);
    });
    const abiRoot = {
        schema_version: abi.SCHEMA_VERSION,
        metadata: parseMetadata(packageJsonPath),
        body: {
            functions: abiFunctions,
            root_schema: generator.getSchemaForSymbol("String", true, false)
        }
    };
    return abiRoot;
}
