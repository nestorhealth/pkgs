import { FHIR_TYPES, PRIMITIVE_TYPES, RESOURCE_TYPES } from "./constants";
import { FHIRType, PrimitiveType, ResourceType } from "./types";

export const isFhirType = (str : string): str is FHIRType =>
  FHIR_TYPES.includes(str as FHIRType);

export const isResourceType = (str: string): str is ResourceType =>
  RESOURCE_TYPES.includes(str as ResourceType);

export const isPrimitiveType = (str: string): str is PrimitiveType =>
  PRIMITIVE_TYPES.includes(str as PrimitiveType);
