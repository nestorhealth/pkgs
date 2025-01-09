import type { ResourceType } from "../types";
import { Array } from "effect";

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
