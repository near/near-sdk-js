export declare function call(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function view(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function NearBindgen<T extends {
    new (...args: any[]): {};
}>(target: T): {
    new (...args: any[]): {
        _default(): {};
    };
    _init(): {};
    _get(): any;
} & T;
