export declare function executeCommand(command: string, verbose?: boolean): Promise<string>;
export declare function download(url: string, verbose?: boolean): Promise<void>;
/**
 * Validates the contract by checking that all parameters are initialized in the constructor. Works only for contracts written in TypeScript.
 *
 * @param contractPath - Path to the contract.
 * @param verbose - Whether to print verbose output.
 **/
export declare function validateContract(contractPath: string, verbose?: boolean): Promise<boolean>;
export declare function parseNamedArgs(args: any): any;
export declare function logTotalGas(r: any): void;
export declare function formatGas(gas: any): string;
