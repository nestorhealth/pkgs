import { evaluateSync } from "./src/fhirpath";
import * as F from "fhirpath/fhir-context/r4";
import { Array, pipe } from "effect";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const readJson = (filepath: string) => {
  return pipe(
    readFileSync(filepath, "utf8"),
    JSON.parse
  );
}

const walkToCodes = (valueset: unknown) =>
  evaluateSync(valueset, "ValueSet.compose.include.concept.code");

// @ts-ignore
const path2Type: Record<string, string> = F.default.path2Type;

// Read and process FHIR resource types
const rts = readJson("static/ValueSet/resource-types.json");
const codes = walkToCodes(rts);

const RESOURCE_TYPES = pipe(codes, Array.dedupe);
const FHIR_TYPES: string[] = pipe(path2Type, Object.values, Array.dedupe);

// Partition FHIR types into complex and primitive types
const [COMPLEX_TYPES, PRIMITIVE_TYPES] = Array.partition(FHIR_TYPES, (fhirType) =>
  fhirType.charAt(0).toLowerCase() === fhirType.charAt(0) ||
  fhirType.split(".").length === 2
);

// Generate type union string
const typeUnion = (
  typeName: string,
  values: string[],
  unionWith: string[] = []
) =>
  `export type ${typeName} = ${[
    ...unionWith,
    ...values.map((value) => `"${value}"`),
  ].join(" | ")};\n`;

// Generate string literal array
const stringLiteralArray = (variableName: string, values: string[]) =>
  `export const ${variableName} = [${values.map((value) => `"${value}"`).join(",")}] as const;\n`;

// Define file paths
const typesFilePath = resolve(import.meta.dirname, "./types.ts");
const constantsFilePath = resolve(import.meta.dirname, "./constants.ts");

// Write types file
writeFileSync(
  typesFilePath,
  [
    typeUnion("PrimitiveType", PRIMITIVE_TYPES),
    typeUnion("ComplexType", COMPLEX_TYPES),
    typeUnion("FHIRType", [], ["PrimitiveType", "ComplexType"]),
    typeUnion("ResourceType", RESOURCE_TYPES),
  ].join("\n"),
  "utf8"
);

// Write constants file
writeFileSync(
  constantsFilePath,
  [
    stringLiteralArray("RESOURCE_TYPES", RESOURCE_TYPES),
    stringLiteralArray("FHIR_TYPES", FHIR_TYPES),
    stringLiteralArray("PRIMITIVE_TYPES", PRIMITIVE_TYPES),
    stringLiteralArray("COMPLEX_TYPES", COMPLEX_TYPES),
  ].join("\n"),
  "utf8"
);

console.log(`Files written:\n- ${typesFilePath}\n- ${constantsFilePath}`);

