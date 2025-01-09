import { evaluateSync } from "./fhirpath";
import { ResourceType } from "../types";
import { Effect, Match } from "effect";

export const makeHeaders = (token: string | undefined) => Match.value(token).pipe(
  Match.when(undefined, () => ({ "Content-Type": "application/json+fhir" })),
  Match.when(Match.string, () => ({ "Content-Type": "application/json+fhir", "Authorization": `Bearer ${token}` })),
  Match.exhaustive
);

export const fetchOne = (
  baseAddress: string,
  resourceType: ResourceType,
  resourceId: string,
  token?: string,
) =>
  Effect.tryPromise(() =>
    fetch(`${baseAddress}/${resourceType}/${resourceId}`, {
      headers: makeHeaders(token),
    }),
  );

export function findOne(bundle: unknown, logicalId: string) {
  const result = evaluateSync(bundle, `Bundle.entry.resource.where(id = '${logicalId}')`);
  return result;
}
