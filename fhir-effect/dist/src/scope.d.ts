import type { ResourceType } from "../types";
interface EncodeScopeOptions {
    userType?: "user" | "patient" | "system";
    type?: "read" | "write";
    init?: string;
}
export declare function encodeScope(resources: ResourceType[], { init, type, userType }?: EncodeScopeOptions): string;
export {};
