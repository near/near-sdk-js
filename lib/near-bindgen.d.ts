declare type EmptyParameterObject = Record<never, never>;
declare type DecoratorFunction = <AnyFunction extends (...args: any) => any>(target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<AnyFunction>) => void;
/**
 * Tells the SDK to use this function as the initialization function of the contract.
 *
 * @param _empty - An empty object.
 */
export declare function initialize(_empty: EmptyParameterObject): DecoratorFunction;
/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
export declare function view(_empty: EmptyParameterObject): DecoratorFunction;
/**
 * Tells the SDK to expose this function as a call function.
 * Adds the neccessary checks if the function is private or payable.
 *
 * @param options - Options to configure the function behaviour.
 * @param options.privateFunction - Whether the function can be called by other contracts.
 * @param options.payableFunction - Whether the function can accept an attached deposit.
 * @returns
 */
export declare function call(options: {
    privateFunction?: boolean;
    payableFunction?: boolean;
}): DecoratorFunction;
/**
 * Extends this class with the methods needed to make the contract storable/serializable and readable/deserializable to and from the blockchain.
 * Also tells the SDK to capture and expose all view, call and initialize functions.
 * Tells the SDK whether the contract requires initialization and whether to use a custom serialization/deserialization function when storing/reading the state.
 *
 * @param options - Options to configure the contract behaviour.
 * @param options.requireInit - Whether the contract requires initialization.
 * @param options.serializer - Custom serializer function to use for storing the contract state.
 * @param options.deserializer - Custom deserializer function to use for reading the contract state.
 */
export declare function NearBindgen(options: {
    requireInit?: boolean;
    serializer?(value: unknown): string;
    deserializer?(value: string): unknown;
}): any;
declare module "./" {
    /**
     * A macro that reads the WASM code from the specified path at compile time.
     *
     * @param pathToWasm - The path to the WASM file to read code from.
     */
    function includeBytes(pathToWasm: string): string;
}
export {};
