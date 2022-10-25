export declare function executeCommand(command: string, verbose?: boolean): Promise<string>;
export declare function download(url: string, verbose?: boolean): Promise<void>;
/**
 * Validates the contract by checking that all parameters are initialized in the constructor. Works only for contracts written in TypeScript.
 * @param contractPath Path to the contract.
 **/
export declare function validateContract(contractPath: string): Promise<boolean>;
