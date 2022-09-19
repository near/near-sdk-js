export declare function initialize({}: {}): (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => void;
export declare function call({ privateFunction, payableFunction, }: {
    privateFunction?: boolean;
    payableFunction?: boolean;
}): (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => void;
export declare function view({}: {}): (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => void;
export declare function NearBindgen({ requireInit, }: {
    requireInit?: boolean;
}): <T extends new (...args: any[]) => {}>(target: T) => {
    new (...args: any[]): {};
    _create(): {};
    _getState(): Object;
    _saveToStorage(obj: Object): void;
    _getArgs(): JSON;
    _serialize(value: Object): string;
    _deserialize(value: string): Object;
    _reconstruct(classObject: any, plainObject: JSON): any;
    _requireInit(): boolean;
} & T;
