export declare function initialize(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function call(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function view(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function NearBindgen<T extends {
    new (...args: any[]): {};
}>(target: T): {
    new (...args: any[]): {};
    _create(): {};
    _getState(): Object;
    _saveToStorage(): void;
    _getArgs(): JSON;
    _serialize(value: Object): string;
    _deserialize(value: string): Object;
} & T;
