import type { ResourceType } from "@/packages/fhir-effect/types";
import { Array } from "effect";

export const decodeScopeToResources = (scope : string, type : "read" | "write") => scope
  .split(" ")
  .filter(string => string.includes("/"))
  .map(scopeString => scopeString.substring(5, type === "read" ? scopeString.length - 5 : scopeString.length - 6))
  .join(" ");

interface EncodeScopeFromResourcesArgs {
  resources : Set<ResourceType>;
  userType : "user" | "patient" | "system";
  type : "read" | "write";
  baseScope ?: string;
}
export function fromResourceSet({
  resources,
  type,
  userType,
  baseScope
} : EncodeScopeFromResourcesArgs) {
  return resources
    .values()
    .toArray()
    .reduce(
      (acc, resource) => acc += `${userType}/${resource}.${type}` + " "
    , baseScope || "")
    .trim();
}

/** 
 * Precondition: a scope string must exclusively have "*.read" or ".write"
 * permissions encoded.
 * @param scope - the encoded scope string
 * @returns "read" | "write"
 */
export const getScopeType = (scope : string) : "read" | "write" =>
  scope.includes(".read") ? "read" : "write"

interface EncodeScopeOptions {
  userType ?: "user" | "patient" | "system";
  type ?: "read" | "write";
  init ?: string;
}
export function encodeScope(resources : ResourceType[], {
  init = "",
  type = "read",
  userType = "system"
} : EncodeScopeOptions = {}) {
  return Array.dedupe(resources).reduce((acc, resourceType) => {
    return acc += " " + `${userType}/${resourceType}.${type}`
  }, init).trim();
}
