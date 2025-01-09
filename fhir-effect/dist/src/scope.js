import { Array } from "effect";
export function encodeScope(resources, { init = "", type = "read", userType = "system" } = {}) {
    return Array.dedupe(resources).reduce((acc, resourceType) => {
        return acc += " " + `${userType}/${resourceType}.${type}`;
    }, init).trim();
}
