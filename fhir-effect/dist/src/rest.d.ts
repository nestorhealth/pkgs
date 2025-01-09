import { ResourceType } from "../types";
import { Effect } from "effect";
export declare const makeHeaders: (token: string | undefined) => {
    "Content-Type": string;
} | {
    "Content-Type": string;
    Authorization: string;
};
export declare const fetchOne: (baseAddress: string, resourceType: ResourceType, resourceId: string, token?: string) => Effect.Effect<Response, import("effect/Cause").UnknownException, never>;
export declare function findOne(bundle: unknown, logicalId: string): any[];
