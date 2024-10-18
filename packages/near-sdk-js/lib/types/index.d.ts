import * as ts from "typescript";
export * from "./account_id";
export * from "./gas";
export * from "./primitives";
export * from "./public_key";
export * from "./vm_types";
declare module "typescript" {
    interface ClassDeclaration {
        decorators?: ts.NodeArray<ts.Decorator>;
    }
    interface MethodDeclaration {
        decorators?: ts.NodeArray<ts.Decorator>;
    }
}
