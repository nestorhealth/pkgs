import { FHIRType, PrimitiveType, ResourceType } from "./types";
export declare const isFhirType: (str: string) => str is FHIRType;
export declare const isResourceType: (str: string) => str is ResourceType;
export declare const isPrimitiveType: (str: string) => str is PrimitiveType;
