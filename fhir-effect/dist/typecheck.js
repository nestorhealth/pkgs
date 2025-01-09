import { FHIR_TYPES, PRIMITIVE_TYPES, RESOURCE_TYPES } from "./constants";
export const isFhirType = (str) => FHIR_TYPES.includes(str);
export const isResourceType = (str) => RESOURCE_TYPES.includes(str);
export const isPrimitiveType = (str) => PRIMITIVE_TYPES.includes(str);
