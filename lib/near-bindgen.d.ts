declare type EmptyParameterObject = Record<never, never>;
export declare function initialize(_empty: EmptyParameterObject): (_target: any, _key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>) => void;
export declare function call({ privateFunction, payableFunction, }: {
    privateFunction?: boolean;
    payableFunction?: boolean;
}): (_target: any, _key: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => void;
export declare function view(_empty: EmptyParameterObject): (_target: any, _key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>) => void;
export declare function NearBindgen({ requireInit, }: {
    requireInit?: boolean;
}): <T extends new (...args: any[]) => any>(target: T) => {
    new (...args: any[]): {
        [x: string]: any;
    };
    _create(): any;
    _getState(): any;
    _saveToStorage(obj: Object): void;
    _getArgs(): JSON;
    _serialize(value: Object): string;
    _deserialize(value: string): Object;
    _reconstruct(classObject: any, plainObject: JSON): any;
    _requireInit(): boolean;
} & T;
declare module "./" {
    function includeBytes(pathToWasm: string): string;
}
export {};
