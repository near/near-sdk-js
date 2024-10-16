declare type EmptyParameterObject = Record<never, never>;
declare type DecoratorFunction = <AnyFunction extends (...args: any) => any>(target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<AnyFunction>) => void;
/**
 * Tells the SDK to use this function as the migration function of the contract.
 * The migration function will ignore te existing state.
 * @param _empty - An empty object.
 */
export declare function migrate(_empty: EmptyParameterObject): DecoratorFunction;
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
 * Adds the necessary checks if the function is private or payable.
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
 * The interface that a middleware has to implement in order to be used as a middleware function/class.
 */
interface Middleware<Arguments extends Array<any>> {
    /**
     * The method that gets called with the same arguments that are passed to the function it is wrapping.
     *
     * @param args - Arguments that will be passed to the function - immutable.
     */
    (...args: Arguments): void;
}
/**
 * Tells the SDK to apply an array of passed in middleware to the function execution.
 *
 * @param middlewares - The middlewares to be executed.
 */
export declare function middleware<Arguments extends Array<any>>(...middlewares: Middleware<Arguments>[]): DecoratorFunction;
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
    serializer?(value: unknown): Uint8Array;
    deserializer?(value: Uint8Array): unknown;
}): any;
declare module "./" {
    /**
     * A macro that reads the WASM code from the specified path at compile time.
     *
     * @param pathToWasm - The path to the WASM file to read code from.
     */
    function includeBytes(pathToWasm: string): Uint8Array;
}
export {};
