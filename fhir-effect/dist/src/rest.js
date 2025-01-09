import { evaluateSync } from "./fhirpath";
import { Effect, Match } from "effect";
export const makeHeaders = (token) => Match.value(token).pipe(Match.when(undefined, () => ({ "Content-Type": "application/json+fhir" })), Match.when(Match.string, () => ({ "Content-Type": "application/json+fhir", "Authorization": `Bearer ${token}` })), Match.exhaustive);
export const fetchOne = (baseAddress, resourceType, resourceId, token) => Effect.tryPromise(() => fetch(`${baseAddress}/${resourceType}/${resourceId}`, {
    headers: makeHeaders(token),
}));
export function findOne(bundle, logicalId) {
    const result = evaluateSync(bundle, `Bundle.entry.resource.where(id = '${logicalId}')`);
    return result;
}
