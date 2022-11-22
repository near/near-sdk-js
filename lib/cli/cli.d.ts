#!/usr/bin/env node
export declare function validateCom(source: string, { verbose }: {
    verbose: boolean;
}): Promise<void>;
export declare function checkTypescriptCom(source: string, { verbose }: {
    verbose: boolean;
}): Promise<void>;
export declare function createJsFileWithRullupCom(source: string, target: string, { verbose }: {
    verbose: boolean;
}): Promise<void>;
export declare function transpileJsAndBuildWasmCom(target: string, { verbose }: {
    verbose: boolean;
}): Promise<void>;
export declare function buildCom(source: string, target: string, { verbose }: {
    verbose: boolean;
}): Promise<void>;
