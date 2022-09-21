declare type EmptyParameterObject = Record<never, never>;
declare type AnyObject = Record<string, unknown>;
declare type AnyFunction = (...args: unknown[]) => unknown;
export declare function initialize(_empty: EmptyParameterObject): (_target: unknown, _key: string | symbol, _descriptor: TypedPropertyDescriptor<AnyFunction>) => void;
export declare function call({ privateFunction, payableFunction, }: {
    privateFunction?: boolean;
    payableFunction?: boolean;
}): (_target: unknown, _key: string | symbol, descriptor: TypedPropertyDescriptor<AnyFunction>) => void;
export declare function view(_empty: EmptyParameterObject): (_target: unknown, _key: string | symbol, _descriptor: TypedPropertyDescriptor<AnyFunction>) => void;
export declare function NearBindgen({ requireInit, serializer, deserializer, }: {
    requireInit?: boolean;
    serializer?(value: unknown): string;
    deserializer?(value: string): unknown;
}): <T extends new (...args: any[]) => any>(target: T) => {
    new (...args: any[]): {
        [x: string]: any;
    };
    _create(): any;
    _getState(): unknown | null;
    _saveToStorage(objectToSave: unknown): void;
    _getArgs(): unknown;
    _serialize(value: unknown, forReturn?: boolean): string;
    _deserialize(value: string): unknown;
    _reconstruct(classObject: object, plainObject: AnyObject): object;
    _requireInit(): boolean;
} & T;
declare module "./" {
    function includeBytes(pathToWasm: string): string;
}
export {};
