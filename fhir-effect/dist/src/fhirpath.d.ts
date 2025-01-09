import { Model } from "fhirpath";
import { ComplexType, ResourceType, FHIRType } from "../types";
import { HashSet } from "effect";
interface TypedModel extends Model {
    path2Type: Record<string, FHIRType>;
}
export declare const R4Model: TypedModel;
export declare const CHOICE_PATHS: string[];
export declare const ALL_PATHS: string[];
export declare function evaluateSync(data: unknown, pathexpr: string): any[];
export interface PathRelation {
    path: string;
    parent: string;
}
export declare function normalizePathRelations(pathRelations: HashSet.HashSet<PathRelation>, rootPath: string): string[];
export declare function flatLeaves(fhirType: ComplexType, parentPath: string): HashSet.HashSet<PathRelation>;
export declare function isValidPath(path: string, resourceType: ResourceType): boolean;
export {};
