export declare abstract class NearContract {
    deserialize(): void;
    serialize(): void;
    static deserializeArgs(): any;
    static serializeReturn(ret: any): string;
    abstract default(): any;
}
