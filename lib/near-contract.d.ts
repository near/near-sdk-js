declare enum StateSource {
    CONTRACT = 0,
    DEFAULT = 1
}
export declare abstract class NearContract {
    deserialize(): StateSource;
    serialize(): void;
    static deserializeArgs(): any;
    static serializeReturn(ret: any): string;
    abstract default(): any;
}
export {};
